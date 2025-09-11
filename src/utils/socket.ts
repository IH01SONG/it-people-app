/**
 * Socket.IO 클라이언트 유틸리티
 * 실시간 채팅 및 알림을 위한 Socket.IO 연결 관리
 * 개발 모드에서는 목 소켓을 사용할 수 있습니다.
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env?.VITE_SOCKET_URL || 'https://it-people-server-140857839854.asia-northeast3.run.app';

interface SocketEvents {
  // 연결 관련
  register: (userId: string) => void;
  joinChatRoom: (roomId: string) => void;
  leaveChatRoom: (roomId: string) => void;
  
  // 메시지 관련
  sendMessage: (data: {
    roomId: string;
    content: string;
    type: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }) => void;
  
  // 타이핑 상태
  typing: (data: {
    roomId: string;
    userId: string;
    isTyping: boolean;
  }) => void;
  
  // 메시지 읽음 처리
  messageRead: (data: {
    roomId: string;
    messageId: string;
    userId: string;
  }) => void;
}

interface SocketListeners {
  // 메시지 수신
  newMessage: (messageData: any) => void;
  
  // 알림
  newChatNotification: (data: any) => void;
  newJoinRequest: (requestData: any) => void;
  requestAccepted: (data: any) => void;
  requestRejected: (data: any) => void;
  
  // 사용자 상태
  userJoined: (data: any) => void;
  userLeft: (data: any) => void;
  userTyping: (data: any) => void;
  
  // 메시지 읽음 상태
  messageReadUpdate: (data: any) => void;
  
  // 연결 상태
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
}

class SocketManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private userId: string | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    // 기본 연결 이벤트 리스너
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.notifyListeners('connect', undefined);
      
      // 재연결 시 사용자 재등록
      if (this.userId) {
        this.register(this.userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.notifyListeners('disconnect', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.notifyListeners('connect_error', error);
    });
  }

  // 사용자 등록
  register(userId: string) {
    if (!this.socket || !userId) return;
    
    this.userId = userId;
    this.socket.emit('register', userId);
    console.log('User registered:', userId);
  }

  // 채팅방 참여
  joinChatRoom(roomId: string) {
    if (!this.socket || !this.isConnected) return;
    
    this.socket.emit('joinChatRoom', roomId);
    console.log('Joined chat room:', roomId);
  }

  // 채팅방 나가기
  leaveChatRoom(roomId: string) {
    if (!this.socket || !this.isConnected) return;
    
    this.socket.emit('leaveChatRoom', roomId);
    console.log('Left chat room:', roomId);
  }

  // 메시지 전송 (Socket.IO를 통한 직접 전송)
  sendMessage(data: {
    roomId: string;
    content: string;
    type: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }) {
    if (!this.socket || !this.isConnected) return;
    
    this.socket.emit('sendMessage', data);
  }

  // 타이핑 상태 전송
  sendTyping(roomId: string, isTyping: boolean) {
    if (!this.socket || !this.isConnected || !this.userId) return;
    
    this.socket.emit('typing', {
      roomId,
      userId: this.userId,
      isTyping
    });
  }

  // 메시지 읽음 처리
  markMessageAsRead(roomId: string, messageId: string) {
    if (!this.socket || !this.isConnected || !this.userId) return;
    
    this.socket.emit('messageRead', {
      roomId,
      messageId,
      userId: this.userId
    });
  }

  // 이벤트 리스너 추가
  on<K extends keyof SocketListeners>(event: K, callback: SocketListeners[K]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Socket.IO 리스너 등록
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // 이벤트 리스너 제거
  off<K extends keyof SocketListeners>(event: K, callback?: SocketListeners[K]) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      if (callback) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      } else {
        eventListeners.length = 0;
      }
    }

    // Socket.IO 리스너 제거
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.removeAllListeners(event);
      }
    }
  }

  // 리스너들에게 이벤트 알림
  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // 연결 상태 확인
  get connected() {
    return this.isConnected && this.socket?.connected;
  }

  // 소켓 ID 가져오기
  get socketId() {
    return this.socket?.id;
  }

  // 연결 해제
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
    }
  }

  // 재연결
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.initializeSocket();
    }
  }
}

// 싱글톤 인스턴스 - 개발 모드에서는 목 소켓 사용
const socketManager = new SocketManager();

export default socketManager;
export { SocketManager };
export type { SocketEvents, SocketListeners };
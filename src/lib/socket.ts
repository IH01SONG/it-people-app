import { io, Socket } from "socket.io-client";

// 소켓 서버 URL (API URL에서 /api 제거)
const rawApiUrl = (import.meta as any).env?.VITE_API_URL || "https://it-people-server-140857839854.asia-northeast3.run.app";
const normalizedApiUrl = rawApiUrl.replace(/\/api$/, "").replace(/\/$/, "");
const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || normalizedApiUrl;

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  timestamp: string;
  readBy: string[];
}

export interface ChatRoom {
  id: string;
  name?: string;
  participants: string[];
  type: 'direct' | 'group';
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TypingData {
  roomId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export function createSocket(getToken: () => string | null): Socket {
  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: (cb) => cb({ token: getToken() }),
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("[socket] connected:", socket.id);
  });

  socket.on("connect_error", (e) => {
    console.error("[socket] connect_error:", e.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("[socket] disconnected:", reason);
  });

  return socket;
}

/**
 * 채팅용 소켓 이벤트 헬퍼 클래스
 */
export class ChatSocketManager {
  private socket: Socket;
  private userId: string | null = null;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  // 사용자 등록
  register(userId: string) {
    this.userId = userId;
    this.socket.emit('register', userId);
    console.log('[socket] 사용자 등록:', userId);
  }

  // 채팅방 참여
  joinRoom(roomId: string) {
    this.socket.emit('joinChatRoom', roomId);
    console.log('[socket] 채팅방 참여:', roomId);
  }

  // 채팅방 나가기
  leaveRoom(roomId: string) {
    this.socket.emit('leaveChatRoom', roomId);
    console.log('[socket] 채팅방 나가기:', roomId);
  }

  // 메시지 전송
  sendMessage(data: {
    roomId: string;
    content: string;
    type?: 'text' | 'image' | 'file';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }) {
    this.socket.emit('sendMessage', data);
    console.log('[socket] 메시지 전송:', data);
  }

  // 타이핑 상태 전송
  sendTyping(roomId: string, isTyping: boolean) {
    if (!this.userId) return;
    
    this.socket.emit('typing', {
      roomId,
      userId: this.userId,
      isTyping,
    });
  }

  // 메시지 수신 리스너 등록
  onReceiveMessage(callback: (message: ChatMessage) => void) {
    this.socket.on('receiveMessage', callback);
  }

  // 타이핑 상태 수신 리스너 등록
  onUserTyping(callback: (data: TypingData) => void) {
    this.socket.on('userTyping', callback);
  }

  // 사용자 온라인 상태 수신 리스너 등록
  onUserOnline(callback: (userId: string) => void) {
    this.socket.on('userOnline', callback);
  }

  // 사용자 오프라인 상태 수신 리스너 등록
  onUserOffline(callback: (userId: string) => void) {
    this.socket.on('userOffline', callback);
  }

  // 채팅방 업데이트 수신 리스너 등록
  onRoomUpdated(callback: (room: ChatRoom) => void) {
    this.socket.on('roomUpdated', callback);
  }

  // 에러 수신 리스너 등록
  onError(callback: (error: { message: string; code?: string }) => void) {
    this.socket.on('error', callback);
  }

  // 모든 리스너 제거
  removeAllListeners() {
    this.socket.removeAllListeners();
  }

  // 특정 이벤트 리스너 제거
  removeListener(event: string, callback?: (...args: any[]) => void) {
    this.socket.off(event, callback);
  }

  // 소켓 연결 상태 확인
  isConnected(): boolean {
    return this.socket.connected;
  }

  // 수동으로 연결
  connect() {
    this.socket.connect();
  }

  // 수동으로 연결 해제
  disconnect() {
    this.socket.disconnect();
  }
}

/**
 * 전역 채팅방 참여 (모든 사용자가 참여하는 공통 채팅방)
 */
export function joinGlobalRoom(socket: Socket) {
  socket.emit('joinRoom', { roomId: 'global' });
}

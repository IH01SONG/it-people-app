import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'https://it-people-server-140857839854.asia-northeast3.run.app';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      this.socket = io(SERVER_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket.IO 연결 성공:', this.socket?.id);

        if (this.userId) {
          this.registerUser(this.userId);
        }

        resolve(this.socket!);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket.IO 연결 해제:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('💥 Socket.IO 연결 오류:', error);
        reject(error);
      });

      this.setupNotificationListeners();
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      console.log('🔌 Socket.IO 연결 종료');
    }
  }

  registerUser(userId: string) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket이 연결되지 않았습니다. 사용자 등록을 건너뜁니다.');
      return;
    }

    this.userId = userId;
    this.socket.emit('register', userId);
    console.log('👤 사용자 등록:', userId);
  }

  private setupNotificationListeners() {
    if (!this.socket) return;

    this.socket.on('notification', (notification) => {
      console.log('📢 새 알림 수신:', notification);
      this.handleNotification(notification);
    });

    this.socket.on('join_request_approved', (data) => {
      console.log('✅ 참여 승인 알림:', data);
      this.handleJoinApproved(data);
    });

    this.socket.on('join_request_rejected', (data) => {
      console.log('❌ 참여 거절 알림:', data);
      this.handleJoinRejected(data);
    });

    this.socket.on('new_join_request', (data) => {
      console.log('🙋 새 참여 요청 알림:', data);
      this.handleNewJoinRequest(data);
    });
  }

  private handleNotification(notification: any) {
    const { type, title, message, data } = notification;

    switch (type) {
      case 'join_request':
        this.showNotificationToast({
          title: title || '새 참여 요청',
          message: message || '새로운 참여 요청이 있습니다.',
          type: 'info',
          data
        });
        break;

      case 'join_request_approved':
        this.showNotificationToast({
          title: title || '참여 승인됨',
          message: message || '참여 요청이 승인되었습니다!',
          type: 'success',
          data
        });
        break;

      case 'join_request_rejected':
        this.showNotificationToast({
          title: title || '참여 거절됨',
          message: message || '참여 요청이 거절되었습니다.',
          type: 'warning',
          data
        });
        break;

      default:
        this.showNotificationToast({
          title: title || '알림',
          message: message || '새 알림이 있습니다.',
          type: 'info',
          data
        });
    }
  }

  private handleJoinApproved(data: any) {
    const { postTitle, chatRoomId, responseMessage } = data;

    this.showNotificationToast({
      title: '🎉 참여 승인됨!',
      message: `"${postTitle}" 모임에 참여가 승인되었습니다!`,
      type: 'success',
      data,
      actions: [
        {
          text: '채팅방 입장',
          action: () => {
            if (chatRoomId) {
              window.location.href = `/chat/${chatRoomId}`;
            }
          }
        }
      ]
    });

    if (responseMessage) {
      setTimeout(() => {
        alert(`모임장 메시지: ${responseMessage}`);
      }, 1000);
    }
  }

  private handleJoinRejected(data: any) {
    const { postTitle, responseMessage } = data;

    this.showNotificationToast({
      title: '😢 참여 거절됨',
      message: `"${postTitle}" 모임 참여가 거절되었습니다.`,
      type: 'warning',
      data
    });

    if (responseMessage) {
      setTimeout(() => {
        alert(`모임장 메시지: ${responseMessage}`);
      }, 1000);
    }
  }

  private handleNewJoinRequest(data: any) {
    const { postTitle, requesterName } = data;

    this.showNotificationToast({
      title: '🙋 새 참여 요청',
      message: `"${postTitle}" 모임에 ${requesterName}님이 참여를 신청했습니다.`,
      type: 'info',
      data,
      actions: [
        {
          text: '요청 확인',
          action: () => {
            window.location.href = '/my-activities';
          }
        }
      ]
    });
  }

  private showNotificationToast({ title, message, type, data, actions }: {
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'error';
    data?: any;
    actions?: Array<{ text: string; action: () => void }>;
  }) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: type
      });

      notification.onclick = () => {
        if (actions && actions.length > 0) {
          actions[0].action();
        }
        notification.close();
      };
    }

    const notificationEvent = new CustomEvent('socket-notification', {
      detail: { title, message, type, data, actions }
    });
    window.dispatchEvent(notificationEvent);
  }

  joinChatRoom(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('joinChatRoom', roomId);
      console.log('💬 채팅방 입장:', roomId);
    }
  }

  leaveChatRoom(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leaveChatRoom', roomId);
      console.log('🚪 채팅방 나가기:', roomId);
    }
  }

  sendTyping(roomId: string, isTyping: boolean) {
    if (this.socket?.connected && this.userId) {
      this.socket.emit('typing', {
        roomId,
        userId: this.userId,
        isTyping
      });
    }
  }

  onReceiveMessage(callback: (messageData: any) => void) {
    if (this.socket) {
      this.socket.on('receiveMessage', callback);
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  offReceiveMessage() {
    if (this.socket) {
      this.socket.off('receiveMessage');
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off('userTyping');
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;

// 기존 호환성을 위한 함수
export function createSocket(getToken: () => string | null) {
  return socketService.getSocket();
}

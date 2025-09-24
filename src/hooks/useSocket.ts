import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { createSocket } from '../lib/socket';
import type { Notification } from '../types/home.types';

type SocketType = ReturnType<typeof io>;

export function useSocket() {
  const socketRef = useRef<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newNotification, setNewNotification] = useState<Notification | null>(null);

  // 토큰 가져오기 함수
  const getToken = () => localStorage.getItem('access_token');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.log('[useSocket] 토큰이 없어서 소켓 연결을 생략합니다.');
      return;
    }

    // 소켓 연결 생성
    const socket = createSocket(getToken);
    if (!socket) {
      console.log('[useSocket] 소켓 생성 실패');
      return;
    }

    socketRef.current = socket;

    // 연결 상태 이벤트
    socket.on('connect', () => {
      console.log('[useSocket] 소켓 연결됨:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[useSocket] 소켓 연결 해제됨');
      setIsConnected(false);
    });

    socket.on('connect_error', (error: unknown) => {
      console.error('[useSocket] 연결 오류:', error);
      setIsConnected(false);
    });

    // 실시간 알림 수신
    socket.on('notification', (notification: Notification) => {
      console.log('[useSocket] 새 알림 수신:', notification);
      setNewNotification(notification);

      // 브라우저 알림도 표시
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id, // 중복 방지
        });
      }
    });

    // 참여 요청 상태 업데이트
    socket.on('join_request_update', (data: { requestId: string; status: string; postId: string }) => {
      console.log('[useSocket] 참여 요청 상태 업데이트:', data);
      // 이 이벤트를 통해 참여 요청 상태가 변경되었음을 알 수 있음
    });

    // 채팅 메시지 (나중에 구현시)
    socket.on('chat_message', (data: any) => {
      console.log('[useSocket] 새 채팅 메시지:', data);
    });

    // 정리
    return () => {
      console.log('[useSocket] 소켓 연결 정리');
      socket.disconnect();
      setIsConnected(false);
    };
  }, []); // 한 번만 실행

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('[useSocket] 브라우저 알림 권한:', permission);
      return permission === 'granted';
    }
    return false;
  };

  // 새 알림 읽음 처리
  const clearNewNotification = () => {
    setNewNotification(null);
  };

  // 수동으로 이벤트 emit (테스트용)
  const emitEvent = (eventName: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(eventName, data);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    newNotification,
    clearNewNotification,
    requestNotificationPermission,
    emitEvent,
  };
}
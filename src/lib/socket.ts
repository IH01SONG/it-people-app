import io from 'socket.io-client';

// 소켓 서버 URL 설정 (백엔드 서버와 동일한 URL 사용)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function createSocket(getToken: () => string | null) {
  const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: (cb: any) => cb({ token: getToken() }), // 서버: handshake.auth.token
  });

  socket.on('connect', () => {
    console.log('[socket] connected:', socket.id);
  });

  socket.on('connect_error', (e: any) => {
    console.error('[socket] connect_error:', e.message);
  });

  return socket;
}

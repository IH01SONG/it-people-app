import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string;

export function createSocket(getToken: () => string | null): Socket {
  const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: (cb) => cb({ token: getToken() }), // 서버: handshake.auth.token
    withCredentials: true, // 쿠키 인증 시
  });

  socket.on('connect', () => {
    console.log('[socket] connected:', socket.id);
  });

  socket.on('connect_error', (e) => {
    console.error('[socket] connect_error:', e.message);
  });

  return socket;
}

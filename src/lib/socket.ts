import { io, Socket } from "socket.io-client";

const rawApiUrl =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8080/";
const normalizedApiUrl = rawApiUrl.replace(/\/$/, "");
const fallbackSocketUrl = normalizedApiUrl; // 소켓은 /api 경로가 아닐 수 있어 루트 사용
const SOCKET_URL =
  (import.meta as any).env?.VITE_SOCKET_URL || fallbackSocketUrl;

export function createSocket(getToken: () => string | null): Socket {
  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: (cb) => cb({ token: getToken() }), // 서버: handshake.auth.token
    withCredentials: true, // 쿠키 인증 시
  });

  socket.on("connect", () => {
    console.log("[socket] connected:", socket.id);
  });

  socket.on("connect_error", (e) => {
    console.error("[socket] connect_error:", e.message);
  });

  return socket;
}

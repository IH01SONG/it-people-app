import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

const TARGET = "https://it-people-server-140857839854.asia-northeast3.run.app";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: TARGET,
        changeOrigin: true,
        secure: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            // 🔧 서버의 Origin/CSRF 자체체크 우회: Origin/Referer를 타깃으로 통일
            proxyReq.setHeader("origin", TARGET);
            proxyReq.setHeader("referer", TARGET + "/");
            // 필요 시, Authorization 유지
          });
          proxy.on("error", (err) => {
            console.log("❌ Proxy error:", err?.message || err);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("✅ Response ←", proxyRes.statusCode, req.method, req.url);
          });
        },
      },

      // (선택) 소켓 쓰면 같이 프록시
      "/socket.io": {
        target: TARGET,
        ws: true,
        changeOrigin: true,
        secure: true,
        configure: (proxy) => {
          proxy.on("error", (err) => console.log("❌ WS Proxy error:", err?.message || err));
        },
      },
    },
  },
});

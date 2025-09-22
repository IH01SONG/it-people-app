import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

const TARGET = "https://it-people-server-140857839854.asia-northeast3.run.app";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true, // 외부 접근 허용
    proxy: {
      "/api": {
        target: TARGET,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // 경로 유지
        configure: (proxy: any) => {
          proxy.on("proxyReq", (proxyReq: any, req: any) => {
            // CORS 헤더 설정
            proxyReq.setHeader("origin", TARGET);
            proxyReq.setHeader("referer", TARGET + "/");
            proxyReq.setHeader("host", new URL(TARGET).host);
            
            // 요청 로깅
            console.log("🔄 Proxy Request →", req.method, req.url, "→", TARGET + req.url);
          });
          
          proxy.on("error", (err: any, req: any) => {
            console.error("❌ Proxy error:", err?.message || err, "for", req?.url);
          });
          
          proxy.on("proxyRes", (proxyRes: any, req: any) => {
            // CORS 헤더 추가
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
            
            console.log("✅ Proxy Response ←", proxyRes.statusCode, req.method, req.url);
          });
        },
      },

      // 소켓 프록시
      "/socket.io": {
        target: TARGET,
        ws: true,
        changeOrigin: true,
        secure: true,
        configure: (proxy: any) => {
          proxy.on("error", (err: any) => console.error("❌ WS Proxy error:", err?.message || err));
        },
      },
    },
  },
  // 환경 변수 기본값 설정
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('/api'),
  },
});

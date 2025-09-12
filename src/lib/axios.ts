// src/lib/axios.ts
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL, // ✅ '/api'
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 토큰을 즉시 설정할 수 있는 함수 추가
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("access_token");
  if (t) {
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = `Bearer ${t}`;
  }
  // 디버깅: 최종 URL 확인
  console.debug("[API]", (cfg.method || "get").toUpperCase(), (cfg.baseURL || "") + (cfg.url || ""));
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[API ERROR]", err?.response?.status, err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;

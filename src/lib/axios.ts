// src/lib/axios.ts
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL, // ✅ '/api'
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

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

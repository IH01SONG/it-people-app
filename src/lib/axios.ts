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
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status !== 404) {
      console.error("API 오류:", err?.response?.status, err?.response?.data || err.message);
    }
    
    // 401 Unauthorized 에러 처리
    if (err?.response?.status === 401) {
      // 토큰이 유효하지 않은 경우 localStorage에서 제거
      localStorage.removeItem('access_token');
      delete api.defaults.headers.common['Authorization'];
      
      // 현재 페이지가 보호된 라우트인 경우에만 로그인 페이지로 리다이렉트
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(err);
  }
);

export default api;

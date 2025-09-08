import axios from 'axios';

// 백엔드 서버 URL 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
  withCredentials: true, // 쿠키 인증이면 true
  headers: {
    'Content-Type': 'application/json',
  },
});

// (선택) 요청 인터셉터: JWT 자동 첨부
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터: 401 등 공통 처리
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // 토큰 만료 시 로그인 페이지로 리다이렉트
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    
    // 네트워크 에러 로깅
    if (err.code === 'ECONNABORTED') {
      console.error('요청 시간 초과:', err.message);
    } else if (err.response) {
      console.error('서버 응답 에러:', err.response.status, err.response.data);
    } else {
      console.error('네트워크 에러:', err.message);
    }
    
    return Promise.reject(err);
  }
);

export default instance;
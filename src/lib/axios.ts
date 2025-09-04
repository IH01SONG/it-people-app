import axios from 'axios';

// 환경 변수에서 API URL을 가져와서 사용하도록 수정합니다.
// .env 파일에 VITE_API_URL=https://it-people-server-140857839854.asia-northeast3.run.app/api 로 설정해야 합니다.
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 쿠키 인증이면 true
});

// (선택) 요청 인터셉터: JWT 자동 첨부
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// (선택) 응답 인터셉터: 401 등 공통 처리
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // 예: 토큰 만료 시 처리
      // window.location.href = '/login';
    }
    console.error("Network Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default instance;
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
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("access_token");
  if (t) {
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = `Bearer ${t}`;
  }

  // 참여 관련 API 호출 시 상세 로깅
  if (cfg.url?.includes("/join")) {
    console.log("🌐 [Axios Interceptor] 참여 API 요청 감지:");
    console.log("📝 실제 HTTP 메소드:", cfg.method?.toUpperCase());
    console.log("🔗 실제 요청 URL:", cfg.url);
    console.log("📋 요청 헤더:", cfg.headers);
    console.log("📦 요청 데이터:", cfg.data);
  }

  // 가이드 3번: POST /posts/ 전용 강력 로그
  if (
    cfg.method?.toUpperCase() === "POST" &&
    /\/posts\/[^/]+\/request$/.test(cfg.url ?? "")
  ) {
    console.log("🚀 [REQ] POST", cfg.url, "data=", cfg.data);
  }

  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log(err);
    // 가이드 4번: POST /posts/*/request 에러 상세 로그 (체크리스트 강화)
    const { config, response } = err || {};
    if (
      config?.method?.toUpperCase() === "POST" &&
      /\/posts\/[^/]+\/request$/.test(config?.url ?? "")
    ) {
      console.error("🛑 [HTTP ERR] POST /posts/*/request 실패:", {
        url: config?.url,
        method: config?.method,
        status: response?.status,
        statusText: response?.statusText,
        errorBody: response?.data, // ✅ 서버 원문
        errorMessage: response?.data?.message || err.message,
        requestBody: config?.data, // 요청 바디도 포함
        headers: response?.headers,
        timestamp: new Date().toISOString(),
      });
    }

    if (err?.response?.status !== 404) {
      console.error(
        "API 오류:",
        err?.response?.status,
        err?.response?.data || err.message
      );
    }

    // 401 Unauthorized 에러 처리
    if (err?.response?.status === 401) {
      // 토큰이 유효하지 않은 경우 localStorage에서 제거
      localStorage.removeItem("access_token");
      delete api.defaults.headers.common["Authorization"];

      // 현재 페이지가 보호된 라우트인 경우에만 로그인 페이지로 리다이렉트
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/signup"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;

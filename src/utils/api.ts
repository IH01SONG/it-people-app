// Lightweight API helper rebuilt (prev file removed)
// NOTE: Keep a single set of variables/exports to avoid redeclare issues

const rawBaseUrlLite =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8080/";
const normalizedLite = rawBaseUrlLite.replace(/\/$/, "");
export const API_BASE_URL = normalizedLite.endsWith("/api")
  ? normalizedLite
  : `${normalizedLite}/api`;

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${txt || res.statusText}`);
  }
  try {
    return await res.json();
  } catch {
    return undefined as unknown as T;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API 유틸리티 함수들
 * 백엔드와의 통신을 위한 기본 설정 및 함수들
 */

// 기본 API 베이스 URL 구성: 환경 변수 우선, 없으면 로컬 개발 기본값 사용
// Keep alias names only for legacy section to avoid redeclare
const rawBaseUrlLegacy =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8080/";
const normalizedBaseUrl = rawBaseUrlLegacy.replace(/\/$/, "");

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * 기본 fetch 래퍼 함수
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // 인증 토큰 가져오기: access_token 우선, 없으면 auth_token, 마지막으로 VITE_TEST_TOKEN
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("auth_token") ||
      (import.meta as any).env?.VITE_TEST_TOKEN ||
      null;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      throw new ApiError(
        `API 요청 실패: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API 호출 에러:", error);
    throw error;
  }
}

// API 함수들
export const api = {
  // 게시글 관련
  posts: {
    // 게시글 목록 조회
    getAll: (params?: {
      page?: number;
      limit?: number;
      location?: string;
      category?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.location) queryParams.append("location", params.location);
      if (params?.category) queryParams.append("category", params.category);

      const query = queryParams.toString();
      return apiCall<{ posts: any[]; total: number; hasMore: boolean }>(
        `/posts${query ? `?${query}` : ""}`
      );
    },

    // 주변 게시글 조회
    getNearby: (lat: number, lng: number, radius: number = 5000) =>
      apiCall<{ posts: any[] }>(
        `/posts/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
      ),

    // 게시글 작성
    create: (postData: any) =>
      apiCall<{ post: any }>("/posts", {
        method: "POST",
        body: JSON.stringify(postData),
      }),

    // 게시글 수정
    update: (postId: string, postData: any) =>
      apiCall<{ post: any }>(`/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify(postData),
      }),

    // 게시글 삭제
    delete: (postId: string) =>
      apiCall<object>(`/posts/${postId}`, {
        method: "DELETE",
      }),

    // 모임 참여 신청
    join: (postId: string) =>
      apiCall<{ success: boolean }>(`/posts/${postId}/join`, {
        method: "POST",
      }),
  },

  // 사용자 관련
  users: {
    // 내 정보 조회
    getMe: () => apiCall<{ user: any }>("/users/me"),

    // 프로필 수정
    updateProfile: (userData: any) =>
      apiCall<{ user: any }>("/users/me", {
        method: "PUT",
        body: JSON.stringify(userData),
      }),

    // 내가 쓴 글
    getMyPosts: () => apiCall<{ posts: any[] }>("/users/me/posts"),

    // 참여한 모임
    getJoinedPosts: () => apiCall<{ posts: any[] }>("/users/me/joined-posts"),

    // 사용자 차단
    blockUser: (userId: string) =>
      apiCall<object>(`/users/block/${userId}`, {
        method: "POST",
      }),

    // 사용자 차단 해제
    unblockUser: (userId: string) =>
      apiCall<object>(`/users/block/${userId}`, {
        method: "DELETE",
      }),
  },

  // 참여 요청 관련
  joinRequests: {
    // 참여 요청 보내기
    create: (postId: string) =>
      apiCall<{ request: any }>(`/join-requests/posts/${postId}/request-join`, {
        method: "POST",
      }),

    // 참여 요청 수락
    accept: (requestId: string) =>
      apiCall<object>(`/join-requests/${requestId}/accept`, {
        method: "POST",
      }),

    // 참여 요청 거절
    reject: (requestId: string) =>
      apiCall<object>(`/join-requests/${requestId}/reject`, {
        method: "POST",
      }),
  },

  // 알림 관련
  notifications: {
    // 알림 목록 조회
    getAll: () => apiCall<{ notifications: any[] }>("/notifications"),

    // 알림 읽음 처리
    markAsRead: (notificationId: string) =>
      apiCall<object>(`/notifications/${notificationId}/read`, {
        method: "POST",
      }),

    // 모든 알림 읽음 처리
    markAllAsRead: () =>
      apiCall<object>("/notifications/read-all", {
        method: "POST",
      }),
  },

  // 인증 관련
  auth: {
    // 로그인
    login: (credentials: { email: string; password: string }) =>
      apiCall<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    // 회원가입
    signup: (userData: { email: string; password: string; nickname: string }) =>
      apiCall<{ token: string; user: any }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(userData),
      }),

    // 로그아웃
    logout: () => {
      localStorage.removeItem("auth_token");
      return Promise.resolve({ success: true });
    },
  },
};

export { ApiError };
export type { ApiResponse };

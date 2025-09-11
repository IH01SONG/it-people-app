/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API 유틸리티 함수들
 * 백엔드와의 통신을 위한 기본 설정 및 함수들
 * 개발 모드에서는 목 데이터를 사용할 수 있습니다.
 */

import { mockApi } from './mockApi';

// 기본 API 베이스 URL 구성: 환경 변수 우선, 없으면 기본 서버 URL 사용
const rawBaseUrl = import.meta.env?.VITE_API_URL || 'https://it-people-server-140857839854.asia-northeast3.run.app/api';
// 말미 슬래시 제거 후 /api 접미사 중복 방지
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");
const API_BASE_URL = normalizedBaseUrl.endsWith("/api")
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`;

const USE_MOCK_DATA = import.meta.env?.VITE_USE_MOCK_DATA === 'true';

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

// API 함수들 - 개발 모드에서는 목 데이터 사용
export const api = USE_MOCK_DATA ? mockApi : {
  // 게시글 관련
  posts: {
    // 게시글 목록 조회
    getAll: (params?: {
      page?: number;
      limit?: number;
      category?: string;
      status?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.category) queryParams.append("category", params.category);
      if (params?.status) queryParams.append("status", params.status);

      const query = queryParams.toString();
      return apiCall<{ posts: any[]; total: number; hasMore: boolean }>(
        `/posts${query ? `?${query}` : ""}`
      );
    },

    // 게시글 상세 조회
    getById: (postId: string) =>
      apiCall<{ post: any }>(`/posts/${postId}`),

    // 게시글 작성
    create: (postData: {
      title: string;
      content: string;
      category: string;
      tags?: string[];
      maxParticipants?: number;
      location?: {
        type: "Point";
        coordinates: [number, number];
        address?: string;
      };
      venue?: string;
      meetingDate?: string;
      images?: string[];
    }) =>
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
      apiCall<{ success: boolean; message: string }>(`/posts/${postId}`, {
        method: "DELETE",
      }),

    // 모임 참여 신청
    join: (postId: string) =>
      apiCall<{ success: boolean }>(`/posts/${postId}/join`, {
        method: "POST",
      }),
  },

  // 사용자 관리
  users: {
    // 내 정보 조회 (인증된 사용자) - 백엔드 응답에서 직접 사용자 객체 반환
    getMe: () => apiCall<any>("/users/me"),

    // 사용자 프로필 조회 (본인)
    getProfile: () => apiCall<any>("/users/me"),

    // 사용자 프로필 수정
    updateProfile: (userData: any) =>
      apiCall<{ user: any }>("/users/profile", {
        method: "PUT",
        body: JSON.stringify(userData),
      }),

    // 다른 사용자 프로필 조회
    getById: (userId: string) =>
      apiCall<{ user: any }>(`/users/${userId}`),
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

  // 채팅 관리
  chat: {
    // 채팅방 목록 조회
    getRooms: () => apiCall<{ rooms: any[] }>('/chat/rooms'),

    // 채팅방 생성
    createRoom: (roomData: { name?: string; participants: string[]; type?: string }) =>
      apiCall<{ room: any }>('/chat/rooms', {
        method: 'POST',
        body: JSON.stringify(roomData),
      }),

    // 특정 채팅방 정보 조회
    getRoom: (roomId: string) => apiCall<{ room: any }>(`/chat/rooms/${roomId}`),

    // 채팅방 메시지 목록 조회
    getMessages: (roomId: string, page: number = 1, limit: number = 50) => 
      apiCall<{ messages: any[]; currentPage: number; totalPages: number; totalCount: number }>
        (`/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`),

    // 메시지 전송 (REST API - 실시간은 Socket.IO 사용)
    sendMessage: (roomId: string, messageData: { 
      content: string; 
      type?: 'text' | 'image' | 'file'; 
      fileUrl?: string; 
      fileName?: string; 
      fileSize?: number 
    }) =>
      apiCall<{ message: any }>(`/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        body: JSON.stringify(messageData),
      }),

    // 채팅방 나가기
    leaveRoom: (roomId: string) =>
      apiCall<{ success: boolean; message: string }>(`/chat/rooms/${roomId}/leave`, {
        method: 'DELETE',
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

  // 인증 관리
  auth: {
    // 회원가입
    signup: (userData: {
      email: string;
      password: string;
      name: string;
      birthDate?: string;
      nickname: string;
      activityRegion?: {
        city: string;
        district: string;
        fullAddress: string;
      };
    }) =>
      apiCall<{ message: string }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(userData),
      }),

    // 로그인
    login: (credentials: { email: string; password: string }) =>
      apiCall<{ token: string; user: any; message: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    // 이메일 중복 확인
    checkEmail: (email: string) =>
      apiCall<{ isAvailable: boolean; isValid: boolean; message: string }>("/auth/check-email", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),

    // 구글 로그인 (브라우저 리다이렉트)
    googleLogin: () => {
      window.location.href = `${API_BASE_URL}/auth/google`;
    },

    // 로그아웃
    logout: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_token");
      return Promise.resolve({ success: true });
    },
  },

  // 카테고리 & 태그
  categories: {
    // 카테고리 목록 조회
    getAll: (params?: { includeInactive?: boolean; parentId?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.includeInactive) queryParams.append("includeInactive", "true");
      if (params?.parentId) queryParams.append("parentId", params.parentId);
      
      const query = queryParams.toString();
      return apiCall<{ categories: any[]; total: number }>(`/categories${query ? `?${query}` : ""}`);
    },

    // 인기 카테고리 조회
    getPopular: (limit: number = 10) =>
      apiCall<{ categories: any[] }>(`/categories/popular?limit=${limit}`),

    // 특정 카테고리 상세 조회
    getById: (categoryId: string) =>
      apiCall<{ category: any }>(`/categories/${categoryId}`),
  },

  tags: {
    // 태그 목록 조회
    getAll: (params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const query = queryParams.toString();
      return apiCall<{ 
        tags: any[]; 
        currentPage: number; 
        totalPages: number; 
        totalCount: number; 
      }>(`/tags${query ? `?${query}` : ""}`);
    },
  },
};

export { ApiError };
export type { ApiResponse };

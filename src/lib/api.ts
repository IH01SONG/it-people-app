// src/lib/api.ts
import axios from './axios';

export const api = {
  signup: (payload: {
    email: string;
    password: string;
    name: string;
    birth: string;      // 서버가 기대하는 키 이름
    nickname?: string;  // 선택 필드 가능
  }) => axios.post('/auth/signup', payload).then(r => r.data),

  login: (email: string, password: string) =>
    axios.post('/auth/login', { email, password })
         .then(r => r.data as { token: string }),

  getMe: () => axios.get('/auth/me').then(r => r.data),

  // 차단 사용자 관련 API
  getBlockedUsers: () => axios.get('/users/me/blocked').then(r => r.data),
  blockUser: (userId: string) => axios.post(`/users/block/${userId}`).then(r => r.data),
  unblockUser: (userId: string) => axios.delete(`/users/block/${userId}`).then(r => r.data),

  // 이메일 중복 확인 API (기존 닉네임 중복 확인에서 변경)
  checkEmail: (email: string) => axios.post('/auth/check-email', { email }).then(r => r.data as { isAvailable: boolean; isValid: boolean; message: string; }),

  // 비밀번호 재설정 관련 API
  requestPasswordReset: (email: string) => axios.post('/auth/password-reset/request', { email }).then(r => r.data),
  verifyPasswordResetCode: (email: string, code: string) => axios.post('/auth/password-reset/verify', { email, code }).then(r => r.data),
  confirmPasswordReset: (newPassword: string, resetToken: string) => 
    axios.post('/auth/password-reset/confirm', { newPassword }, {
      headers: { Authorization: `Bearer ${resetToken}` }
    }).then(r => r.data),

  // 게시글 관련 API
  posts: {
    // 게시글 목록 조회
    getAll: (params?: { 
      page?: number; 
      limit?: number; 
      location?: string; 
      category?: string; 
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.location) queryParams.append('location', params.location);
      if (params?.category) queryParams.append('category', params.category);
      
      const query = queryParams.toString();
      return axios.get(`/posts${query ? `?${query}` : ''}`).then(r => r.data);
    },

    // 주변 게시글 조회
    getNearby: (lat: number, lng: number, radius: number = 5000) => 
      axios.get(`/posts/nearby?lat=${lat}&lng=${lng}&radius=${radius}`).then(r => r.data),

    // 게시글 작성
    create: (postData: any) => 
      axios.post('/posts', postData).then(r => r.data),

    // 게시글 수정
    update: (postId: string, postData: any) =>
      axios.put(`/posts/${postId}`, postData).then(r => r.data),

    // 게시글 삭제
    delete: (postId: string) =>
      axios.delete(`/posts/${postId}`).then(r => r.data),

    // 모임 참여 신청
    join: (postId: string) =>
      axios.post(`/posts/${postId}/join`).then(r => r.data),
  },

  // 사용자 관련 API
  users: {
    // 내 정보 조회
    getMe: () => axios.get('/users/me').then(r => r.data),

    // 프로필 수정
    updateProfile: (userData: any) =>
      axios.put('/users/me', userData).then(r => r.data),

    // 내가 쓴 글
    getMyPosts: () => axios.get('/users/me/posts').then(r => r.data),

    // 참여한 모임
    getJoinedPosts: () => axios.get('/users/me/joined-posts').then(r => r.data),

    // 사용자 차단
    blockUser: (userId: string) =>
      axios.post(`/users/block/${userId}`).then(r => r.data),

    // 사용자 차단 해제
    unblockUser: (userId: string) =>
      axios.delete(`/users/block/${userId}`).then(r => r.data),
  },

  // 참여 요청 관련 API
  joinRequests: {
    // 참여 요청 보내기
    create: (postId: string) =>
      axios.post(`/join-requests/posts/${postId}/request-join`).then(r => r.data),

    // 참여 요청 수락
    accept: (requestId: string) =>
      axios.post(`/join-requests/${requestId}/accept`).then(r => r.data),

    // 참여 요청 거절
    reject: (requestId: string) =>
      axios.post(`/join-requests/${requestId}/reject`).then(r => r.data),
  },

  // 알림 관련 API
  notifications: {
    // 알림 목록 조회
    getAll: () => axios.get('/notifications').then(r => r.data),

    // 알림 읽음 처리
    markAsRead: (notificationId: string) =>
      axios.post(`/notifications/${notificationId}/read`).then(r => r.data),

    // 모든 알림 읽음 처리
    markAllAsRead: () =>
      axios.post('/notifications/read-all').then(r => r.data),
  },
};

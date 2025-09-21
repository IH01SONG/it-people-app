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
      search?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.location) queryParams.append('location', params.location);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);

      const query = queryParams.toString();
      return axios.get(`/posts${query ? `?${query}` : ''}`).then(r => r.data);
    },

    // 게시글 검색
    search: (query: string, params?: {
      page?: number;
      limit?: number;
      location?: string;
      category?: string;
    }) => {
      const queryParams = new URLSearchParams();
      queryParams.append('search', query);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.location) queryParams.append('location', params.location);
      if (params?.category) queryParams.append('category', params.category);

      const queryString = queryParams.toString();
      return axios.get(`/posts?${queryString}`).then(r => r.data);
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

    // 프로필 이미지 업로드
    uploadProfileImage: (formData: FormData) =>
      axios.post('/users/me/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(r => r.data),

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

    // 계정 삭제
    deleteAccount: () =>
      axios.delete('/users/me').then(r => r.data),
  },

  // 참여 요청 관련 API
  joinRequests: {
    // 참여 요청 보내기 (기존 posts.join을 사용하거나 필요시 조정)
    create: (postId: string, message?: string) =>
      axios.post(`/join-requests`, { postId, message }).then(r => r.data),

    // 받은 참여 요청 목록
    getReceived: (params?: { page?: number; limit?: number; status?: 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled' }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.status) query.append('status', params.status);
      const qs = query.toString();
      return axios.get(`/join-requests/received${qs ? `?${qs}` : ''}`).then(r => r.data);
    },

    // 보낸 참여 요청 목록
    getSent: (params?: { page?: number; limit?: number; status?: 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled' }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.status) query.append('status', params.status);
      const qs = query.toString();
      return axios.get(`/join-requests/sent${qs ? `?${qs}` : ''}`).then(r => r.data);
    },

    // 요청 상세
    getDetail: (requestId: string) =>
      axios.get(`/join-requests/${requestId}`).then(r => r.data),

    // 승인
    approve: (requestId: string) =>
      axios.post(`/join-requests/${requestId}/approve`).then(r => r.data),

    // 거절
    reject: (requestId: string) =>
      axios.post(`/join-requests/${requestId}/reject`).then(r => r.data),

    // 취소 (요청자 본인의 취소)
    cancel: (requestId: string) =>
      axios.delete(`/join-requests/${requestId}`).then(r => r.data),

    // 읽음 상태 업데이트
    markRead: (requestId: string) =>
      axios.patch(`/join-requests/${requestId}/read`).then(r => r.data),
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

    // 1. 참여 신청 알림 생성 (모임장에게)
    createJoinRequestNotification: (postId: string, requesterId: string) =>
      axios.post('/notifications/join-request', { postId, requesterId }).then(r => r.data),

    // 2. 참여 신청 취소 알림 생성 (모임장에게)
    createJoinRequestCancelledNotification: (postId: string, requesterId: string) =>
      axios.post('/notifications/join-request-cancelled', { postId, requesterId }).then(r => r.data),

    // 3. 참여 승인 알림 생성 (신청자에게)
    createRequestAcceptedNotification: (requestId: string, postId: string, requesterId: string) =>
      axios.post('/notifications/request-accepted', { requestId, postId, requesterId }).then(r => r.data),

    // 4. 참여 거절 알림 생성 (신청자에게)
    createRequestRejectedNotification: (requestId: string, postId: string, requesterId: string) =>
      axios.post('/notifications/request-rejected', { requestId, postId, requesterId }).then(r => r.data),

    // 5. 채팅방 생성 알림 생성 (신청자에게)
    createChatRoomCreatedNotification: (postId: string, chatRoomId: string, requesterId: string) =>
      axios.post('/notifications/chat-room-created', { postId, chatRoomId, requesterId }).then(r => r.data),

    // 6. 채팅 메시지 알림 생성 (참여자들에게)
    createChatMessageNotification: (chatRoomId: string, senderId: string, message: string) =>
      axios.post('/notifications/chat-message', { chatRoomId, senderId, message }).then(r => r.data),
  },
};

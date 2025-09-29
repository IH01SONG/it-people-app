// src/lib/api.ts
import axios from './axios';

// 공용 토큰 키
const TOKEN_KEY = 'access_token';

// 토큰 헬퍼 함수들
export function setAuthToken(token?: string) {
  if (token && token !== 'null' && token !== 'undefined') {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem(TOKEN_KEY, token);
    console.log('🔑 토큰 설정 완료:', token.substring(0, 20) + '...');
  } else {
    clearAuthToken();
  }
}

export function clearAuthToken() {
  delete axios.defaults.headers.common.Authorization;
  localStorage.removeItem(TOKEN_KEY);
  console.log('🔑 토큰 제거 완료');
}

// 앱 부팅 시 자동 토큰 복원
const savedToken = localStorage.getItem(TOKEN_KEY);
if (savedToken && savedToken !== 'null' && savedToken !== 'undefined') {
  setAuthToken(savedToken);
  console.log('🔄 저장된 토큰 자동 복원 완료');
}

// 인증 상태 확인 헬퍼 함수
const checkAuth = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || token === 'null' || token === 'undefined') {
    console.warn('⚠️ 인증 토큰이 없습니다. 로그인이 필요합니다.');
    return false;
  }
  return true;
};

// 요청 인터셉터: Authorization 헤더 자동 주입
axios.interceptors.request.use(
  (config) => {
    // Authorization 헤더가 비어있으면 localStorage에서 토큰을 읽어 자동 주입
    if (!config.headers.Authorization) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const api = {
  // 서버 상태 확인
  healthCheck: () => {
    console.log('🏥 Health check 요청:', '/health');
    return axios.get('/health').then(r => {
      console.log('🏥 Health check 응답:', r.data);
      return r.data;
    }).catch((err) => {
      console.warn('🏥 Health check 실패:', err?.response?.status, err?.message);
      return { status: 'error' };
    });
  },
  signup: (payload: {
    email: string;
    password: string;
    name: string;
    birth: string;      // 서버가 기대하는 키 이름
    nickname?: string;  // 선택 필드 가능
  }) => axios.post('/auth/signup', payload).then(r => r.data),

  login: (email: string, password: string) =>
    axios.post('/auth/login', { email, password })
         .then(r => {
           const { token } = r.data as { token: string };
           if (token) {
             setAuthToken(token); // 로그인 성공 시 토큰 자동 저장/세팅
           }
           return r.data;
         }),

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

      // 구글 OAuth 관련 API
      googleAuth: () => {
        console.log('🔗 구글 OAuth 로그인 페이지로 이동');
        window.location.href = '/api/auth/google';
      },

      // 카카오 OAuth 관련 API
      kakaoAuth: () => {
        console.log('🔗 카카오 OAuth 로그인 페이지로 이동');
        window.location.href = '/api/auth/kakao';
      },

      // 사용자 정보 조회 (JWT 토큰 사용)
      fetchUserInfo: async (token: string) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const userData = await response.json();
            console.log('✅ 사용자 정보 조회 성공:', userData);
            return userData;
          } else {
            throw new Error(`사용자 정보 조회 실패: ${response.status}`);
          }
        } catch (error) {
          console.error('❌ 사용자 정보 조회 실패:', error);
          throw error;
        }
      },

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
    update: (postId: string, postData: any) => {
      if (!checkAuth()) return Promise.reject(new Error('인증이 필요합니다.'));
      console.log('✏️ 게시글 수정 API 호출:');
      console.log('📝 게시글 ID:', postId);
      console.log('📦 수정 데이터:', postData);
      console.log('🔗 요청 URL:', `/posts/${postId}`);
      
      return axios.put(`/posts/${postId}`, postData)
        .then(r => {
          console.log('✅ 게시글 수정 성공:', r.data);
          return r.data;
        })
        .catch(err => {
          console.error('❌ 게시글 수정 실패:', err.response?.data || err.message);
          throw err;
        });
    },

    // 게시글 삭제
    delete: (postId: string) => {
      if (!checkAuth()) return Promise.reject(new Error('인증이 필요합니다.'));
      console.log('🗑️ 게시글 삭제 API 호출:', postId);
      return axios.delete(`/posts/${postId}`).then(r => r.data);
    },

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
    uploadProfileImage: async (formData: FormData) => {
      const possibleEndpoints = [
        '/users/me/profile-image',
        '/users/profile-image',
        '/users/me/avatar',
        '/users/avatar',
        '/upload/profile-image',
        '/upload/avatar',
        '/auth/profile-image',
        '/profile/image'
      ];

      for (const endpoint of possibleEndpoints) {
        try {
          console.log('📤 프로필 이미지 업로드 시도:', endpoint);
          const response = await axios.post(endpoint, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log('✅ 프로필 이미지 업로드 성공:', endpoint, response.data);
          return response.data;
        } catch (err: any) {
          console.warn(`⚠️ ${endpoint} 실패:`, err.response?.status, err.response?.data?.message);
          if (err.response?.status !== 404) {
            // 404가 아닌 다른 에러는 실제 에러로 처리
            throw err;
          }
        }
      }
      
      // 모든 엔드포인트가 404인 경우
      throw new Error('프로필 이미지 업로드 API를 찾을 수 없습니다. 서버 관리자에게 문의하세요.');
    },

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

  // 채팅 관련 API
  chat: {
    // 채팅방 목록 조회
    getRooms: () => axios.get('/chat/rooms').then(r => r.data),

    // 특정 채팅방 정보 조회
    getRoom: (roomId: string) => axios.get(`/chat/rooms/${roomId}`).then(r => r.data),

    // 채팅방 메시지 목록 조회
    getMessages: (roomId: string, params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));
      const qs = query.toString();
      return axios.get(`/chat/rooms/${roomId}/messages${qs ? `?${qs}` : ''}`).then(r => r.data);
    },

    // 메시지 전송
    sendMessage: (roomId: string, message: string) =>
      axios.post(`/chat/rooms/${roomId}/messages`, { message }).then(r => r.data),

    // 채팅방 나가기
    leaveRoom: (roomId: string) =>
      axios.delete(`/chat/rooms/${roomId}/leave`).then(r => r.data),

    // 메시지 읽음 처리
    markAsRead: (roomId: string, messageId?: string) => {
      const body = messageId ? { messageId } : {};
      return axios.post(`/chat/rooms/${roomId}/read`, body).then(r => r.data);
    },
  },
};

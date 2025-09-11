/**
 * 목 API - 개발용
 * 실제 API 호출을 시뮬레이션하는 가상 API
 */

import { mockUsers, mockPosts, mockChatRooms, mockMessages, mockCurrentUser } from './mockData';
import mockSocketManager from './mockSocket';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  user?: any;
}

// API 응답 지연 시뮬레이션
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // 인증 관련
  auth: {
    getMe: async (): Promise<ApiResponse<any>> => {
      await delay(300);
      return {
        success: true,
        user: mockCurrentUser
      };
    },
    
    login: async (email: string, password: string): Promise<ApiResponse<any>> => {
      await delay(800);
      const user = mockUsers.find(u => u.email === email);
      if (user && password === 'password') {
        return {
          success: true,
          user,
          message: '로그인 성공'
        };
      }
      return {
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.'
      };
    },
    
    register: async (userData: any): Promise<ApiResponse<any>> => {
      await delay(1000);
      const newUser = {
        id: `user${mockUsers.length + 1}`,
        ...userData,
        profileImageUrl: `https://picsum.photos/150/150?random=${Math.floor(Math.random() * 1000)}`
      };
      mockUsers.push(newUser);
      return {
        success: true,
        user: newUser,
        message: '회원가입이 완료되었습니다.'
      };
    }
  },

  // 게시글 관련
  posts: {
    getAll: async (params?: any): Promise<ApiResponse<{ posts: any[]; total: number; hasMore: boolean }>> => {
      await delay(400);
      let filteredPosts = [...mockPosts];
      
      if (params?.category && params.category !== '전체') {
        filteredPosts = filteredPosts.filter(post => post.category === params.category);
      }
      
      if (params?.location) {
        filteredPosts = filteredPosts.filter(post => post.location.includes(params.location));
      }
      
      return {
        success: true,
        data: {
          posts: filteredPosts,
          total: filteredPosts.length,
          hasMore: false
        }
      };
    },

    getNearby: async (lat: number, lng: number, radius: number = 5000): Promise<ApiResponse<{ posts: any[] }>> => {
      await delay(600);
      // 위치 기반 필터링은 목 데이터에서는 모든 게시글 반환
      return {
        success: true,
        data: {
          posts: mockPosts
        }
      };
    },

    create: async (postData: any): Promise<ApiResponse<{ post: any }>> => {
      await delay(800);
      const newPost = {
        _id: `post${mockPosts.length + 1}`,
        ...postData,
        author: mockCurrentUser,
        currentParticipants: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      mockPosts.unshift(newPost);
      return {
        success: true,
        data: { post: newPost }
      };
    },

    update: async (postId: string, postData: any): Promise<ApiResponse<{ post: any }>> => {
      await delay(600);
      const postIndex = mockPosts.findIndex(p => p._id === postId);
      if (postIndex !== -1) {
        mockPosts[postIndex] = { ...mockPosts[postIndex], ...postData };
        return {
          success: true,
          data: { post: mockPosts[postIndex] }
        };
      }
      return {
        success: false,
        error: '게시글을 찾을 수 없습니다.'
      };
    },

    delete: async (postId: string): Promise<ApiResponse<{}>> => {
      await delay(400);
      const postIndex = mockPosts.findIndex(p => p._id === postId);
      if (postIndex !== -1) {
        mockPosts.splice(postIndex, 1);
        return { success: true };
      }
      return {
        success: false,
        error: '게시글을 찾을 수 없습니다.'
      };
    }
  },

  // 사용자 관련
  users: {
    updateProfile: async (updateData: any): Promise<ApiResponse<any>> => {
      await delay(600);
      
      // 현재 사용자 정보 업데이트
      Object.assign(mockCurrentUser, updateData);
      
      return {
        success: true,
        data: { user: mockCurrentUser },
        message: '프로필이 성공적으로 업데이트되었습니다.'
      };
    },

    getProfile: async (userId: string): Promise<ApiResponse<any>> => {
      await delay(300);
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        return {
          success: true,
          data: { user }
        };
      }
      return {
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      };
    }
  },

  // 참여 요청 관련
  joinRequests: {
    create: async (postId: string): Promise<ApiResponse<{ request: any }>> => {
      await delay(600);
      const post = mockPosts.find(p => p._id === postId);
      if (post && post.currentParticipants < post.maxParticipants) {
        post.currentParticipants += 1;
        return {
          success: true,
          data: {
            request: {
              _id: `req_${Date.now()}`,
              postId,
              userId: mockCurrentUser.id,
              status: 'accepted'
            }
          },
          message: '참여 요청이 승인되었습니다!'
        };
      }
      return {
        success: false,
        error: '참여할 수 없습니다. (정원 초과 또는 게시글 없음)'
      };
    },

    accept: async (requestId: string): Promise<ApiResponse<{}>> => {
      await delay(400);
      return {
        success: true,
        message: '참여 요청을 승인했습니다.'
      };
    },

    reject: async (requestId: string): Promise<ApiResponse<{}>> => {
      await delay(400);
      return {
        success: true,
        message: '참여 요청을 거절했습니다.'
      };
    }
  },

  // 채팅 관련
  chat: {
    getRooms: async (): Promise<ApiResponse<any[]>> => {
      await delay(400);
      return {
        success: true,
        data: mockChatRooms
      };
    },

    getRoom: async (roomId: string): Promise<ApiResponse<any>> => {
      await delay(300);
      const room = mockChatRooms.find(r => r._id === roomId);
      if (room) {
        return {
          success: true,
          data: room
        };
      }
      return {
        success: false,
        error: '채팅방을 찾을 수 없습니다.'
      };
    },

    getMessages: async (roomId: string, page: number = 1, limit: number = 50): Promise<ApiResponse<{ messages: any[]; currentPage: number; totalCount: number }>> => {
      await delay(500);
      const messages = mockMessages[roomId] || [];
      return {
        success: true,
        data: {
          messages,
          currentPage: page,
          totalCount: messages.length
        }
      };
    },

    sendMessage: async (roomId: string, messageData: any): Promise<ApiResponse<any>> => {
      await delay(300);
      
      if (!mockMessages[roomId]) {
        mockMessages[roomId] = [];
      }
      
      const newMessage = {
        _id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...messageData,
        sender: mockCurrentUser,
        createdAt: new Date().toISOString(),
        isMe: true
      };
      
      mockMessages[roomId].push(newMessage);
      
      // 채팅방의 마지막 메시지 업데이트
      const room = mockChatRooms.find(r => r._id === roomId);
      if (room) {
        room.lastMessage = {
          _id: newMessage._id,
          content: newMessage.content,
          createdAt: newMessage.createdAt
        };
        room.lastActivity = newMessage.createdAt;
      }
      
      // Socket 이벤트로 실시간 업데이트 알림
      mockSocketManager.simulate('newMessage', newMessage);
      
      return {
        success: true,
        data: newMessage
      };
    },

    leaveRoom: async (roomId: string): Promise<ApiResponse<{}>> => {
      await delay(400);
      
      // 채팅방 목록에서 제거
      const roomIndex = mockChatRooms.findIndex(r => r._id === roomId);
      if (roomIndex !== -1) {
        mockChatRooms.splice(roomIndex, 1);
      }
      
      // 채팅 메시지 삭제
      delete mockMessages[roomId];
      
      return {
        success: true,
        message: '채팅방을 나갔습니다.'
      };
    },

    markMessageAsRead: async (roomId: string, messageId: string): Promise<ApiResponse<{}>> => {
      await delay(200);
      return {
        success: true
      };
    },

    getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
      await delay(200);
      return {
        success: true,
        data: { count: 3 }
      };
    }
  }
};
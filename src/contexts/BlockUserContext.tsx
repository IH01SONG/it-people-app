import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../lib/api';

interface BlockedUser {
  id: string;
  name: string;
  email?: string;
}

interface BlockUserContextType {
  blockedUsers: BlockedUser[];
  isUserBlocked: (userId: string) => boolean;
  blockUser: (userId: string, userName: string, userEmail?: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  loadBlockedUsers: () => Promise<void>;
  cleanInvalidUsers: () => void;
  isLoading: boolean;
}

const BlockUserContext = createContext<BlockUserContextType | null>(null);

export function BlockUserProvider({ children }: { children: React.ReactNode }) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(() => {
    // localStorage에서 차단된 사용자 목록 로드
    try {
      const saved = localStorage.getItem('blockedUsers');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('💾 localStorage에서 차단된 사용자 로드:', parsed);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('❌ localStorage에서 차단된 사용자 로드 실패:', error);
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // 사용자가 차단되었는지 확인
  const isUserBlocked = useCallback((userId: string) => {
    return blockedUsers.some(user => user.id === userId);
  }, [blockedUsers]);

  // 사용자 차단
  const blockUser = useCallback(async (userId: string, userName: string, userEmail?: string) => {
    console.log("🔒 사용자 차단 시작:", { userId, userName, userEmail });
    console.log("🔍 현재 차단된 사용자 목록:", blockedUsers);
    
    // 이미 차단된 사용자인지 확인
    if (blockedUsers.some(user => user.id === userId)) {
      console.log("⚠️ 이미 차단된 사용자입니다:", { userId, userName });
      return; // 이미 차단된 사용자면 아무것도 하지 않음
    }

    try {
      await api.blockUser(userId);
      
      // 유효한 사용자 정보인지 확인
      if (!userName || typeof userName !== 'string' || userName.trim() === '') {
        console.warn("⚠️ 유효하지 않은 사용자 이름:", userName);
        throw new Error("유효하지 않은 사용자 이름입니다.");
      }
      
      const newUser = { id: userId, name: userName.trim(), email: userEmail };
      setBlockedUsers(prev => {
        const updated = [...prev, newUser];
        console.log("✅ 차단된 사용자 목록 업데이트:", updated);
        return updated;
      });
      console.log("✅ 사용자 차단 성공:", { userId, userName });
    } catch (error) {
      console.error('❌ 사용자 차단 실패:', error);
      throw error;
    }
  }, [blockedUsers]);

  // 사용자 차단 해제
  const unblockUser = useCallback(async (userId: string) => {
    console.log("🔓 사용자 차단 해제 시작:", { userId });
    console.log("🔍 현재 차단된 사용자 목록:", blockedUsers);
    
    try {
      await api.unblockUser(userId);
      setBlockedUsers(prev => {
        const updated = prev.filter(user => user.id !== userId);
        console.log("✅ 차단 해제 후 사용자 목록:", updated);
        return updated;
      });
      console.log("✅ 사용자 차단 해제 성공:", { userId });
    } catch (error) {
      console.error('❌ 차단 해제 실패:', error);
      throw error;
    }
  }, [blockedUsers]);

  // 유효하지 않은 사용자 제거 함수
  const cleanInvalidUsers = useCallback(() => {
    setBlockedUsers(prev => {
      const validUsers = prev.filter(user => 
        user && 
        user.id && 
        user.name && 
        typeof user.name === 'string' && 
        user.name.trim() !== ''
      );
      
      if (validUsers.length !== prev.length) {
        console.log('🧹 유효하지 않은 사용자 제거:', {
          before: prev.length,
          after: validUsers.length,
          removed: prev.length - validUsers.length
        });
      }
      
      return validUsers;
    });
  }, []);

  // 차단된 사용자 목록 로드
  const loadBlockedUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getBlockedUsers();
      console.log('🔍 차단된 사용자 API 응답:', response);
      console.log('🔍 API 응답 타입:', typeof response);
      console.log('🔍 API 응답이 배열인가?', Array.isArray(response));
      
      // API 응답 구조 확인 및 적절한 데이터 추출
      let apiUsers = [];
      if (response) {
        if (Array.isArray(response)) {
          apiUsers = response;
          console.log('✅ 응답이 직접 배열입니다');
        } else if (response.data && Array.isArray(response.data)) {
          apiUsers = response.data;
          console.log('✅ response.data가 배열입니다');
        } else if (response.blockedUsers && Array.isArray(response.blockedUsers)) {
          apiUsers = response.blockedUsers;
          console.log('✅ response.blockedUsers가 배열입니다');
        } else {
          console.log('❌ 알 수 없는 응답 구조:', Object.keys(response));
        }
      } else {
        console.log('❌ 응답이 null 또는 undefined입니다');
      }
      
      console.log('📋 API에서 추출된 사용자 목록:', apiUsers);
      console.log('📋 API 사용자 목록 길이:', apiUsers.length);
      
      // localStorage에서 기존 차단된 사용자 목록 가져오기
      let localUsers = [];
      try {
        const saved = localStorage.getItem('blockedUsers');
        if (saved) {
          localUsers = JSON.parse(saved);
          console.log('💾 localStorage에서 기존 사용자 목록:', localUsers);
        }
      } catch (error) {
        console.error('❌ localStorage에서 기존 사용자 목록 로드 실패:', error);
      }
      
      // API 사용자와 localStorage 사용자 병합 (중복 제거)
      const allUsers = [...apiUsers, ...localUsers];
      const users = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );
      
      console.log('🔄 병합된 사용자 목록:', users);
      console.log('🔄 병합 후 사용자 수:', users.length);
      
      // 각 사용자 데이터의 구조 확인 및 유효하지 않은 사용자 필터링
      let validUsers = [];
      if (Array.isArray(users)) {
        users.forEach((user, index) => {
          console.log(`👤 사용자 ${index}:`, { 
            id: user.id, 
            name: user.name, 
            email: user.email,
            hasName: !!user.name,
            nameType: typeof user.name
          });
        });
        
        // 유효한 사용자만 필터링 (name이 있고 빈 문자열이 아닌 경우)
        validUsers = users.filter(user => 
          user && 
          user.id && 
          user.name && 
          typeof user.name === 'string' && 
          user.name.trim() !== ''
        );
        
        console.log('✅ 유효한 사용자만 필터링:', validUsers);
        console.log('🗑️ 제거된 사용자 수:', users.length - validUsers.length);
      }
      
      setBlockedUsers(validUsers);
    } catch (error) {
      console.error('차단 사용자 목록 로드 실패:', error);
      // 에러 발생 시 localStorage에서 로드 시도
      try {
        const saved = localStorage.getItem('blockedUsers');
        if (saved) {
          const localUsers = JSON.parse(saved);
          console.log('💾 API 실패, localStorage에서 로드:', localUsers);
          setBlockedUsers(Array.isArray(localUsers) ? localUsers : []);
        } else {
          setBlockedUsers([]);
        }
      } catch (localError) {
        console.error('❌ localStorage에서도 로드 실패:', localError);
        setBlockedUsers([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // blockedUsers가 변경될 때마다 localStorage에 저장
  React.useEffect(() => {
    try {
      localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
      console.log('💾 localStorage에 차단된 사용자 저장:', blockedUsers);
    } catch (error) {
      console.error('❌ localStorage에 차단된 사용자 저장 실패:', error);
    }
  }, [blockedUsers]);

  // 컴포넌트 마운트 시 차단된 사용자 목록 로드
  React.useEffect(() => {
    loadBlockedUsers();
  }, [loadBlockedUsers]);

  return (
    <BlockUserContext.Provider value={{
      blockedUsers,
      isUserBlocked,
      blockUser,
      unblockUser,
      loadBlockedUsers,
      cleanInvalidUsers,
      isLoading
    }}>
      {children}
    </BlockUserContext.Provider>
  );
}

export const useBlockUser = () => {
  const context = useContext(BlockUserContext);
  if (!context) {
    throw new Error('useBlockUser must be used within BlockUserProvider');
  }
  return context;
};

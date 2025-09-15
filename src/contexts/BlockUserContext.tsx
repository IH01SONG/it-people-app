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
  isLoading: boolean;
}

const BlockUserContext = createContext<BlockUserContextType | null>(null);

export function BlockUserProvider({ children }: { children: React.ReactNode }) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 사용자가 차단되었는지 확인
  const isUserBlocked = useCallback((userId: string) => {
    return blockedUsers.some(user => user.id === userId);
  }, [blockedUsers]);

  // 사용자 차단
  const blockUser = useCallback(async (userId: string, userName: string, userEmail?: string) => {
    try {
      await api.blockUser(userId);
      setBlockedUsers(prev => [...prev, { id: userId, name: userName, email: userEmail }]);
    } catch (error) {
      console.error('사용자 차단 실패:', error);
      throw error;
    }
  }, []);

  // 사용자 차단 해제
  const unblockUser = useCallback(async (userId: string) => {
    try {
      await api.unblockUser(userId);
      setBlockedUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('차단 해제 실패:', error);
      throw error;
    }
  }, []);

  // 차단된 사용자 목록 로드
  const loadBlockedUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getBlockedUsers();
      setBlockedUsers(response.data || []);
    } catch (error) {
      console.error('차단 사용자 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <BlockUserContext.Provider value={{
      blockedUsers,
      isUserBlocked,
      blockUser,
      unblockUser,
      loadBlockedUsers,
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

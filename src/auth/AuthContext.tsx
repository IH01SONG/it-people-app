import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { setAuthToken } from '../lib/axios';
import { socketService } from '../lib/socket';

type User = { id: string; email: string; name?: string; _id?: string };
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const socketInitialized = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      setAuthToken(token);

      try {
        const me = await api.users.getMe();
        setUser(me);

        if (!socketInitialized.current) {
          await initializeSocket(me);
          socketInitialized.current = true;
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('access_token');
        setAuthToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const initializeSocket = async (userData: User) => {
    try {
      await socketService.connect();
      const userId = userData._id || userData.id;
      if (userId) {
        socketService.registerUser(userId);
      }

      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (error) {
      console.error('Socket 연결 실패:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { token } = await api.login(email, password);
      localStorage.setItem('access_token', token);

      setAuthToken(token);

      const me = await api.users.getMe();
      setUser(me);

      if (!socketInitialized.current) {
        await initializeSocket(me);
        socketInitialized.current = true;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setAuthToken(null);
    setUser(null);
    socketService.disconnect();
    socketInitialized.current = false;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};



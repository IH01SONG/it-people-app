import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { setAuthToken } from '../lib/axios';
import { createSocket } from '../lib/socket';

type User = { id: string; email: string; name?: string };
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type Socket = ReturnType<typeof createSocket>;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // 토큰을 axios 헤더에 즉시 설정
      setAuthToken(token);

      try {
        const me = await api.getMe();
        setUser(me);
        
        // 소켓 연결
        socketRef.current = createSocket(() => localStorage.getItem('access_token'));
        socketRef.current.emit('joinRoom', { roomId: 'global' });
      } catch (error) {
        // 토큰이 유효하지 않은 경우
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

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { token } = await api.login(email, password);
      localStorage.setItem('access_token', token);
      
      // 토큰을 axios 헤더에 즉시 설정
      setAuthToken(token);
      
      const me = await api.getMe();
      setUser(me);

      socketRef.current?.disconnect();
      socketRef.current = createSocket(() => localStorage.getItem('access_token'));
      socketRef.current.emit('joinRoom', { roomId: 'global' });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setAuthToken(null);
    setUser(null);
    socketRef.current?.disconnect();
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



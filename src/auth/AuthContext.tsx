import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { setAuthToken } from '../lib/axios';
import { createSocket } from '../lib/socket';

type User = { id: string; email: string; name?: string };
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type Socket = ReturnType<typeof createSocket>;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // 토큰을 axios 헤더에 즉시 설정
    setAuthToken(token);

    api.getMe()
      .then((me: User) => {
        setUser(me);
        // 소켓 연결
        socketRef.current = createSocket(() => localStorage.getItem('access_token'));
        // 예: 공용 룸 조인
        socketRef.current.emit('joinRoom', { roomId: 'global' });
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        setAuthToken(null);
        setUser(null);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const { token } = await api.login(email, password);
    localStorage.setItem('access_token', token);
    
    // 토큰을 axios 헤더에 즉시 설정
    setAuthToken(token);
    
    const me = await api.getMe();
    setUser(me);

    socketRef.current?.disconnect();
    socketRef.current = createSocket(() => localStorage.getItem('access_token'));
    socketRef.current.emit('joinRoom', { roomId: 'global' });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setAuthToken(null);
    setUser(null);
    socketRef.current?.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};



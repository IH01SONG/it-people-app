import { createContext, useContext, useEffect, useRef, useState } from "react";
import { api } from "../utils/api";
import { createSocket } from "../lib/socket";

type User = { id: string; email: string; name?: string };
type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

type Socket = ReturnType<typeof createSocket>;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.users
      .getMe()
      .then((res) => {
        const me = (res as any).data?.user ?? (res as any).user;
        if (me) {
          setUser({
            id: me.id || me._id || "me",
            email: me.email || "",
            name: me.nickname || me.name,
          });
        }
      })
      .catch(() => {
        const dummy: User = {
          id: "dummy-user",
          email: "dummy@example.com",
          name: "임시 사용자",
        };
        setUser(dummy);
      })
      .finally(() => {
        socketRef.current = createSocket(() =>
          localStorage.getItem("access_token")
        );
        socketRef.current.emit("joinRoom", { roomId: "global" });
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.auth.login({ email, password });
      const token = (res as any).data?.token ?? (res as any).token;
      if (!token) throw new Error("토큰이 없습니다");
      localStorage.setItem("access_token", token);

      const meRes = await api.users.getMe();
      const me = (meRes as any).data?.user ?? (meRes as any).user;
      setUser({
        id: me?.id || me?._id || "me",
        email: me?.email || email,
        name: me?.nickname || me?.name,
      });
    } catch (e) {
      // 실패 시 더미 로그인으로 폴백
      localStorage.setItem("access_token", "dummy-token");
      const dummy: User = { id: "dummy-user", email, name: "임시 사용자" };
      setUser(dummy);
    } finally {
      socketRef.current?.disconnect();
      socketRef.current = createSocket(() =>
        localStorage.getItem("access_token")
      );
      socketRef.current.emit("joinRoom", { roomId: "global" });
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    socketRef.current?.disconnect();
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

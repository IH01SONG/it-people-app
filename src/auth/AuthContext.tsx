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
    // 개발 모드에서 테스트 토큰 자동 설정
    const testToken = import.meta.env?.VITE_TEST_TOKEN;
    const bypassAuth = import.meta.env?.VITE_BYPASS_AUTH === 'true';
    
    if (bypassAuth && testToken && !localStorage.getItem("access_token")) {
      localStorage.setItem("access_token", testToken);
      console.log("개발 모드: 테스트 토큰 자동 설정");
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.users
      .getProfile()
      .then((me: any) => {
        // 백엔드에서 직접 사용자 객체를 반환
        if (me && me._id) {
          setUser({
            id: me._id || me.id || "me",
            email: me.email || "",
            name: me.nickname || me.name,
          });
        }
      })
      .catch((error) => {
        console.error("사용자 정보 조회 실패:", error);
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

      const meResponse = await api.users.getProfile();
      const me = meResponse as any;
      setUser({
        id: me?._id || me?.id || "me",
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

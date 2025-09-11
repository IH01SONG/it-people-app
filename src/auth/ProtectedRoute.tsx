import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { ReactElement } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: ReactElement;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 개발 우회 조건 확인
  const isBypassEnabled = 
    import.meta.env.VITE_BYPASS_AUTH === 'true' || 
    localStorage.getItem('dev_bypass') === 'true';

  if (isLoading) {
    return null;
  }

  // 개발 우회가 활성화되어 있으면 인증 없이 통과
  if (isBypassEnabled) {
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  return children;
}

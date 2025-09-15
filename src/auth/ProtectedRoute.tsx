import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Box, CircularProgress, Typography } from "@mui/material";
import type { ReactElement } from "react";

export default function ProtectedRoute({
  children,
}: { children: ReactElement }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 로딩 중일 때는 로딩 스피너 표시
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          로그인 상태를 확인하는 중...
        </Typography>
      </Box>
    );
  }

  // 로딩이 완료되었지만 인증되지 않은 경우에만 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

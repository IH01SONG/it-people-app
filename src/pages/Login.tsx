// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";       // 컨텍스트 사용 시
import {
  Box, Button, TextField, Typography, Stack, createTheme, ThemeProvider
} from "@mui/material";
import reactLogo from "../assets/react.svg";
import { api } from "../lib/api";

const theme = createTheme({
  palette: { primary: { main: "#E762A9" } },
  components: { MuiButton: { styleOverrides: { root: { textTransform: 'none' } } } },
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();           // 컨텍스트 사용
  const navigate = useNavigate();
  const location = useLocation() as any;

  const handleLogin = async () => {
    try {
      // AuthContext의 login 함수 사용 (토큰 설정과 인증 상태 업데이트를 한번에 처리)
      await login(email, password);

      const to = location?.state?.from?.pathname ?? "/";
      navigate(to, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '로그인에 실패했습니다. 이메일/비밀번호를 확인해주세요.';
      alert(msg);
    }
  };

  const handleSignUpClick = () => navigate("/signup");

  const handleGoogleLogin = () => {
    console.log('🔗 구글 로그인 시작');
    // 구글 OAuth 로그인 페이지로 리다이렉트
    api.googleAuth();
  };

  const handleKakaoLogin = () => {
    console.log('🔗 카카오 로그인 시작');
    // 카카오 OAuth 로그인 페이지로 리다이렉트
    api.kakaoAuth();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="flex flex-col items-center justify-center min-h-screen p-5 bg-white">
        <Typography variant="h4" className="text-gray-700 font-bold mb-6">It People !</Typography>
        <Box className="flex items-center mb-14">
          <img src={reactLogo} className="w-24 h-24" alt="잇플 로고" />
          <Typography variant="h2" className="font-bold ml-4" style={{ color: theme.palette.primary.main }}>
            잇플
          </Typography>
        </Box>

        <Stack spacing={2} className="w-full max-w-sm p-6 bg-white rounded-lg"
               sx={{ boxShadow: 6, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <TextField
            label="이메일" variant="outlined" fullWidth
            value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <TextField
            label="비밀번호" type="password" variant="outlined" fullWidth
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleLogin} className="py-3 text-lg" sx={{ boxShadow: 3 }}>
            로그인
          </Button>
          <Button variant="outlined" color="primary" fullWidth onClick={handleSignUpClick} className="py-3 text-lg" sx={{ boxShadow: 3 }}>
            회원가입
          </Button>
        </Stack>

        <Button variant="text" className="text-blue-600 mb-5" onClick={() => navigate('/find-credentials')}>
          이메일 / 비밀번호 찾기
        </Button>

        <Stack spacing={2} className="w-full max-w-sm">
          <Button
            variant="contained"
            className="bg-[#4285F4] text-white hover:bg-[#3367D6] py-3 text-lg font-medium"
            onClick={handleGoogleLogin}
            startIcon={
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }
            sx={{
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            Google로 로그인
          </Button>
          
          <Button
            variant="contained"
            className="bg-[#FEE500] text-black hover:bg-[#FDD835] py-3 text-lg font-medium"
            onClick={handleKakaoLogin}
            startIcon={
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11L6.5 21.5c-1.5-1.5-1.5-3.5 0-5l3.773-3.773A13.5 13.5 0 0 1 12 3z"/>
              </svg>
            }
            sx={{
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            카카오로 로그인
          </Button>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}

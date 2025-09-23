// src/pages/GoogleCallback.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Box, CircularProgress, Typography, Stack } from "@mui/material";
import { api } from "../lib/api";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        console.log('🔄 구글 OAuth 콜백 처리 시작');
        console.log('📍 현재 URL:', window.location.href);
        console.log('📍 현재 경로:', window.location.pathname);
        console.log('📍 현재 도메인:', window.location.hostname);
        console.log('🔍 URL 파라미터:', Object.fromEntries(searchParams.entries()));
        console.log('🔍 토큰 존재 여부:', !!searchParams.get('token'));
        console.log('🔍 코드 존재 여부:', !!searchParams.get('code'));
        console.log('🔍 환경변수 VITE_API_URL:', import.meta.env.VITE_API_URL);
        console.log('🔍 전체 searchParams:', searchParams.toString());
        console.log('🔍 React Router location:', window.location);
        console.log('🔍 현재 경로가 /auth/callback인지:', window.location.pathname === '/auth/callback');
        
        // URL 정리를 위한 함수
        const cleanUrl = () => {
          const cleanUrl = `${window.location.origin}${window.location.pathname}`;
          window.history.replaceState({}, document.title, cleanUrl);
          console.log('🧹 URL 정리 완료:', cleanUrl);
        };
        
        // URL 파라미터에서 코드와 에러 확인
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');
        const token = searchParams.get('token'); // JWT 토큰이 직접 전달된 경우
        
        if (error) {
          console.error('❌ 구글 OAuth 에러:', error);
          setErrorMessage(`구글 로그인 중 오류가 발생했습니다: ${error}`);
          setStatus('error');
          return;
        }
        
        // JWT 토큰이 직접 전달된 경우 (백엔드에서 이미 처리된 경우)
        if (token) {
          console.log('✅ JWT 토큰이 직접 전달됨:', token.substring(0, 30) + '...');
          
          try {
            // 1. 토큰을 로컬 스토리지에 저장
            localStorage.setItem('access_token', token);
            console.log('💾 토큰을 로컬 스토리지에 저장 완료');
            
            // 2. URL 정리 (토큰 파라미터 제거)
            cleanUrl();
            
            // 3. 사용자 정보 조회
            try {
              console.log('👤 사용자 정보 조회 시작...');
              const userData = await api.fetchUserInfo(token);
              console.log('✅ 사용자 정보 조회 성공:', userData);
              
              // 4. AuthContext의 login 함수 호출 (이메일만 전달)
              await login(userData.email, '');
              console.log('🔐 AuthContext 로그인 상태 업데이트 완료');
              
              setStatus('success');
              console.log('🎉 구글 로그인 완료!');
              
              // 5. 메인 페이지로 리다이렉트
              setTimeout(() => {
                console.log('🏠 메인 페이지로 리다이렉트');
                navigate('/', { replace: true });
              }, 1500);
              
            } catch (userError) {
              console.error('❌ 사용자 정보 조회 실패:', userError);
              
              // 토큰은 있지만 사용자 정보 조회 실패 시에도 로그인 처리
              console.warn('⚠️ 사용자 정보 조회 실패했지만 토큰이 있으므로 로그인 진행');
              setStatus('success');
              setTimeout(() => {
                navigate('/', { replace: true });
              }, 1500);
            }
            
          } catch (tokenError: any) {
            console.error('❌ 토큰 처리 실패:', tokenError);
            setErrorMessage(`토큰 처리 중 오류가 발생했습니다: ${tokenError.message}`);
            setStatus('error');
          }
          
          return;
        }
        
        if (!code) {
          console.error('❌ 인증 코드가 없습니다.');
          setErrorMessage('구글 인증 코드를 받지 못했습니다.');
          setStatus('error');
          return;
        }

        console.log('✅ 구글 인증 코드 받음:', code.substring(0, 20) + '...');
        console.log('🔍 State 파라미터:', state);

        // 1. 서버에 인증 코드를 전송하여 토큰 교환
        try {
          console.log('🔄 서버에 인증 코드 전송 중...');
          console.log('📤 전송할 데이터:', { code: code.substring(0, 20) + '...', state });
          
          const response = await fetch('/api/auth/callback/google', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: code,
              state: state,
              redirect_uri: window.location.origin + '/auth/callback/google'
            })
          });

          console.log('📡 서버 응답 상태:', response.status, response.statusText);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 서버 응답 오류:', response.status, errorText);
            throw new Error(`서버 응답 오류: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log('✅ 서버 응답 데이터:', data);

          // 서버에서 반환된 토큰 확인
          const token = data.token || data.access_token || data.jwt;
          if (!token) {
            console.error('❌ 서버 응답에 토큰이 없음:', data);
            throw new Error('서버에서 토큰을 받지 못했습니다.');
          }

          console.log('✅ JWT 토큰 받음:', token.substring(0, 30) + '...');

          // 2. 토큰을 로컬 스토리지에 저장
          localStorage.setItem('access_token', token);
          console.log('💾 토큰을 로컬 스토리지에 저장 완료');
          
          // 3. URL 정리 (코드 파라미터 제거)
          cleanUrl();
          
          // 4. 사용자 정보 조회
          try {
            console.log('👤 사용자 정보 조회 시작...');
            const userData = await api.fetchUserInfo(token);
            console.log('✅ 사용자 정보 조회 성공:', userData);
            
            // 4. AuthContext의 login 함수 호출 (이메일만 전달)
            await login(userData.email, '');
            console.log('🔐 AuthContext 로그인 상태 업데이트 완료');
            
            setStatus('success');
            console.log('🎉 구글 로그인 완료!');
            
            // 5. 메인 페이지로 리다이렉트
            setTimeout(() => {
              console.log('🏠 메인 페이지로 리다이렉트');
              navigate('/', { replace: true });
            }, 1500);
            
          } catch (userError) {
            console.error('❌ 사용자 정보 조회 실패:', userError);
            
            // 토큰은 있지만 사용자 정보 조회 실패 시에도 로그인 처리
            console.warn('⚠️ 사용자 정보 조회 실패했지만 토큰이 있으므로 로그인 진행');
            setStatus('success');
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 1500);
          }
          
        } catch (serverError: any) {
          console.error('❌ 서버 통신 실패:', serverError);
          
          // 404 에러인 경우 백엔드 서버 문제임을 명시
          if (serverError.message?.includes('404')) {
            setErrorMessage('백엔드 서버의 Google OAuth 콜백 엔드포인트가 구현되지 않았습니다. 서버 관리자에게 문의하세요.');
          } else {
            setErrorMessage(`서버와의 통신에 실패했습니다: ${serverError.message || '알 수 없는 오류'}`);
          }
          setStatus('error');
        }

      } catch (error: any) {
        console.error('❌ 구글 OAuth 콜백 처리 실패:', error);
        setErrorMessage(error.message || '구글 로그인에 실패했습니다.');
        setStatus('error');
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, login]);

  if (status === 'loading') {
    return (
      <Box className="flex flex-col items-center justify-center min-h-screen p-5 bg-white">
        <div className="mb-4">
          <svg className="w-16 h-16 text-[#E762A9] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <Typography variant="h6" className="text-gray-700 mb-2">
          구글 로그인 처리 중...
        </Typography>
        <Typography variant="body2" className="text-gray-500 text-center mb-4">
          서버와 통신하여 인증을 완료하고 있습니다.
        </Typography>
        <Typography variant="body2" className="text-gray-400 text-center text-xs">
          잠시만 기다려주세요...
        </Typography>
      </Box>
    );
  }

  if (status === 'success') {
    return (
      <Box className="flex flex-col items-center justify-center min-h-screen p-5 bg-white">
        <div className="text-green-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <Typography variant="h5" className="text-green-600 mb-2 font-semibold">
          구글 로그인 성공!
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-4">
          환영합니다! 잠시 후 메인 페이지로 이동합니다...
        </Typography>
        <CircularProgress size={24} sx={{ color: '#E762A9' }} />
      </Box>
    );
  }

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen p-5 bg-white">
      <Typography variant="h6" className="text-red-600 mb-2">
        ❌ 구글 로그인 실패
      </Typography>
      <Typography variant="body2" className="text-gray-600 mb-4 text-center">
        {errorMessage}
      </Typography>
      <Typography variant="body2" className="text-gray-500 mb-4 text-center text-xs">
        개발자 도구 콘솔에서 자세한 오류 정보를 확인할 수 있습니다.
      </Typography>
      <Stack spacing={2} className="w-full max-w-sm">
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-[#E762A9] text-white rounded hover:bg-[#D55A9A] transition-colors"
        >
          로그인 페이지로 돌아가기
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          다시 시도
        </button>
      </Stack>
    </Box>
  );
}

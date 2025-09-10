import React, { useState, useEffect } from 'react';
import { Button, Chip, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const DevContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 16,
  right: 16,
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignItems: 'flex-end',
}));

const DevButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: '4px 8px',
  fontSize: '12px',
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
}));

const DevBadge = styled(Chip)(({ theme }) => ({
  fontSize: '11px',
  height: '24px',
  fontWeight: 600,
  backgroundColor: '#4CAF50',
  color: 'white',
  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}));

interface DevAuthProviderProps {
  children: React.ReactNode;
}

export default function DevAuthProvider({ children }: DevAuthProviderProps) {
  const [isBypassed, setIsBypassed] = useState(false);

  // 개발 모드인지 확인
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';
  const devUserName = import.meta.env.VITE_DEV_USER_NAME || '개발자';

  useEffect(() => {
    // localStorage에서 우회 상태 확인
    const bypassed = localStorage.getItem('dev_bypass') === 'true';
    setIsBypassed(bypassed);
  }, []);

  const toggleBypass = () => {
    const newBypassState = !isBypassed;
    
    if (newBypassState) {
      localStorage.setItem('dev_bypass', 'true');
      localStorage.setItem('access_token', 'dev-bypass-token');
    } else {
      localStorage.removeItem('dev_bypass');
      localStorage.removeItem('access_token');
    }
    
    setIsBypassed(newBypassState);
    
    // 페이지 새로고침으로 상태 반영
    window.location.reload();
  };

  return (
    <>
      {children}
      
      {/* 개발 모드일 때만 표시 */}
      {isDevMode && (
        <DevContainer>
          {/* 우회 상태 배지 */}
          {isBypassed && (
            <DevBadge
              label={`Dev Bypass ON • ${devUserName}`}
              size="small"
            />
          )}
          
          {/* 토글 버튼 */}
          <DevButton
            variant="contained"
            size="small"
            color={isBypassed ? "error" : "primary"}
            onClick={toggleBypass}
          >
            {isBypassed ? "개발 해제" : "개발 로그인"}
          </DevButton>
        </DevContainer>
      )}
    </>
  );
}
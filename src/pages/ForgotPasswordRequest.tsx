import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Stack, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '../lib/api';

const ForgotPasswordRequest: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const validateEmail = (email: string) => {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(String(email).toLowerCase());
  };

  const startCooldown = () => {
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!email) {
      setEmailError('이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    setEmailError('');
    setIsLoading(true);

    try {
      // TODO: 백엔드 연동
      await api.requestPasswordReset(email);
      setIsCodeSent(true);
      startCooldown();
      alert('인증 코드가 전송되었습니다.');
    } catch (error: any) {
      console.error('비밀번호 재설정 요청 실패:', error);
      // 이메일 존재 여부 노출 금지
      alert('인증 코드가 전송되었습니다.');
      setIsCodeSent(true);
      startCooldown();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0) return;
    
    setIsLoading(true);
    try {
      // TODO: 백엔드 연동
      await api.requestPasswordReset(email);
      startCooldown();
      alert('인증 코드가 재전송되었습니다.');
    } catch (error: any) {
      console.error('코드 재전송 실패:', error);
      alert('인증 코드가 재전송되었습니다.');
      startCooldown();
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (isCodeSent) {
      navigate('/forgot-password/verify', { state: { email } });
    }
  };

  return (
    <Box>
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText', 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        width: '100%',
        maxWidth: { xs: '100%', sm: '600px' },
        mx: 'auto'
      }}>
        <IconButton onClick={() => navigate(-1)} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', mr: 4 }}>
          비밀번호 찾기
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ width: '100%', maxWidth: '420px', mt: 4, mx: 'auto', p: 2 }}>
        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}>
          비밀번호 재설정
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
          등록된 이메일 주소를 입력해주세요.
        </Typography>

        <TextField
          label="이메일 주소"
          variant="outlined"
          fullWidth
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          error={!!emailError}
          helperText={emailError}
          disabled={isCodeSent}
        />

        {!isCodeSent ? (
          <Button
            variant="contained"
            fullWidth
            onClick={handleSendCode}
            disabled={isLoading}
            sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
          >
            {isLoading ? '전송 중...' : '인증 코드 전송'}
          </Button>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body2" color="success.main" sx={{ textAlign: 'center' }}>
              인증 코드가 전송되었습니다.
            </Typography>
            
            <Button
              variant="outlined"
              fullWidth
              onClick={handleResendCode}
              disabled={cooldown > 0 || isLoading}
              sx={{ py: 1.5, fontSize: '1rem' }}
            >
              {cooldown > 0 ? `${cooldown}초 후 재전송 가능` : '인증 코드 재전송'}
            </Button>

            <Button
              variant="contained"
              fullWidth
              onClick={handleNext}
              sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
            >
              다음 단계
            </Button>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default ForgotPasswordRequest;

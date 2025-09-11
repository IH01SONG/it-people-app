import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, TextField, Typography, Stack, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '../lib/api';

const ForgotPasswordVerify: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/forgot-password');
    }
  }, [location.state, navigate]);

  const validateCode = (code: string) => {
    return /^\d{6}$/.test(code);
  };

  const handleCodeChange = (value: string) => {
    // 숫자만 허용, 6자리 제한
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
    setCodeError('');
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setCodeError('인증 코드를 입력해주세요.');
      return;
    }

    if (!validateCode(code)) {
      setCodeError('6자리 숫자 코드를 입력해주세요.');
      return;
    }

    setCodeError('');
    setIsLoading(true);

    try {
      // TODO: 백엔드 연동
      const response = await api.verifyPasswordResetCode(email, code);
      const resetToken = response.resetToken || 'mock-reset-token';
      
      navigate('/reset-password', { 
        state: { 
          email, 
          resetToken 
        } 
      });
    } catch (error: any) {
      console.error('코드 인증 실패:', error);
      setAttempts(prev => prev + 1);
      
      if (attempts >= 2) {
        setIsBlocked(true);
        setCodeError('인증 시도 횟수를 초과했습니다. 처음부터 다시 시도해주세요.');
      } else {
        setCodeError('유효하지 않은 인증 코드입니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      // TODO: 백엔드 연동
      await api.requestPasswordReset(email);
      alert('인증 코드가 재전송되었습니다.');
      setCode('');
      setCodeError('');
      setAttempts(0);
      setIsBlocked(false);
    } catch (error: any) {
      console.error('코드 재전송 실패:', error);
      alert('인증 코드가 재전송되었습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    navigate('/forgot-password');
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
          인증 코드 확인
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ width: '100%', maxWidth: '420px', mt: 4, mx: 'auto', p: 2 }}>
        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}>
          인증 코드 입력
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
          {email}로 전송된 6자리 인증 코드를 입력해주세요.
        </Typography>

        <TextField
          label="인증 코드"
          variant="outlined"
          fullWidth
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          error={!!codeError}
          helperText={codeError}
          placeholder="123456"
          inputProps={{ 
            maxLength: 6,
            style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5rem' }
          }}
          disabled={isBlocked}
        />

        {isBlocked ? (
          <Stack spacing={2}>
            <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
              인증 시도 횟수를 초과했습니다.
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleResendCode}
              disabled={isLoading}
              sx={{ py: 1.5, fontSize: '1rem' }}
            >
              {isLoading ? '재전송 중...' : '새로운 코드 받기'}
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={handleBackToEmail}
              sx={{ py: 1.5, fontSize: '1rem' }}
            >
              이메일 주소 변경
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleVerifyCode}
              disabled={isLoading || !validateCode(code)}
              sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
            >
              {isLoading ? '확인 중...' : '인증 확인'}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={handleResendCode}
              disabled={isLoading}
              sx={{ py: 1.5, fontSize: '1rem' }}
            >
              {isLoading ? '재전송 중...' : '인증 코드 재전송'}
            </Button>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default ForgotPasswordVerify;

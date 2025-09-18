import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, TextField, Typography, Stack, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '../lib/api';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email && location.state?.resetToken) {
      setEmail(location.state.email);
      setResetToken(location.state.resetToken);
    } else {
      navigate('/forgot-password');
    }
  }, [location.state, navigate]);

  const validatePassword = (password: string) => {
    // 8자 이상, 문자, 숫자, 특수문자 포함
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasMinLength && hasLetter && hasNumber && hasSpecialChar;
  };

  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    if (password && !validatePassword(password)) {
      setPasswordError('비밀번호는 8자 이상, 문자, 숫자, 특수문자를 포함해야 합니다.');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (confirmPassword: string) => {
    setConfirmPassword(confirmPassword);
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleResetPassword = async () => {
    let isValid = true;

    if (!newPassword) {
      setPasswordError('새 비밀번호를 입력해주세요.');
      isValid = false;
    } else if (!validatePassword(newPassword)) {
      setPasswordError('비밀번호는 8자 이상, 문자, 숫자, 특수문자를 포함해야 합니다.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('비밀번호 확인을 입력해주세요.');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (!isValid) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: 백엔드 연동
      await api.confirmPasswordReset(newPassword, resetToken);
      alert('비밀번호가 성공적으로 재설정되었습니다.');
      navigate('/login');
    } catch (error: any) {
      console.error('비밀번호 재설정 실패:', error);
      alert('비밀번호 재설정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
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
          새 비밀번호 설정
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ width: '100%', maxWidth: '420px', mt: 4, mx: 'auto', p: 2 }}>
        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}>
          새 비밀번호 설정
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
          새로운 비밀번호를 설정해주세요.
        </Typography>

        <TextField
          label="새 비밀번호"
          variant="outlined"
          fullWidth
          type="password"
          value={newPassword}
          onChange={(e) => handlePasswordChange(e.target.value)}
          error={!!passwordError}
          helperText={passwordError || '8자 이상, 문자, 숫자, 특수문자 포함'}
        />

        <TextField
          label="새 비밀번호 확인"
          variant="outlined"
          fullWidth
          type="password"
          value={confirmPassword}
          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
          error={!!confirmPasswordError}
          helperText={confirmPasswordError}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleResetPassword}
          disabled={isLoading || !validatePassword(newPassword) || newPassword !== confirmPassword}
          sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
        >
          {isLoading ? '설정 중...' : '비밀번호 재설정'}
        </Button>

        <Button
          variant="text"
          fullWidth
          onClick={() => navigate('/login')}
          sx={{ py: 1.5, fontSize: '1rem' }}
        >
          로그인 페이지로 돌아가기
        </Button>
      </Stack>
    </Box>
  );
};

export default ResetPassword;

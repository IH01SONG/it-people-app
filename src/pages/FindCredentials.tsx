import React, { useState } from 'react';
import { Box, Button, Typography, Stack, IconButton, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const FindCredentials: React.FC = () => {
  const navigate = useNavigate();
  const [findIdEmail, setFindIdEmail] = useState('');
  const [resetPwEmail, setResetPwEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleFindId = () => {
    alert(`입력된 이메일(${findIdEmail})로 아이디를 전송했습니다.`);
    // Implement actual find ID logic
  };

  const handleResetPassword = () => {
    if (newPassword !== confirmNewPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    alert(`입력된 이메일(${resetPwEmail})로 비밀번호 재설정을 완료했습니다.`);
    // Implement actual reset password logic
  };

  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', mr: 4 }}>
          아이디 / 비밀번호 찾기
        </Typography>
      </Box>
      <Box p={2} display="flex" flexDirection="column" alignItems="center">
        <Stack spacing={4} sx={{ width: '100%', maxWidth: '400px', mt: 3 }}>
          {/* 아이디 찾기 */}
          <Box>
            <Typography variant="h6" mb={2}>아이디 찾기</Typography>
            <TextField
              label="이메일 주소 입력"
              variant="outlined"
              fullWidth
              value={findIdEmail}
              onChange={(e) => setFindIdEmail(e.target.value)}
              type="email"
              sx={{ mb: 2 }}
            />
            <Button variant="contained" fullWidth onClick={handleFindId}>
              아이디 찾기
            </Button>
          </Box>

          {/* 비밀번호 재설정 */}
          <Box>
            <Typography variant="h6" mb={2}>비밀번호 재설정</Typography>
            <TextField
              label="등록된 이메일 주소 입력"
              variant="outlined"
              fullWidth
              value={resetPwEmail}
              onChange={(e) => setResetPwEmail(e.target.value)}
              type="email"
              sx={{ mb: 2 }}
            />
            <TextField
              label="새 비밀번호 (문자, 숫자, 특수문자 포함 8~20자)"
              variant="outlined"
              fullWidth
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="새 비밀번호 확인"
              variant="outlined"
              fullWidth
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" fullWidth onClick={handleResetPassword}>
              비밀번호 재설정
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default FindCredentials;

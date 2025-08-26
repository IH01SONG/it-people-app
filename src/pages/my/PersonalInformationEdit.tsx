import React, { useState } from 'react';
import { Box, Button, Typography, Stack, IconButton, TextField, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';

const PersonalInformationEdit: React.FC = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('현재 닉네임');
  const [email, setEmail] = useState('current@example.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleProfileImageChange = () => {
    // Implement logic to open file picker or photo album
    alert('파일 첨부 또는 사진첩으로 이동하여 사진을 편집할 수 있는 기능 구현 예정');
  };

  const handleSaveChanges = () => {
    // Implement logic to save changes
    alert('개인 정보가 저장되었습니다.');
    navigate(-1);
  };

  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', mr: 4 }}>
          개인 정보 수정
        </Typography>
      </Box>
      <Box p={2} display="flex" flexDirection="column" alignItems="center">
        <Stack spacing={3} sx={{ width: '100%', maxWidth: '400px', mt: 3, alignItems: 'center' }}>
          <Box sx={{ position: 'relative', mt: 4, mb: 3 }}>
            <Avatar
              alt="프로필 이미지"
              src={profileImage || "/placeholder-avatar.jpg"}
              sx={{ width: 100, height: 100 }}
            />
            <IconButton
              size="small"
              onClick={handleProfileImageChange}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <AddCircleIcon />
            </IconButton>
          </Box>

          <TextField
            label="닉네임"
            variant="outlined"
            fullWidth
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <TextField
            label="이메일"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <TextField
            label="새 비밀번호 (선택 사항)"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="새 비밀번호 확인 (선택 사항)"
            variant="outlined"
            fullWidth
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button variant="contained" fullWidth className="py-3 text-lg" onClick={handleSaveChanges}>
            저장
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default PersonalInformationEdit;

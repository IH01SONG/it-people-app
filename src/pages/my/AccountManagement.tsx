import React from 'react';
import { Box, Button, Typography, Stack, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext'; // Import useAuth

const AccountManagement: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Use the useAuth hook

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', mr: 4 }}>
          계정 관리
        </Typography>
      </Box>
      <Box p={2}>
        <Stack spacing={2} mt={3}>
          <Button variant="outlined" fullWidth className="py-3 text-lg" onClick={() => navigate('/my/personal-info-edit')}>
            개인 정보 수정
          </Button>
          <Button variant="outlined" fullWidth className="py-3 text-lg" onClick={() => navigate('/my/location-permission-settings')}>
            위치 권한 설정
          </Button>
          <Button variant="outlined" fullWidth className="py-3 text-lg" onClick={() => navigate('/my/notification-settings')}>
            알림 설정
          </Button>
          <Button variant="contained" color="error" fullWidth className="py-3 text-lg" onClick={handleLogout}>
            로그아웃
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default AccountManagement;

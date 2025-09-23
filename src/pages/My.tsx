import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Stack, createTheme, ThemeProvider, IconButton, TextField } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../auth/AuthContext';
import { api } from '../lib/api';
import ProfileImageUpload from '../components/ProfileImageUpload';

const theme = createTheme({
  palette: {
    primary: {
      main: "#E762A9",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const My: React.FC = () => {
  const { user } = useAuth();
  const [nickname, setNickname] = useState(user?.name || '사용자 닉네임');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 사용자 정보 로드
  useEffect(() => {
    if (user) {
      loadUserInfo();
    }
  }, [user]);

  const handleProfileImageChange = (imageUrl: string | null) => {
    console.log('🔄 프로필 이미지 변경:', imageUrl);
    setProfileImage(imageUrl);
    
    // 서버 이미지인 경우에만 사용자 정보를 다시 로드
    if (imageUrl && !imageUrl.startsWith('blob:')) {
      setTimeout(() => {
        loadUserInfo();
      }, 1000);
    }
  };

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const userInfo = await api.users.getMe();
      console.log('👤 사용자 정보 로드:', userInfo);
      setNickname(userInfo.nickname || userInfo.name || '사용자 닉네임');
      
      // 프로필 이미지 URL에 타임스탬프 추가하여 캐시 무효화
      const profileImageUrl = userInfo.profileImage;
      if (profileImageUrl) {
        const imageUrlWithTimestamp = `${profileImageUrl}?t=${Date.now()}`;
        console.log('🖼️ 프로필 이미지 URL (캐시 무효화):', imageUrlWithTimestamp);
        setProfileImage(imageUrlWithTimestamp);
      } else {
        setProfileImage(null);
      }
    } catch (err) {
      console.error('Failed to load user info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNicknameEdit = () => {
    setIsEditingNickname(true);
    // In a real app, this would open a dialog or inline editor
  };

  const handleNicknameSave = () => {
    setIsEditingNickname(false);
    alert('닉네임 저장됨: ' + nickname);
    // Implement logic to save nickname
  };


  return (
    <ThemeProvider theme={theme}>
      <Box className="flex flex-col items-center h-screen bg-white w-full">
        {/* Header */}
        <Box className="w-full flex items-center justify-center p-4 bg-primary" sx={{ backgroundColor: theme.palette.primary.main }}>
          <Typography variant="h6" className="text-white font-bold">
            마이페이지
          </Typography>
        </Box>

        {/* Main Content - 기존 구조 유지하면서 크기만 키움 */}
        <Box className="flex flex-col items-center w-full flex-1 px-6 py-6 justify-center">
          {/* Profile Section */}
          <Box className="mb-10">
            <ProfileImageUpload
              currentImage={profileImage}
              onImageChange={handleProfileImageChange}
              size={120}
              disabled={loading}
            />
          </Box>

          {/* User Info Section */}
          <Box className="flex flex-col items-center mb-10">
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {user?.email}
            </Typography>
            {isEditingNickname ? (
              <Box className="flex items-center">
                <TextField
                  variant="outlined"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  autoFocus
                  size="small"
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleNicknameSave}
                  sx={{ ml: 1 }}
                >
                  저장
                </Button>
              </Box>
            ) : (
              <Box className="flex items-center">
                <Typography variant="h4" className="font-bold mr-2" onClick={handleNicknameEdit} sx={{ cursor: 'pointer' }}>
                  {nickname}
                </Typography>
                <IconButton size="small" onClick={handleNicknameEdit}>
                  <EditIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Action Buttons - 기존 구조 유지, 색상 카드만 적용 */}
          <Stack spacing={4} className="w-full max-w-sm">
            <Button
              variant="contained"
              fullWidth
              className="py-5 text-2xl font-semibold"
              onClick={() => navigate('/my/activity')}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                borderRadius: 3,
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: 4,
                },
              }}
            >
              내활동
            </Button>
            <Button
              variant="contained"
              fullWidth
              className="py-5 text-2xl font-semibold"
              onClick={() => navigate('/inquiry')}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                borderRadius: 3,
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: 4,
                },
              }}
            >
              고객문의
            </Button>
            <Button
              variant="contained"
              fullWidth
              className="py-5 text-2xl font-semibold"
              onClick={() => navigate('/my/terms')}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                borderRadius: 3,
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: 4,
                },
              }}
            >
              약관
            </Button>
            <Button
              variant="contained"
              fullWidth
              className="py-5 text-2xl font-semibold"
              onClick={() => navigate('/my/account-management')}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                borderRadius: 3,
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: 4,
                },
              }}
            >
              계정관리
            </Button>
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default My;
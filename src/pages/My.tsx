import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Stack, createTheme, ThemeProvider, IconButton, Avatar, TextField } from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';

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
  const [nickname, setNickname] = useState('사용자 닉네임');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null); // State for profile image
  const navigate = useNavigate();

  const handleProfileImageChange = () => {
    alert('프로필 사진 수정');
    // Implement logic to open file picker and update profileImage state
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
          <Box className="relative mb-10">
            <Avatar
              alt="프로필 이미지"
              src={profileImage || "/placeholder-avatar.jpg"}
              sx={{ width: 120, height: 120 }}
            />
            <IconButton
              aria-label="프로필 사진 수정"
              size="small"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
              onClick={handleProfileImageChange}
            >
              <AddCircleIcon />
            </IconButton>
          </Box>

          {/* Nickname Section */}
          <Box className="flex items-center mb-10">
            {isEditingNickname ? (
              <>
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
              </>
            ) : (
              <Typography variant="h4" className="font-bold mr-2" onClick={handleNicknameEdit} sx={{ cursor: 'pointer' }}>
                {nickname}
              </Typography>
            )}
            {!isEditingNickname && (
              <IconButton size="small" onClick={handleNicknameEdit}>
                <EditIcon />
              </IconButton>
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
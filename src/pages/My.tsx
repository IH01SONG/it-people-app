import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Stack, createTheme, ThemeProvider, IconButton, Avatar } from "@mui/material";
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
      <Box className="flex flex-col items-center min-h-screen bg-white w-full">
        {/* Header */}
        <Box className="w-full flex items-center justify-center p-4 bg-primary" sx={{ backgroundColor: theme.palette.primary.main }}>
          <Typography variant="h6" className="text-white font-bold">
            마이페이지
          </Typography>
        </Box>

        {/* Profile Section */}
        <Box className="relative mt-8 mb-6">
          <Avatar
            alt="프로필 이미지"
            src={profileImage || "/placeholder-avatar.jpg"} // Replace with actual placeholder or user image
            sx={{ width: 100, height: 100 }}
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
            <TextField
              variant="outlined"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onBlur={handleNicknameSave} // Save on blur
              autoFocus
              size="small"
            />
          ) : (
            <Typography variant="h5" className="font-bold mr-2">
              {nickname}
            </Typography>
          )}
          <IconButton size="small" onClick={handleNicknameEdit}>
            <EditIcon />
          </IconButton>
        </Box>

        {/* Action Buttons */}
        <Stack spacing={2} className="w-full max-w-sm px-6">
          <Button
            variant="outlined"
            fullWidth
            className="py-3 text-lg"
            onClick={() => navigate('/my/activity')}
          >
            내활동
          </Button>
          <Button
            variant="outlined"
            fullWidth
            className="py-3 text-lg"
            onClick={() => navigate('/inquiry')}
          >
            고객문의
          </Button>
          <Button
            variant="outlined"
            fullWidth
            className="py-3 text-lg"
            onClick={() => alert('약관')}
          >
            약관
          </Button>
          <Button
            variant="outlined"
            fullWidth
            className="py-3 text-lg"
            onClick={() => alert('계정관리')}
          >
            계정관리
          </Button>
        </Stack>
      </Box>
    </ThemeProvider>
  );
};

export default My;

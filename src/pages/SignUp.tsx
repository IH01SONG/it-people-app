import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Stack, createTheme, ThemeProvider, IconButton } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the back arrow icon

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

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const navigate = useNavigate();

  const handleSignUp = () => {
    // Implement sign up logic here
    console.log('Sign Up clicked', { email, password, confirmPassword, name, dateOfBirth });
    alert('회원가입이 완료되었습니다.');
    navigate('/login');
  };

  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="flex flex-col items-center min-h-screen bg-white w-full">
        {/* Header */}
        <Box className="w-full flex items-center justify-between p-4 bg-primary" sx={{ backgroundColor: theme.palette.primary.main }}>
          <IconButton onClick={handleCancel} className="text-white">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" className="text-white font-bold flex-grow text-center">
            회원가입
          </Typography>
          <Box sx={{ width: 48 }} /> {/* Spacer for alignment */}
        </Box>

        <Stack spacing={2} className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md mt-5">
          <Typography variant="subtitle2" color="textSecondary">이메일</Typography>
          <TextField
            label="이메일"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2"
          />
          <Typography variant="subtitle2" color="textSecondary">비밀번호</Typography>
          <TextField
            label="비밀번호"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-2"
          />
          <Typography variant="subtitle2" color="textSecondary">비밀번호 확인</Typography>
          <TextField
            label="비밀번호 확인"
            type="password"
            variant="outlined"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mb-2"
          />
          <Typography variant="subtitle2" color="textSecondary">이름</Typography>
          <TextField
            label="이름"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-2"
          />
          <Typography variant="subtitle2" color="textSecondary">생년월일</Typography>
          <TextField
            label="생년월일"
            type="date"
            variant="outlined"
            fullWidth
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            InputLabelProps={{ shrink: true }}
            className="mb-4"
          />
          <Stack direction="row" spacing={2} className="w-full justify-between mt-4">
            <Button
              variant="contained"
              color="primary"
              className="flex-grow py-3 text-lg"
              onClick={handleSignUp}
            >
              가입하기
            </Button>
            <Button
              variant="outlined"
              color="primary"
              className="flex-grow py-3 text-lg"
              onClick={handleCancel}
            >
              가입취소
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
};

export default SignUp; 
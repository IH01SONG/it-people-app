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
  const [nickname, setNickname] = useState(''); // New state for nickname
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [nicknameError, setNicknameError] = useState(''); // New state for nickname error
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password: string) => {
    // Password must be 8-20 characters and include at least one letter, one number, and one special character.
    const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
    return re.test(password);
  };

  const handleEmailVerification = () => {
    if (!validateEmail(email)) {
      setEmailError('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    setEmailError('');
    // Simulate sending verification email
    alert(`인증 이메일이 ${email}으로 전송되었습니다.`);
    setIsEmailVerified(true);
  };

  const handleSignUp = () => {
    let isValid = true;

    // Email validation
    if (!email) {
      setEmailError('이메일 주소를 입력해주세요.');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('유효한 이메일 주소를 입력해주세요.');
      isValid = false;
    } else if (!isEmailVerified) {
      setEmailError('이메일 인증을 완료해주세요.');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError('비밀번호는 문자, 숫자, 특수문자 포함 8~20자여야 합니다.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError('비밀번호를 재입력해주세요.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    // Name validation
    if (!name) {
      setNameError('이름을 입력해주세요.');
      isValid = false;
    } else {
      setNameError('');
    }

    // Nickname validation
    if (!nickname) {
      setNicknameError('닉네임을 입력해주세요.');
      isValid = false;
    } else {
      setNicknameError('');
    }

    if (!isValid) {
      alert('입력한 정보를 다시 확인해주세요.');
      return;
    }

    // Implement sign up logic here
    console.log('Sign Up clicked', { email, password, confirmPassword, name, nickname, dateOfBirth });
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
          <Typography variant="subtitle2" color="textSecondary">이메일 주소</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label="이메일 주소 입력"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
              type="email"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleEmailVerification}
              disabled={isEmailVerified}
              sx={{ whiteSpace: 'nowrap', px: 2 }}
            >
              {isEmailVerified ? '인증 완료' : '이메일 인증'}
            </Button>
          </Box>
          <Typography variant="subtitle2" color="textSecondary">닉네임</Typography>
          <TextField
            label="닉네임을 입력해주세요"
            variant="outlined"
            fullWidth
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            error={!!nicknameError}
            helperText={nicknameError}
          />
          <Typography variant="subtitle2" color="textSecondary">비밀번호</Typography>
          <TextField
            label="비밀번호 입력(문자, 숫자, 특수문자 포함 8~20자)"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
          />
          <Typography variant="subtitle2" color="textSecondary">비밀번호 확인</Typography>
          <TextField
            label="비밀번호 재입력"
            type="password"
            variant="outlined"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!confirmPasswordError}
            helperText={confirmPasswordError}
          />
          <Typography variant="subtitle2" color="textSecondary">이름</Typography>
          <TextField
            label="이름을 입력해주세요"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!nameError}
            helperText={nameError}
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
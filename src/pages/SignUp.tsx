// src/pages/Signup.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Stack, createTheme, ThemeProvider, IconButton,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AreaSelectionModal from '../components/AreaSelectionModal';
import { api } from '../lib/api';

const theme = createTheme({
  palette: { primary: { main: "#E762A9" } },
  components: { MuiButton: { styleOverrides: { root: { textTransform: 'none' } } } },
});

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailUsername, setEmailUsername] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [customEmailDomain, setCustomEmailDomain] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [dateOfBirthError, setDateOfBirthError] = useState(''); // New state for date of birth error
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showAreaSelectionModal, setShowAreaSelectionModal] = useState(false);
  const [selectedAutonomousDistrict, setSelectedAutonomousDistrict] = useState<string | null>(null);
  const [selectedGeneralDistrict, setSelectedGeneralDistrict] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateEmail = (email: string) =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(String(email).toLowerCase());

  const validatePassword = (pwd: string) =>
    pwd.length >= 6; // Password must be 6 characters or more

  const handleEmailVerification = () => {
    // Combine emailUsername and emailDomain to form the full email
    const fullEmail = emailDomain === 'custom' ? `${emailUsername}@${customEmailDomain}` : `${emailUsername}@${emailDomain}`;
    setEmail(fullEmail);
    if (!validateEmail(fullEmail)) {
      setEmailError('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    setEmailError('');
    alert(`인증 이메일이 ${fullEmail}으로 전송되었습니다.`);
    setIsEmailVerified(true);
  };

  const handleSignUp = async () => {
    let isValid = true;

    // Combine emailUsername and emailDomain to form the full email for signup
    const fullEmail = emailDomain === 'custom' ? `${emailUsername}@${customEmailDomain}` : `${emailUsername}@${emailDomain}`;
    setEmail(fullEmail);

    if (!emailUsername || !emailDomain || (emailDomain === 'custom' && !customEmailDomain)) { setEmailError('이메일 주소를 입력해주세요.'); isValid = false; }
    else if (!validateEmail(fullEmail)) { setEmailError('유효한 이메일 주소를 입력해주세요.'); isValid = false; }
    else if (!isEmailVerified) { setEmailError('이메일 인증을 완료해주세요.'); isValid = false; }
    else setEmailError('');

    if (!password) { setPasswordError('비밀번호를 입력해주세요.'); isValid = false; }
    else if (!validatePassword(password)) { setPasswordError('비밀번호는 6자 이상이어야 합니다.'); isValid = false; }
    else setPasswordError('');

    if (!confirmPassword) { setConfirmPasswordError('비밀번호를 재입력해주세요.'); isValid = false; }
    else if (password !== confirmPassword) { setConfirmPasswordError('비밀번호가 일치하지 않습니다.'); isValid = false; }
    else setConfirmPasswordError('');

    if (!name) { setNameError('이름을 입력해주세요.'); isValid = false; }
    else setNameError('');

    if (!nickname) { setNicknameError('닉네임을 입력해주세요.'); isValid = false; }
    else if (nickname.length < 2 || nickname.length > 20) { setNicknameError('닉네임은 2자 이상 20자 이하이어야 합니다.'); isValid = false; }
    else setNicknameError('');

    if (!dateOfBirth) { setDateOfBirthError('생년월일을 입력해주세요.'); isValid = false; }
    else {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 14) { setDateOfBirthError('만 14세 이상만 가입할 수 있습니다.'); isValid = false; }
      else setDateOfBirthError('');
    }

    if (!isValid) {
      alert('입력한 정보를 다시 확인해주세요.');
      return;
    }

    try {
      // ✅ 서버가 기대하는 키에 맞춰 매핑 (dateOfBirth -> birth)
      const payload = {
        email,
        password,
        name,
        birth: dateOfBirth,
        nickname, // 서버가 받으면 저장, 아니면 무시
        // 선택사항: 지역도 서버가 받는다면 아래 포함
        // autonomousDistrict: selectedAutonomousDistrict,
        // generalDistrict: selectedGeneralDistrict,
      };

      const res = await api.signup(payload as any);
      // 서버 응답 케이스별 안전 처리
      const msg = (res && (res.message || res.msg)) ?? '회원가입이 완료되었습니다.';
      alert(msg);

      // (선택) 자동 로그인까지 진행하고 싶으면 아래 사용:
      // const { token } = await api.login(email, password);
      // localStorage.setItem('access_token', token);
      // navigate('/', { replace: true });

      // 기본: 로그인 페이지로 이동
      navigate('/login', { replace: true });
    } catch (error: any) {
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        error?.message ||
        '회원가입 중 오류가 발생했습니다.';
      alert(serverMsg);
    }
  };

  const handleCancel = () => navigate(-1);

  const handleAreaSelect = (district: string | null, generalDistrict: string | null) => {
    setSelectedAutonomousDistrict(district);
    setSelectedGeneralDistrict(generalDistrict);
    setShowAreaSelectionModal(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="flex flex-col items-center min-h-screen bg-white w-full">
        {/* Header */}
        <Box className="w-full flex items-center justify-between p-4 bg-primary" sx={{ backgroundColor: theme.palette.primary.main }}>
          <IconButton onClick={handleCancel} className="text-white"><ArrowBackIcon /></IconButton>
          <Typography variant="h6" className="text-white font-bold flex-grow text-center">회원가입</Typography>
          <Box sx={{ width: 48 }} />
        </Box>

        <Stack spacing={2} className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md mt-5">
          <Typography variant="subtitle2" color="textSecondary">이메일 주소</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label="계정"
              variant="outlined"
              value={emailUsername}
              onChange={(e) => setEmailUsername(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Typography variant="body1">@</Typography>
            <TextField
              select
              label="도메인"
              variant="outlined"
              value={emailDomain}
              onChange={(e) => {
                setEmailDomain(e.target.value);
                if (e.target.value !== 'custom') {
                  setCustomEmailDomain('');
                }
              }}
              sx={{ width: 120 }}
              SelectProps={{
                native: true,
              }}
            >
              <option value="" disabled>선택</option>
              <option value="naver.com">naver.com</option>
              <option value="gmail.com">gmail.com</option>
              <option value="hanmail.net">hanmail.net</option>
              <option value="daum.net">daum.net</option>
              <option value="hotmail.com">hotmail.com</option>
              <option value="custom">직접 입력</option>
            </TextField>
          </Box>
          {emailDomain === 'custom' && (
            <TextField
              label="직접 입력 (예: example.com)"
              variant="outlined"
              fullWidth
              value={customEmailDomain}
              onChange={(e) => setCustomEmailDomain(e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
          {emailError && (
            <Typography color="error" variant="body2">{emailError}</Typography>
          )}
          <Button variant="contained" color="primary" onClick={handleEmailVerification} disabled={isEmailVerified} sx={{ whiteSpace: 'nowrap', px: 2 }}>
            {isEmailVerified ? '인증 완료' : '이메일 인증'}
          </Button>

          <Button variant="outlined" color="primary" fullWidth onClick={() => setShowAreaSelectionModal(true)} sx={{ mt: 2, mb: 1 }}>
            활동 지역 설정
          </Button>
          {selectedAutonomousDistrict && selectedGeneralDistrict && (
            <Typography variant="body2" color="text.secondary" mt={1} mb={2}>
              선택된 지역: {selectedAutonomousDistrict} {selectedGeneralDistrict}
            </Typography>
          )}

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
            error={!!dateOfBirthError}
            helperText={dateOfBirthError}
            className="mb-4"
          />

          <Stack direction="row" spacing={2} className="w-full justify-between mt-4">
            <Button variant="contained" color="primary" className="flex-grow py-3 text-lg" onClick={handleSignUp}>
              가입하기
            </Button>
            <Button variant="outlined" color="primary" className="flex-grow py-3 text-lg" onClick={handleCancel}>
              가입취소
            </Button>
          </Stack>
        </Stack>
      </Box>

      <AreaSelectionModal
        open={showAreaSelectionModal}
        onClose={() => setShowAreaSelectionModal(false)}
        onSelectArea={handleAreaSelect}
      />
    </ThemeProvider>
  );
};

export default SignUp;

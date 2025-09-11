import React, { useState } from 'react';
import { Box, Button, Typography, Stack, IconButton, TextField, Tabs, Tab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const FindCredentials: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState(0); // State for tab selection

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const [findIdName, setFindIdName] = useState('');
  const [findIdDob, setFindIdDob] = useState('');
  const [foundEmail, setFoundEmail] = useState<string | null>(null);

  const [resetPwEmail, setResetPwEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetPwStep, setResetPwStep] = useState<'email' | 'verify' | 'new-password'>('email');
  
  // 비밀번호 검증을 위한 상태
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleFindId = () => {
    if (!findIdName || !findIdDob) {
      alert('이름과 생년월일을 모두 입력해주세요.');
      return;
    }
    // Simulate finding email based on name and dob
    const dummyEmail = 'user****@example.com'; // Masked email
    setFoundEmail(dummyEmail);
    alert(`회원님의 이메일 주소는 ${dummyEmail} 입니다.`);
  };

  const handleSendVerificationCode = () => {
    if (!resetPwEmail) {
      alert('이메일 주소를 입력해주세요.');
      return;
    }
    // Simulate sending verification code
    alert(`인증 코드가 ${resetPwEmail}으로 전송되었습니다.`);
    setResetPwStep('verify');
  };

  const handleVerifyCode = () => {
    if (verificationCode === '123456') { // Dummy code for verification
      alert('이메일이 확인되었습니다. 새 비밀번호를 설정해주세요.');
      setResetPwStep('new-password');
    } else {
      alert('유효하지 않은 인증 코드입니다.');
    }
  };

  const validatePassword = (password: string) => {
    // 비밀번호는 8자 이상, 문자, 숫자, 특수문자 포함
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
    setConfirmNewPassword(confirmPassword);
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleResetPassword = () => {
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

    if (!confirmNewPassword) {
      setConfirmPasswordError('비밀번호 확인을 입력해주세요.');
      isValid = false;
    } else if (newPassword !== confirmNewPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (!isValid) {
      alert('입력한 정보를 다시 확인해주세요.');
      return;
    }

    alert('비밀번호가 성공적으로 재설정되었습니다.');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetPwEmail('');
    setResetPwStep('email');
    navigate('/login'); // Redirect to login after successful reset
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
          이메일 / 비밀번호 찾기
        </Typography>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleTabChange} aria-label="find credentials tabs" centered>
          <Tab label="이메일 찾기" {...a11yProps(0)} />
          <Tab label="비밀번호 찾기" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Stack spacing={3} sx={{ width: '100%', maxWidth: '400px', mt: 3, mx: 'auto' }}>
          <TextField
            label="이름을 입력해주세요"
            variant="outlined"
            fullWidth
            value={findIdName}
            onChange={(e) => setFindIdName(e.target.value)}
          />
          <TextField
            label="생년월일 (YYYY-MM-DD)"
            variant="outlined"
            fullWidth
            type="date"
            value={findIdDob}
            onChange={(e) => setFindIdDob(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" fullWidth onClick={handleFindId}>
            확인
          </Button>
          {foundEmail && (
            <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
              가입 시 사용한 이메일: <strong>{foundEmail}</strong>
            </Typography>
          )}
        </Stack>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Stack spacing={3} sx={{ width: '100%', maxWidth: '400px', mt: 3, mx: 'auto' }}>
          {resetPwStep === 'email' && (
            <>
              <TextField
                label="등록된 이메일 주소 입력"
                variant="outlined"
                fullWidth
                value={resetPwEmail}
                onChange={(e) => setResetPwEmail(e.target.value)}
                type="email"
              />
              <Button variant="contained" fullWidth onClick={handleSendVerificationCode}>
                인증 코드 발송
              </Button>
            </>
          )}

          {resetPwStep === 'verify' && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {resetPwEmail}으로 발송된 인증 코드를 입력해주세요.
              </Typography>
              <TextField
                label="인증 코드 입력"
                variant="outlined"
                fullWidth
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <Button variant="contained" fullWidth onClick={handleVerifyCode}>
                인증 확인
              </Button>
            </>
          )}

          {resetPwStep === 'new-password' && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                새로운 비밀번호를 설정해주세요.
              </Typography>
              <TextField
                label="새 비밀번호 (문자, 숫자, 특수문자 포함 8~20자)"
                variant="outlined"
                fullWidth
                type="password"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
                sx={{ mb: 2 }}
              />
              <TextField
                label="새 비밀번호 확인"
                variant="outlined"
                fullWidth
                type="password"
                value={confirmNewPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
                sx={{ mb: 2 }}
              />
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleResetPassword}
                sx={{ 
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                비밀번호 재설정
              </Button>
            </>
          )}
        </Stack>
      </CustomTabPanel>
    </Box>
  );
};

export default FindCredentials;

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
  const [isEmailChecked, setIsEmailChecked] = useState(false); // isEmailVerified -> isEmailChecked
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [nicknameCheckLoading, setNicknameCheckLoading] = useState(false);
  const [showAreaSelectionModal, setShowAreaSelectionModal] = useState(false);
  const [selectedAutonomousDistrict, setSelectedAutonomousDistrict] = useState<string | null>(null);
  const [selectedGeneralDistrict, setSelectedGeneralDistrict] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateEmail = (email: string) =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(String(email).toLowerCase());

  const validatePassword = (pwd: string) =>
    pwd.length >= 6; // Password must be 6 characters or more

  const handleEmailCheck = async () => { // handleEmailVerification -> handleEmailCheck
    const fullEmail = emailDomain === 'custom' ? `${emailUsername}@${customEmailDomain}` : `${emailUsername}@${emailDomain}`;
    setEmail(fullEmail);
    if (!validateEmail(fullEmail)) {
      setEmailError('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    setEmailError('');

    try {
      const response = await api.checkEmail(fullEmail);
      if (response.isAvailable) { // response.available -> response.isAvailable
        setIsEmailChecked(true);
        alert(response.message || '사용 가능한 이메일입니다.'); // response.message 활용
      } else {
        setEmailError(response.message || '이미 사용 중인 이메일입니다.'); // response.message 활용
        setIsEmailChecked(false);
      }
    } catch (error: any) {
      console.error('이메일 중복 확인 실패:', error);
      const errorMsg = error?.response?.data?.message || 
                      error?.response?.data?.msg || 
                      error?.message || 
                      '이메일 중복 확인 중 오류가 발생했습니다.';
      setEmailError(errorMsg);
      setIsEmailChecked(false);
    }
  }; // End of handleEmailCheck

  const handleNicknameCheck = async () => {
    if (!nickname) {
      setNicknameError('닉네임을 입력해주세요.');
      return;
    }
    
    if (nickname.length < 2 || nickname.length > 20) {
      setNicknameError('닉네임은 2자 이상 20자 이하이어야 합니다.');
      return;
    }

    setNicknameCheckLoading(true);
    setNicknameError('');

    try {
      // 백엔드 명세에 닉네임 중복 확인 API가 없으므로 임시로 주석 처리
      // const response = await api.checkNickname(nickname);
      // if (response.available) {
      //   setIsNicknameChecked(true);
      //   alert('사용 가능한 닉네임입니다.');
      // } else {
      //   setNicknameError('이미 사용 중인 닉네임입니다.');
      //   setIsNicknameChecked(false);
      // }

      // 닉네임 중복 확인 API가 없으므로 항상 사용 가능하다고 가정 (임시)
      setIsNicknameChecked(true);
      alert('사용 가능한 닉네임입니다.');

    } catch (error: any) {
      console.error('닉네임 중복 확인 실패:', error);
      const errorMsg = error?.response?.data?.message || 
                      error?.response?.data?.msg || 
                      error?.message || 
                      '닉네임 중복 확인 중 오류가 발생했습니다.';
      setNicknameError(errorMsg);
      setIsNicknameChecked(false);
    } finally {
      setNicknameCheckLoading(false);
    }
  };

  const handleSignUp = async () => {
    let isValid = true;
    const missingFields: string[] = [];

    // Combine emailUsername and emailDomain to form the full email for signup
    const fullEmail = emailDomain === 'custom' ? `${emailUsername}@${customEmailDomain}` : `${emailUsername}@${emailDomain}`;
    setEmail(fullEmail);

    // 디버깅을 위한 로그
    console.log('=== 회원가입 폼 상태 ===');
    console.log('emailUsername:', emailUsername);
    console.log('emailDomain:', emailDomain);
    console.log('customEmailDomain:', customEmailDomain);
    console.log('fullEmail:', fullEmail);
    console.log('isEmailChecked:', isEmailChecked);
    console.log('password:', password);
    console.log('confirmPassword:', confirmPassword);
    console.log('name:', name);
    console.log('nickname:', nickname);
    console.log('isNicknameChecked:', isNicknameChecked);
    console.log('dateOfBirth:', dateOfBirth);
    console.log('selectedAutonomousDistrict:', selectedAutonomousDistrict);
    console.log('selectedGeneralDistrict:', selectedGeneralDistrict);

    // 이메일 검증
    if (!emailUsername || !emailDomain || (emailDomain === 'custom' && !customEmailDomain)) { 
      console.log('❌ 이메일 입력 누락');
      setEmailError('이메일 주소를 입력해주세요.'); 
      isValid = false; 
      missingFields.push('이메일');
    }
    else if (!validateEmail(fullEmail)) { 
      console.log('❌ 이메일 형식 오류');
      setEmailError('유효한 이메일 주소를 입력해주세요.'); 
      isValid = false; 
    }
    else if (!isEmailChecked) { 
      console.log('❌ 이메일 중복 확인 미완료');
      setEmailError('이메일 중복 확인을 완료해주세요.'); 
      isValid = false; 
      missingFields.push('이메일 중복 확인');
    }
    else {
      console.log('✅ 이메일 검증 통과');
      setEmailError('');
    }

    // 비밀번호 검증
    if (!password) { 
      console.log('❌ 비밀번호 입력 누락');
      setPasswordError('비밀번호를 입력해주세요.'); 
      isValid = false; 
      missingFields.push('비밀번호');
    }
    else if (!validatePassword(password)) { 
      console.log('❌ 비밀번호 길이 부족');
      setPasswordError('비밀번호는 6자 이상이어야 합니다.'); 
      isValid = false; 
    }
    else {
      console.log('✅ 비밀번호 검증 통과');
      setPasswordError('');
    }

    // 비밀번호 확인 검증
    if (!confirmPassword) { 
      console.log('❌ 비밀번호 확인 입력 누락');
      setConfirmPasswordError('비밀번호를 재입력해주세요.'); 
      isValid = false; 
      missingFields.push('비밀번호 확인');
    }
    else if (password !== confirmPassword) { 
      console.log('❌ 비밀번호 불일치');
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.'); 
      isValid = false; 
    }
    else {
      console.log('✅ 비밀번호 확인 검증 통과');
      setConfirmPasswordError('');
    }

    // 이름 검증
    if (!name) { 
      console.log('❌ 이름 입력 누락');
      setNameError('이름을 입력해주세요.'); 
      isValid = false; 
      missingFields.push('이름');
    }
    else {
      console.log('✅ 이름 검증 통과');
      setNameError('');
    }

    // 닉네임 검증
    if (!nickname) { 
      console.log('❌ 닉네임 입력 누락');
      setNicknameError('닉네임을 입력해주세요.'); 
      isValid = false; 
      missingFields.push('닉네임');
    }
    else if (nickname.length < 2 || nickname.length > 20) { 
      console.log('❌ 닉네임 길이 오류');
      setNicknameError('닉네임은 2자 이상 20자 이하이어야 합니다.'); 
      isValid = false; 
    }
    else if (!isNicknameChecked) { 
      console.log('❌ 닉네임 중복 확인 미완료');
      setNicknameError('닉네임 중복 확인을 완료해주세요.'); 
      isValid = false; 
      missingFields.push('닉네임 중복 확인');
    }
    else {
      console.log('✅ 닉네임 검증 통과');
      setNicknameError('');
    }

    // 생년월일 검증
    if (!dateOfBirth) { 
      console.log('❌ 생년월일 입력 누락');
      setDateOfBirthError('생년월일을 입력해주세요.'); 
      isValid = false; 
      missingFields.push('생년월일');
    }
    else {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 14) { 
        console.log('❌ 나이 제한 (14세 미만)');
        setDateOfBirthError('만 14세 이상만 가입할 수 있습니다.'); 
        isValid = false; 
      }
      else {
        console.log('✅ 생년월일 검증 통과');
        setDateOfBirthError('');
      }
    }

    // 활동 지역 선택 검증
    if (!selectedAutonomousDistrict || !selectedGeneralDistrict) {
      console.log('❌ 활동 지역 선택 누락');
      alert('활동 지역을 선택해주세요.');
      setShowAreaSelectionModal(true);
      return;
    }
    else {
      console.log('✅ 활동 지역 검증 통과');
    }

    console.log('=== 최종 검증 결과 ===');
    console.log('isValid:', isValid);
    console.log('missingFields:', missingFields);

    if (!isValid) {
      const errorMessage = missingFields.length > 0 
        ? `다음 항목을 확인해주세요: ${missingFields.join(', ')}`
        : '입력한 정보를 다시 확인해주세요.';
      console.log('에러 메시지:', errorMessage);
      alert(errorMessage);
      return;
    }

    try {
      // ✅ 백엔드 API 명세에 맞춘 payload
      const payload = {
        email,
        password,
        name,
        birthDate: dateOfBirth, // birth 대신 birthDate 사용
        nickname,
        activityRegion: {
          city: selectedAutonomousDistrict || '',
          district: selectedGeneralDistrict || '',
          fullAddress: `${selectedAutonomousDistrict || ''} ${selectedGeneralDistrict || ''}`.trim()
        }
      };

      console.log('=== API 명세에 맞춘 payload ===');
      console.log('email:', email, typeof email);
      console.log('password:', password, typeof password);
      console.log('name:', name, typeof name);
      console.log('birthDate:', dateOfBirth, typeof dateOfBirth);
      console.log('nickname:', nickname, typeof nickname);
      console.log('activityRegion:', payload.activityRegion);
      console.log('전체 payload:', JSON.stringify(payload, null, 2));
      
      await api.signup(payload as any);
      // 회원가입 성공
      alert('회원가입이 완료되었습니다.');

      // (선택) 자동 로그인까지 진행하고 싶으면 아래 사용:
      // const { token } = await api.login(email, password);
      // localStorage.setItem('access_token', token);
      // navigate('/', { replace: true });

      // 기본: 로그인 페이지로 이동
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error('=== 회원가입 에러 상세 ===');
      console.error('에러 객체:', error);
      console.error('에러 상태 코드:', error?.response?.status);
      console.error('에러 상태 텍스트:', error?.response?.statusText);
      console.error('서버 응답 헤더:', error?.response?.headers);
      console.error('서버 응답 데이터:', error?.response?.data);
      console.error('요청 URL:', error?.config?.url);
      console.error('요청 메서드:', error?.config?.method);
      console.error('요청 헤더:', error?.config?.headers);
      console.error('요청 데이터:', error?.config?.data);
      
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        error?.message ||
        '회원가입 중 오류가 발생했습니다.';
      
      console.log('표시할 에러 메시지:', serverMsg);
      alert(`서버 에러 (${error?.response?.status}): ${serverMsg}`);
    }
  };

  const handleCancel = () => navigate(-1);

  const handleAreaSelect = (district: string | null, generalDistrict: string | null) => {
    setSelectedAutonomousDistrict(district);
    setSelectedGeneralDistrict(generalDistrict);
    setShowAreaSelectionModal(false);
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    // 닉네임이 변경되면 중복 확인 상태 초기화
    if (isNicknameChecked) {
      setIsNicknameChecked(false);
    }
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
          <Button variant="contained" color="primary" onClick={handleEmailCheck} disabled={isEmailChecked} sx={{ whiteSpace: 'nowrap', px: 2 }}>
            {isEmailChecked ? '확인 완료' : '이메일 중복 확인'}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label="닉네임을 입력해주세요"
              variant="outlined"
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              error={!!nicknameError}
              helperText={nicknameError}
              sx={{ flexGrow: 1 }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleNicknameCheck}
              disabled={nicknameCheckLoading || isNicknameChecked || !nickname}
              sx={{ 
                whiteSpace: 'nowrap', 
                px: 2,
                minWidth: '100px'
              }}
            >
              {nicknameCheckLoading ? '확인중...' : isNicknameChecked ? '확인완료' : '중복확인'}
            </Button>
          </Box>

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


import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Stack, IconButton, TextField, Alert, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../lib/api';
import ProfileImageUpload from '../../components/ProfileImageUpload';

const PersonalInformationEdit: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setLoading(true);
        const userInfo = await api.users.getMe();
        setNickname(userInfo.nickname || userInfo.name || '');
        setEmail(userInfo.email || '');
        setProfileImage(userInfo.profileImage || null);
      } catch (err) {
        setError('사용자 정보를 불러오는데 실패했습니다.');
        console.error('Failed to load user info:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserInfo();
    }
  }, [user]);

  const handleProfileImageChange = (imageUrl: string | null) => {
    setProfileImage(imageUrl);
  };

  const handleSaveChanges = async () => {
    if (password && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updateData: any = {
        nickname: nickname.trim(),
        email: email.trim(),
      };

      if (password) {
        updateData.password = password;
      }

      await api.users.updateProfile(updateData);
      setSuccess('개인 정보가 성공적으로 저장되었습니다.');
      
      // 성공 후 잠시 대기 후 이전 페이지로 이동
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || '정보 저장에 실패했습니다.');
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

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
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ width: '100%' }}>
              {success}
            </Alert>
          )}

          <Box sx={{ mt: 4, mb: 3 }}>
            <ProfileImageUpload
              currentImage={profileImage}
              onImageChange={handleProfileImageChange}
              size={100}
              disabled={saving}
            />
          </Box>

          <TextField
            label="닉네임"
            variant="outlined"
            fullWidth
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={saving}
          />
          <TextField
            label="이메일"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            disabled={saving}
          />
          <TextField
            label="새 비밀번호 (선택 사항)"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={saving}
          />
          <TextField
            label="새 비밀번호 확인 (선택 사항)"
            variant="outlined"
            fullWidth
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={saving}
          />
          <Button 
            variant="contained" 
            fullWidth 
            className="py-3 text-lg" 
            onClick={handleSaveChanges}
            disabled={saving || !nickname.trim() || !email.trim()}
          >
            {saving ? <CircularProgress size={24} color="inherit" /> : '저장'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default PersonalInformationEdit;

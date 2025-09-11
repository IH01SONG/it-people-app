import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Alert,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Chip,
} from "@mui/material";
import {
  Save as SaveIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import ProfileImageSelector from "../components/ProfileImageSelector";
import profileImageManager, { type ProfileImageData } from "../utils/profileImageManager";
import { api } from "../utils/api";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // 프로필 데이터
  const [profileData, setProfileData] = useState({
    nickname: '',
    email: '',
    name: '',
    birthDate: '',
    profileImageUrl: '',
  });

  // 알림 설정
  const [notificationSettings, setNotificationSettings] = useState({
    joinRequests: true,
    newMessages: true,
    postUpdates: true,
    meetingReminders: true,
    systemNotifications: true,
  });

  // 스토리지 정보
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0, percentage: 0 });

  // 현재 프로필 이미지 로드
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // 서버에서 사용자 정보 가져오기
        const userResponse = await api.auth.getMe();
        if (userResponse.success && userResponse.user) {
          const user = userResponse.user;
          setProfileData({
            nickname: user.nickname || '',
            email: user.email || '',
            name: user.name || '',
            birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
            profileImageUrl: user.profileImageUrl || '',
          });
          
          // 알림 설정
          if (user.notificationSettings) {
            setNotificationSettings(user.notificationSettings);
          }
        }

        // 로컬 저장된 프로필 이미지 확인
        const currentImage = profileImageManager.getCurrentProfileImage();
        if (currentImage) {
          setProfileData(prev => ({
            ...prev,
            profileImageUrl: currentImage.url
          }));
        }

        // 스토리지 사용량 확인
        const usage = profileImageManager.getStorageUsage();
        setStorageInfo(usage);
        
      } catch (error) {
        console.error('프로필 로딩 실패:', error);
        setMessage({ type: 'error', text: '프로필 정보를 불러오는데 실패했습니다.' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileImageChange = (imageData: ProfileImageData) => {
    setProfileData(prev => ({
      ...prev,
      profileImageUrl: imageData.url
    }));
    
    // 스토리지 사용량 업데이트
    const usage = profileImageManager.getStorageUsage();
    setStorageInfo(usage);
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleNotificationChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // 서버에 프로필 업데이트
      const updateData = {
        nickname: profileData.nickname,
        profileImageUrl: profileData.profileImageUrl,
        notificationSettings
      };

      const response = await api.users.updateProfile(updateData);
      
      if (response.success) {
        setMessage({ type: 'success', text: '프로필이 성공적으로 저장되었습니다.' });
      } else {
        throw new Error('프로필 업데이트 실패');
      }
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      setMessage({ type: 'error', text: '프로필 저장에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setSaving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    } else if (kb >= 1) {
      return `${kb.toFixed(2)} KB`;
    } else {
      return `${bytes} bytes`;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen">
      <AppHeader />
      
      <div className="px-4 pb-24">
        {/* 페이지 제목 */}
        <Box sx={{ py: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={700} color="#333" mb={0.5}>
            프로필 설정
          </Typography>
          <Typography variant="body2" color="text.secondary">
            프로필 정보와 설정을 관리하세요
          </Typography>
        </Box>

        {message && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 2 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        {/* 프로필 정보 */}
        <Card sx={{ mb: 2, borderRadius: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <PersonIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                기본 정보
              </Typography>
            </Box>

            {/* 프로필 이미지 */}
            <Box textAlign="center" mb={3}>
              <ProfileImageSelector
                currentImage={profileData.profileImageUrl}
                onImageChange={handleProfileImageChange}
                size={120}
              />
              <Typography variant="body2" color="text.secondary" mt={1}>
                프로필 사진을 클릭하여 변경하세요
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="닉네임"
              value={profileData.nickname}
              onChange={handleInputChange('nickname')}
              margin="normal"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="이메일"
              value={profileData.email}
              disabled
              margin="normal"
              variant="outlined"
              helperText="이메일은 변경할 수 없습니다"
            />

            <TextField
              fullWidth
              label="이름"
              value={profileData.name}
              disabled
              margin="normal"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="생년월일"
              type="date"
              value={profileData.birthDate}
              disabled
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card sx={{ mb: 2, borderRadius: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <NotificationsIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                알림 설정
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.joinRequests}
                  onChange={handleNotificationChange('joinRequests')}
                  color="primary"
                />
              }
              label="참여 요청 알림"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.newMessages}
                  onChange={handleNotificationChange('newMessages')}
                  color="primary"
                />
              }
              label="새 메시지 알림"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.postUpdates}
                  onChange={handleNotificationChange('postUpdates')}
                  color="primary"
                />
              }
              label="게시글 업데이트 알림"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.meetingReminders}
                  onChange={handleNotificationChange('meetingReminders')}
                  color="primary"
                />
              }
              label="모임 리마인더 알림"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.systemNotifications}
                  onChange={handleNotificationChange('systemNotifications')}
                  color="primary"
                />
              }
              label="시스템 알림"
            />
          </CardContent>
        </Card>

        {/* 스토리지 정보 */}
        <Card sx={{ mb: 2, borderRadius: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <StorageIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                스토리지 사용량
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2">
                프로필 이미지 저장소
              </Typography>
              <Chip
                label={`${storageInfo.percentage}%`}
                color={storageInfo.percentage > 80 ? 'error' : 'default'}
                size="small"
              />
            </Box>

            <Box
              sx={{
                width: '100%',
                height: 8,
                bgcolor: 'grey.200',
                borderRadius: 4,
                mb: 1
              }}
            >
              <Box
                sx={{
                  width: `${storageInfo.percentage}%`,
                  height: '100%',
                  bgcolor: storageInfo.percentage > 80 ? 'error.main' : 'primary.main',
                  borderRadius: 4,
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>

            <Typography variant="caption" color="text.secondary">
              {formatFileSize(storageInfo.used)} / {formatFileSize(storageInfo.total)} 사용 중
            </Typography>

            {storageInfo.percentage > 80 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                스토리지 용량이 부족합니다. 프로필 이미지 설정에서 오래된 이미지를 삭제해주세요.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving || loading}
          sx={{
            bgcolor: '#E762A9',
            '&:hover': { bgcolor: '#D554A0' },
            py: 1.5,
            borderRadius: 3,
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          {saving ? '저장 중...' : '변경사항 저장'}
        </Button>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Box, Button, Typography, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../lib/api';
import AreaSelectionModal from '../../components/AreaSelectionModal';

const AccountManagement: React.FC = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [showAreaSelectionModal, setShowAreaSelectionModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSavingArea, setIsSavingArea] = useState(false);

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      if (isAuthenticated) {
        logout();
        navigate('/login');
      } else {
        navigate('/login');
      }
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      // API 호출로 계정 삭제
      await api.users.deleteAccount();
      
      // 성공 시 로그아웃 처리
      logout();
      navigate('/');
      alert('계정이 성공적으로 삭제되었습니다.');
    } catch (error: any) {
      setDeleteError(error.response?.data?.message || '계정 삭제 중 오류가 발생했습니다.');
      console.error('Account deletion error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAreaSelection = async (district: string | null, generalDistrict: string | null) => {
    try {
      setIsSavingArea(true);
      
      // API 호출로 지역 정보 저장
      if (district && generalDistrict) {
        await api.users.updateProfile({
          autonomousDistrict: district,
          generalDistrict: generalDistrict
        });
        
        // 성공 시 상태 업데이트
        // setSelectedAutonomousDistrict(district);
        // setSelectedGeneralDistrict(generalDistrict);
      }
      setShowAreaSelectionModal(false);
      
      alert('활동 지역이 성공적으로 설정되었습니다.');
    } catch (error: any) {
      console.error('Area selection error:', error);
      alert('지역 설정 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSavingArea(false);
    }
  };

  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', mr: 4 }}>
          계정 관리
        </Typography>
      </Box>
      <Box p={2}>
        <Stack spacing={3}>
          <Button
            variant="contained"
            fullWidth
            className="py-4 text-xl font-semibold"
            onClick={() => setShowAreaSelectionModal(true)}
            disabled={isSavingArea}
            sx={{
              backgroundColor: '#E762A9',
              color: 'white',
              borderRadius: 3,
              boxShadow: 2,
              '&:hover': {
                backgroundColor: '#d54d96',
                boxShadow: 4,
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0',
                color: '#9e9e9e',
              },
            }}
          >
            {isSavingArea ? '지역 저장 중...' : '활동 지역 설정'}
          </Button>
          <Button 
            variant="contained" 
            fullWidth 
            className="py-4 text-xl font-semibold" 
            onClick={() => navigate('/my/personal-info-edit')}
            sx={{
              backgroundColor: '#E762A9',
              color: 'white',
              borderRadius: 3,
              boxShadow: 2,
              '&:hover': {
                backgroundColor: '#d54d96',
                boxShadow: 4,
              },
            }}
          >
            개인 정보 수정
          </Button>
          <Button 
            variant="contained" 
            fullWidth 
            className="py-4 text-xl font-semibold" 
            onClick={() => navigate('/my/location-permission-settings')}
            sx={{
              backgroundColor: '#E762A9',
              color: 'white',
              borderRadius: 3,
              boxShadow: 2,
              '&:hover': {
                backgroundColor: '#d54d96',
                boxShadow: 4,
              },
            }}
          >
            위치 권한 설정
          </Button>
          <Button 
            variant="contained" 
            fullWidth 
            className="py-4 text-xl font-semibold" 
            onClick={() => navigate('/my/notification-settings')}
            sx={{
              backgroundColor: '#E762A9',
              color: 'white',
              borderRadius: 3,
              boxShadow: 2,
              '&:hover': {
                backgroundColor: '#d54d96',
                boxShadow: 4,
              },
            }}
          >
            알림 설정
          </Button>
          <Button 
            variant="contained" 
            fullWidth 
            className="py-4 text-xl font-semibold" 
            onClick={handleLogout}
            sx={{
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: 3,
              boxShadow: 2,
              '&:hover': {
                backgroundColor: '#b91c1c',
                boxShadow: 4,
              },
            }}
          >
            로그아웃
          </Button>
          <Button 
            variant="outlined" 
            fullWidth 
            className="py-4 text-xl font-semibold" 
            onClick={() => setShowDeleteDialog(true)}
            sx={{
              borderColor: '#dc2626',
              color: '#dc2626',
              borderRadius: 3,
              boxShadow: 1,
              '&:hover': {
                backgroundColor: '#fef2f2',
                borderColor: '#b91c1c',
                color: '#b91c1c',
                boxShadow: 2,
              },
            }}
          >
            계정 탈퇴
          </Button>
        </Stack>
      </Box>
      <AreaSelectionModal
        open={showAreaSelectionModal}
        onClose={() => !isSavingArea && setShowAreaSelectionModal(false)}
        onSelectArea={handleAreaSelection}
      />

      {/* 계정 탈퇴 확인 다이얼로그 */}
      <Dialog 
        open={showDeleteDialog} 
        onClose={() => !isDeleting && setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          계정 탈퇴 확인
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            계정을 탈퇴하면 다음 사항이 적용됩니다:
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            • 모든 개인정보가 즉시 삭제됩니다
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            • 참여한 모든 모임에서 자동으로 제외됩니다
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            • 작성한 게시글과 댓글이 모두 삭제됩니다
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            • 탈퇴 후 데이터 복구가 불가능합니다
          </Typography>
          <Typography variant="body2" color="error" fontWeight={600}>
            정말로 계정을 탈퇴하시겠습니까?
          </Typography>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDeleteDialog(false)} 
            disabled={isDeleting}
            color="inherit"
          >
            취소
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            disabled={isDeleting}
            color="error"
            variant="contained"
            startIcon={isDeleting ? <WarningIcon /> : <WarningIcon />}
          >
            {isDeleting ? '탈퇴 중...' : '계정 탈퇴'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountManagement;

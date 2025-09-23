import React, { useRef, useState } from 'react';
import { IconButton, Avatar, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, CircularProgress } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { api } from '../lib/api';

interface ProfileImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  size?: number;
  disabled?: boolean;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImage,
  onImageChange,
  size = 100,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddClick = () => {
    if (disabled) return;
    setShowOptions(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setShowOptions(false);

      console.log('📤 파일 업로드 시작:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // 먼저 로컬에서 미리보기 표시
      const localImageUrl = URL.createObjectURL(file);
      console.log('🖼️ 로컬 미리보기 URL 생성:', localImageUrl);
      onImageChange(localImageUrl);

      // 서버 업로드 시도 (실패해도 로컬 미리보기는 유지)
      try {
        console.log('🏥 서버 상태 확인 중...');
        const healthCheck = await api.healthCheck();
        console.log('🏥 서버 상태:', healthCheck);

        // FormData 생성
        const formData = new FormData();
        formData.append('profileImage', file);

        // API 호출
        const response = await api.users.uploadProfileImage(formData);
        console.log('📸 프로필 이미지 업로드 응답:', response);
        
        // 성공 시 서버에서 받은 이미지 URL로 교체
        const imageUrl = response.imageUrl || response.profileImage || response.url || response.data?.imageUrl;
        console.log('🖼️ 서버에서 받은 이미지 URL:', imageUrl);
        
        if (imageUrl) {
          // 로컬 URL 해제
          URL.revokeObjectURL(localImageUrl);
          
          // 서버 이미지 URL로 교체
          const imageUrlWithTimestamp = `${imageUrl}?t=${Date.now()}`;
          console.log('🔄 서버 이미지로 교체:', imageUrlWithTimestamp);
          onImageChange(imageUrlWithTimestamp);
        }
      } catch (uploadErr: any) {
        console.warn('⚠️ 서버 업로드 실패, 로컬 미리보기 유지:', uploadErr);
        // 서버 업로드가 실패해도 로컬 미리보기는 유지
        setError('서버 업로드에 실패했지만 이미지가 선택되었습니다. 나중에 다시 시도해주세요.');
      }
    } catch (err: any) {
      console.error('❌ 이미지 처리 실패:', err);
      setError(err.message || '이미지 처리에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = 'environment';
      fileInputRef.current.click();
    }
  };

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    setShowOptions(false);
  };

  return (
    <>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          alt="프로필 이미지"
          src={currentImage || undefined}
          sx={{ 
            width: size, 
            height: size,
            bgcolor: 'primary.main',
            '& img': {
              objectFit: 'cover'
            }
          }}
          imgProps={{
            onError: (e) => {
              console.warn('🖼️ 이미지 로드 실패:', currentImage);
              e.currentTarget.style.display = 'none';
            },
            onLoad: () => {
              console.log('✅ 이미지 로드 성공:', currentImage);
            }
          }}
        />
        <IconButton
          size="small"
          onClick={handleAddClick}
          disabled={disabled || uploading}
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&:disabled': {
              backgroundColor: 'grey.400',
            },
          }}
        >
          {uploading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <AddCircleIcon />
          )}
        </IconButton>
      </Box>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* 옵션 선택 다이얼로그 */}
      <Dialog open={showOptions} onClose={() => setShowOptions(false)} maxWidth="sm" fullWidth>
        <DialogTitle>프로필 사진 변경</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              onClick={handleCameraClick}
              fullWidth
              size="large"
            >
              카메라로 촬영
            </Button>
            <Button
              variant="outlined"
              startIcon={<FolderOpenIcon />}
              onClick={handleGalleryClick}
              fullWidth
              size="large"
            >
              갤러리에서 선택
            </Button>
            {currentImage && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleRemoveImage}
                fullWidth
                size="large"
              >
                프로필 사진 제거
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOptions(false)}>
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileImageUpload;

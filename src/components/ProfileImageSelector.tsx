import {
  Box,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  Typography,
  LinearProgress,
  Alert,
  Chip,
} from "@mui/material";
import {
  PhotoCamera,
  Upload,
  Link as LinkIcon,
  Delete as DeleteIcon,
  CloudUpload,
  Storage,
} from "@mui/icons-material";
import { useState, useRef } from "react";
import profileImageManager, { type ProfileImageData } from "../utils/profileImageManager";

interface ProfileImageSelectorProps {
  currentImage?: string;
  onImageChange: (imageData: ProfileImageData) => void;
  size?: number;
}

export default function ProfileImageSelector({
  currentImage,
  onImageChange,
  size = 100,
}: ProfileImageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [storedImages, setStoredImages] = useState<ProfileImageData[]>([]);
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0, percentage: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStoredImages = () => {
    const images = profileImageManager.getStoredProfileImages();
    const usage = profileImageManager.getStorageUsage();
    setStoredImages(images.reverse()); // 최신순으로 정렬
    setStorageUsage(usage);
  };

  const handleOpen = () => {
    setOpen(true);
    setError(null);
    loadStoredImages();
  };

  const handleClose = () => {
    setOpen(false);
    setImageUrl("");
    setError(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const useCloudinary = tabValue === 1; // 두 번째 탭이 클라우드 업로드
      const imageData = await profileImageManager.uploadProfileImage(file, useCloudinary);
      
      profileImageManager.setCurrentProfileImage(imageData.id);
      onImageChange(imageData);
      loadStoredImages();
      
      setError(null);
    } catch (error) {
      console.error('Image upload failed:', error);
      setError("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlUpload = async () => {
    if (!imageUrl.trim()) {
      setError("이미지 URL을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const imageData = await profileImageManager.setProfileImageFromUrl(imageUrl.trim());
      
      profileImageManager.setCurrentProfileImage(imageData.id);
      onImageChange(imageData);
      loadStoredImages();
      setImageUrl("");
      setError(null);
    } catch (error) {
      console.error('URL image upload failed:', error);
      setError("유효하지 않은 이미지 URL입니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleStoredImageSelect = (imageData: ProfileImageData) => {
    profileImageManager.setCurrentProfileImage(imageData.id);
    onImageChange(imageData);
    handleClose();
  };

  const handleDeleteImage = (imageId: string) => {
    profileImageManager.deleteProfileImage(imageId);
    loadStoredImages();
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
    <>
      <Box position="relative" display="inline-block">
        <Avatar 
          src={currentImage} 
          sx={{ 
            width: size, 
            height: size,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8
            }
          }}
          onClick={handleOpen}
        >
          {!currentImage && <PhotoCamera />}
        </Avatar>
        
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            bottom: -8,
            right: -8,
            bgcolor: '#E762A9',
            color: 'white',
            '&:hover': { bgcolor: '#D554A0' },
            width: 32,
            height: 32
          }}
          onClick={handleOpen}
        >
          <PhotoCamera fontSize="small" />
        </IconButton>
      </Box>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          프로필 사진 설정
        </DialogTitle>

        <DialogContent>
          {/* 스토리지 사용량 표시 */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                <Storage fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                스토리지 사용량
              </Typography>
              <Typography variant="caption">
                {formatFileSize(storageUsage.used)} / {formatFileSize(storageUsage.total)}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={storageUsage.percentage}
              sx={{ height: 6, borderRadius: 3 }}
            />
            {storageUsage.percentage > 80 && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                스토리지 용량이 부족합니다. 오래된 이미지를 삭제해주세요.
              </Alert>
            )}
          </Box>

          <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} sx={{ mb: 2 }}>
            <Tab label="로컬 업로드" icon={<Upload />} />
            <Tab label="클라우드 업로드" icon={<CloudUpload />} />
            <Tab label="URL로 추가" icon={<LinkIcon />} />
            <Tab label="저장된 이미지" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mt={1}>
                이미지 처리 중...
              </Typography>
            </Box>
          )}

          {/* 로컬 업로드 */}
          {tabValue === 0 && (
            <Box textAlign="center" py={4}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<Upload />}
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                sx={{
                  bgcolor: '#E762A9',
                  '&:hover': { bgcolor: '#D554A0' }
                }}
              >
                이미지 업로드
              </Button>
              <Typography variant="body2" color="text.secondary" mt={2}>
                • 최대 10MB까지 업로드 가능<br/>
                • 자동으로 800x800px로 리사이징됩니다<br/>
                • 로컬 저장소에 저장됩니다
              </Typography>
            </Box>
          )}

          {/* 클라우드 업로드 */}
          {tabValue === 1 && (
            <Box textAlign="center" py={4}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<CloudUpload />}
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                sx={{
                  bgcolor: '#2196F3',
                  '&:hover': { bgcolor: '#1976D2' }
                }}
              >
                클라우드에 업로드
              </Button>
              <Typography variant="body2" color="text.secondary" mt={2}>
                • 클라우드에 영구 저장됩니다<br/>
                • 디바이스 간 동기화 가능<br/>
                • 실패시 자동으로 로컬 저장됩니다
              </Typography>
            </Box>
          )}

          {/* URL 업로드 */}
          {tabValue === 2 && (
            <Box py={2}>
              <TextField
                fullWidth
                label="이미지 URL"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUrlUpload();
                  }
                }}
              />
              <Button
                variant="contained"
                fullWidth
                startIcon={<LinkIcon />}
                onClick={handleUrlUpload}
                disabled={loading || !imageUrl.trim()}
                sx={{
                  bgcolor: '#FF9800',
                  '&:hover': { bgcolor: '#F57C00' }
                }}
              >
                URL에서 이미지 가져오기
              </Button>
              <Typography variant="body2" color="text.secondary" mt={2}>
                • 외부 이미지 URL을 입력하세요<br/>
                • 썸네일이 자동으로 생성됩니다
              </Typography>
            </Box>
          )}

          {/* 저장된 이미지 */}
          {tabValue === 3 && (
            <Box py={2}>
              {storedImages.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    저장된 이미지가 없습니다
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {storedImages.map((imageData) => (
                    <Grid item xs={6} sm={4} md={3} key={imageData.id}>
                      <Card 
                        sx={{ 
                          position: 'relative',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 4
                          },
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleStoredImageSelect(imageData)}
                      >
                        <CardMedia
                          component="img"
                          height="120"
                          image={imageData.thumbnail}
                          alt="프로필 이미지"
                          sx={{ objectFit: 'cover' }}
                        />
                        <Box p={1}>
                          <Chip
                            label={imageData.source}
                            size="small"
                            color={
                              imageData.source === 'cloudinary' ? 'primary' :
                              imageData.source === 'external' ? 'secondary' : 'default'
                            }
                            sx={{ fontSize: '0.7rem' }}
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            {new Date(imageData.uploadedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(imageData.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            취소
          </Button>
          {storedImages.length > 0 && (
            <Button 
              color="error"
              onClick={() => {
                profileImageManager.clearAllImages();
                loadStoredImages();
              }}
            >
              전체 삭제
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
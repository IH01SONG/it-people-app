import { useState } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Avatar,
  Chip
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate } from "react-router-dom";

// 로고 이미지
import logoSvg from "../assets/logo.png";

export default function NewPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    location: "홍대입구",
    venue: "",
    maxParticipants: 4
  });

  const [image, setImage] = useState<string | null>(null);

  const categories = [
    { value: "식사", emoji: "🍕", label: "식사" },
    { value: "카페", emoji: "☕", label: "카페" },
    { value: "쇼핑", emoji: "🛍️", label: "쇼핑" },
    { value: "운동", emoji: "🏃‍♂️", label: "운동" },
    { value: "스터디", emoji: "📚", label: "스터디" },
    { value: "문화생활", emoji: "🎬", label: "문화생활" }
  ];

  const locations = ["홍대입구", "강남", "신촌", "이태원", "명동", "건대입구"];
  const participantOptions = [2, 3, 4, 5, 6, 8, 10];

  const handleSubmit = () => {
    if (formData.title.trim() && formData.content.trim() && formData.category) {
      // 새 게시글 데이터 생성
      const newPost = {
        id: `new-${Date.now()}`,
        title: formData.title,
        content: formData.content,
        author: "나",
        location: `${formData.location} 근처`,
        venue: formData.venue || `${formData.location} 모임장소`,
        category: formData.category,
        image: image,
        participants: 1,
        maxParticipants: formData.maxParticipants,
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24시간 후 만료
        isLiked: false,
        isActive: true,
      };
      
      // 홈으로 이동 (실제로는 게시글 목록에 추가하는 로직이 필요)
      navigate('/');
    }
  };

  const handleImageUpload = () => {
    // 실제 구현에서는 파일 선택 다이얼로그를 열어야 함
    const dummyImages = [
      "https://picsum.photos/seed/food1/400/300",
      "https://picsum.photos/seed/cafe1/400/300",
      "https://picsum.photos/seed/study1/400/300"
    ];
    setImage(dummyImages[Math.floor(Math.random() * dummyImages.length)]);
  };

  const isFormValid = formData.title.trim().length > 0 && 
                     formData.content.trim().length > 0 && 
                     formData.category;

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: '#E762A9', 
        color: 'white', 
        p: 2.5, 
        display: 'flex', 
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(231, 98, 169, 0.3)'
      }}>
        <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1, 
            textAlign: 'center', 
            mr: 4,
            fontWeight: 700
          }}
        >
          새 모임 만들기
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ px: 3, py: 3 }}>
        {/* 프로필 섹션 */}
        <Card sx={{ 
          borderRadius: 4, 
          p: 3, 
          mb: 3, 
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid rgba(231, 98, 169, 0.08)'
        }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar sx={{ 
              bgcolor: '#E762A9', 
              width: 48, 
              height: 48,
              fontWeight: 700
            }}>
              나
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#333">
                새로운 모임을 만들어보세요!
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationOnIcon sx={{ fontSize: 16, color: '#E762A9' }} />
                <Typography variant="body2" color="text.secondary">
                  {formData.location} 근처
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 제목 입력 */}
          <TextField
            fullWidth
            placeholder="모임 제목을 입력해주세요"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            variant="outlined"
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: '#f8f9fa',
                '&:hover': {
                  backgroundColor: '#f1f3f5',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 0 0 2px rgba(231, 98, 169, 0.2)',
                }
              }
            }}
            inputProps={{ 
              style: { 
                fontSize: '1rem',
                fontWeight: 500
              } 
            }}
          />

          {/* 내용 입력 */}
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="어떤 활동을 하고 싶은지 자세히 설명해주세요"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            variant="outlined"
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: '#f8f9fa',
                '&:hover': {
                  backgroundColor: '#f1f3f5',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 0 0 2px rgba(231, 98, 169, 0.2)',
                }
              }
            }}
          />

          {/* 이미지 업로드 */}
          <Box mb={3}>
            {image ? (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={image}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 3,
                    mb: 2
                  }}
                />
                <IconButton 
                  onClick={() => setImage(null)}
                  sx={{ 
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.8)'
                    }
                  }}
                >
                  ×
                </IconButton>
              </Box>
            ) : (
              <Button
                fullWidth
                variant="outlined"
                onClick={handleImageUpload}
                startIcon={<PhotoCameraIcon />}
                sx={{
                  borderRadius: 3,
                  py: 2,
                  borderColor: '#E762A9',
                  color: '#E762A9',
                  borderStyle: 'dashed',
                  '&:hover': {
                    borderColor: '#D554A0',
                    bgcolor: 'rgba(231, 98, 169, 0.04)'
                  }
                }}
              >
                사진 추가하기
              </Button>
            )}
          </Box>
        </Card>

        {/* 모임 설정 */}
        <Card sx={{ 
          borderRadius: 4, 
          p: 3, 
          mb: 3, 
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid rgba(231, 98, 169, 0.08)'
        }}>
          <Typography variant="h6" fontWeight={700} mb={3} color="#333">
            모임 설정
          </Typography>

          {/* 카테고리 선택 */}
          <Typography variant="subtitle2" fontWeight={600} mb={2} color="#666">
            카테고리
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
            {categories.map((cat) => (
              <Chip
                key={cat.value}
                label={`${cat.emoji} ${cat.label}`}
                onClick={() => setFormData({...formData, category: cat.value})}
                sx={{
                  cursor: "pointer",
                  bgcolor: formData.category === cat.value ? "#E762A9" : "white",
                  color: formData.category === cat.value ? "white" : "#666",
                  border: `1px solid ${formData.category === cat.value ? "#E762A9" : "#e0e0e0"}`,
                  borderRadius: 3,
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: formData.category === cat.value ? "#D554A0" : "#f8f9fa",
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </Box>

          {/* 지역 선택 */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>모임 지역</InputLabel>
            <Select
              value={formData.location}
              label="모임 지역"
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              sx={{
                borderRadius: 3,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E762A9',
                }
              }}
            >
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 참여 인원 */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>최대 참여 인원</InputLabel>
            <Select
              value={formData.maxParticipants}
              label="최대 참여 인원"
              onChange={(e) => setFormData({...formData, maxParticipants: e.target.value as number})}
              sx={{
                borderRadius: 3,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E762A9',
                }
              }}
            >
              {participantOptions.map((num) => (
                <MenuItem key={num} value={num}>
                  {num}명
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 장소명 (선택사항) */}
          <TextField
            fullWidth
            label="구체적인 장소명 (선택사항)"
            placeholder="예: 스타벅스 홍대점, 홍대 파파존스"
            value={formData.venue}
            onChange={(e) => setFormData({...formData, venue: e.target.value})}
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              }
            }}
          />
        </Card>

        {/* 작성 완료 버튼 */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={!isFormValid}
          startIcon={
            <img 
              src={logoSvg} 
              alt="잇플 로고" 
              style={{ 
                width: "16px", 
                height: "16px",
                filter: "brightness(0) invert(1)"
              }} 
            />
          }
          sx={{
            bgcolor: '#E762A9',
            '&:hover': {
              bgcolor: '#D554A0',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(231, 98, 169, 0.3)'
            },
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#9e9e9e',
              transform: 'none',
              boxShadow: 'none'
            },
            borderRadius: 4,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 700,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 16px rgba(231, 98, 169, 0.2)',
            mb: 2
          }}
        >
          잇플 모임 만들기! 🎉
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          모임을 만들면 다른 사용자들이 참여 신청을 할 수 있어요
        </Typography>
      </Container>
    </Box>
  );
}

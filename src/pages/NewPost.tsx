import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Avatar,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate } from "react-router-dom";

// 로고 이미지
import logoSvg from "../assets/logo.png";
import { api } from "../utils/api";

// Kakao Maps 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

const categories = [
  { value: "자기계발", label: "자기계발", emoji: "📚", color: "#4CAF50" },
  { value: "봉사활동", label: "봉사활동", emoji: "🤝", color: "#FF9800" },
  { value: "운동/스포츠", label: "운동/스포츠", emoji: "⚽", color: "#2196F3" },
  { value: "문화/예술", label: "문화/예술", emoji: "🎭", color: "#9C27B0" },
  { value: "사교/인맥", label: "사교/인맥", emoji: "👥", color: "#E91E63" },
  { value: "취미", label: "취미", emoji: "🎨", color: "#00BCD4" },
  { value: "외국어", label: "외국어", emoji: "🌍", color: "#795548" },
  { value: "맛집", label: "맛집", emoji: "🍽️", color: "#FF5722" },
  { value: "반려동물", label: "반려동물", emoji: "🐕", color: "#607D8B" },
];

export default function NewPost() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    location: "홍대입구",
    venue: "",
    maxParticipants: 4,
    meetingDate: "",
    tags: [] as string[]
  });
=======
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [userLocation, setUserLocation] = useState<string>("홍대입구 근처");
>>>>>>> feature/new-post

  // 사용자 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Kakao Maps API를 사용하여 좌표를 주소로 변환
          if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2Address(longitude, latitude, (result: any, status: any) => {
              if (status === window.kakao.maps.services.Status.OK && result[0]) {
                const address = result[0].road_address?.region_2depth_name || 
                               result[0].address?.region_2depth_name ||
                               result[0].road_address?.region_3depth_name ||
                               result[0].address?.region_3depth_name;
                if (address) {
                  setUserLocation(`${address} 근처`);
                }
              }
            });
          }
        },
        (error) => {
          console.log("위치 정보를 가져올 수 없습니다:", error);
          // 기본값 유지
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // 5분간 캐시
        }
      );
    }
  }, []);

<<<<<<< HEAD
  const categories = [
    { value: "식사", label: "식사" },
    { value: "카페", label: "카페" },
    { value: "쇼핑", label: "쇼핑" },
    { value: "운동", label: "운동" },
    { value: "스터디", label: "스터디" },
    { value: "문화생활", label: "문화생활" }
  ];

  const locations = ["홍대입구", "강남", "신촌", "이태원", "명동", "건대입구"];
  const participantOptions = [2, 3, 4, 5, 6, 8, 10];

  const handleSubmit = async () => {
    if (formData.title.trim() && formData.content.trim() && formData.category) {
      // 위치 정보 가져오기 (기본으로 홍대 좌표)
      const locationData = {
        type: 'Point' as const,
        coordinates: [126.9235, 37.5502], // 홍대입구역 좌표
        address: `${formData.location} 근처`
      };

      // 새 게시글 데이터 생성 (백엔드 모델과 일치)
      const newPost = {
        id: `new-${Date.now()}`,
        title: formData.title,
        content: formData.content,
        author: "나",
        authorId: "current-user-id",
        location: locationData,
        venue: formData.venue || `${formData.location} 모임장소`,
        category: formData.category,
        tags: formData.tags,
        image: image || undefined,
        participants: ["current-user-id"],
        maxParticipants: formData.maxParticipants,
        meetingDate: formData.meetingDate ? new Date(formData.meetingDate) : undefined,
        status: 'active' as const,
        chatRoom: `chat-new-${Date.now()}`,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isLiked: false,
      };
      
      try {
        // 백엔드에 게시글 생성 요청
        const response = await api.posts.create(newPost);
        if (response.success) {
          console.log('게시글 생성 성공:', response.data);
          // 성공 시 홈으로 이동
          navigate('/');
        }
      } catch (error) {
        console.error('게시글 생성 실패:', error);
        // TODO: 에러 알림 표시
        alert('게시글 생성에 실패했습니다. 다시 시도해주세요.');
      }
=======
  const handleNext = () => {
    if (selectedCategory) {
      // 카테고리를 state로 전달하여 두 번째 페이지로 이동
      navigate("/new/step2", { state: { category: selectedCategory } });
>>>>>>> feature/new-post
    }
  };

  const handleBack = () => {
    navigate("/");
  };

<<<<<<< HEAD
  const [newTag, setNewTag] = useState("");
  
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const isFormValid = formData.title.trim().length > 0 && 
                     formData.content.trim().length > 0 && 
                     formData.category;

=======
>>>>>>> feature/new-post
  return (
    <Box
      sx={{
        // bgcolor: "#f5f7fa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
        "@media (min-width: 600px)": {
          maxWidth: "600px",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#E762A9",
          color: "white",
          p: 2.5,
          display: "flex",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(231, 98, 169, 0.3)",
        }}
      >
        <IconButton onClick={handleBack} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            textAlign: "center",
            mr: 4,
            fontWeight: 700,
          }}
        >
          새 모임 만들기
        </Typography>
      </Box>

      <Container
        maxWidth="sm"
        sx={{
          px: 3,
          py: 3,
          maxWidth: "600px !important",
          "@media (min-width: 600px)": {
            maxWidth: "600px !important",
          },
        }}
      >
        {/* 프로필 섹션 */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar
            sx={{
              bgcolor: "#E762A9",
              width: 48,
              height: 48,
              fontWeight: 700,
            }}
          >
            나
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#333">
              어떤 모임을 만들고 싶으신가요?
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocationOnIcon sx={{ fontSize: 16, color: "#E762A9" }} />
              <Typography variant="body2" color="text.secondary">
                {userLocation}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary" mb={3}>
          모임의 성격에 맞는 카테고리를 선택해주세요
        </Typography>

        <Typography variant="h6" fontWeight={700} mb={3} color="#333">
          카테고리 선택
        </Typography>

<<<<<<< HEAD
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
                label={cat.label}
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
=======
        {/* 카테고리 선택 */}
        <Box display="flex" flexDirection="column" gap={2} mb={3}>
          {categories.map((category) => (
            <Box
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
>>>>>>> feature/new-post
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                bgcolor:
                  selectedCategory === category.value
                    ? category.color
                    : "white",
                color: selectedCategory === category.value ? "white" : "#666",
                border: `2px solid ${
                  selectedCategory === category.value
                    ? category.color
                    : "#e0e0e0"
                }`,
                borderRadius: 3,
                fontWeight: 600,
                fontSize: "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                "&:hover": {
                  bgcolor:
                    selectedCategory === category.value
                      ? category.color
                      : "#f8f9fa",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Typography variant="h5" sx={{ minWidth: "24px" }}>
                {category.emoji}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {category.label}
              </Typography>
            </Box>
          ))}
        </Box>

<<<<<<< HEAD
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
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              }
            }}
          />

          {/* 모임 날짜/시간 */}
          <TextField
            fullWidth
            label="모임 날짜/시간"
            type="datetime-local"
            value={formData.meetingDate}
            onChange={(e) => setFormData({...formData, meetingDate: e.target.value})}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              }
            }}
          />

          {/* 태그 입력 */}
          <Box mb={2}>
            <Typography variant="subtitle2" fontWeight={600} mb={2} color="#666">
              관련 태그
            </Typography>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                size="small"
                placeholder="태그 추가 (Enter로 입력)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                sx={{ 
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  }
                }}
              />
              <Button 
                variant="outlined" 
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                size="small"
                sx={{
                  borderColor: '#E762A9',
                  color: '#E762A9',
                  '&:hover': {
                    borderColor: '#D554A0',
                    bgcolor: 'rgba(231, 98, 169, 0.04)'
                  }
                }}
              >
                추가
              </Button>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={`#${tag}`}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  sx={{ 
                    bgcolor: '#E762A9', 
                    color: 'white',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        color: 'white'
                      }
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Card>

        {/* 작성 완료 버튼 */}
=======
        {/* 다음 버튼 */}
>>>>>>> feature/new-post
        <Button
          fullWidth
          variant="contained"
          onClick={handleNext}
          disabled={!selectedCategory}
          startIcon={
            <img
              src={logoSvg}
              alt="잇플 로고"
              style={{
                width: "16px",
                height: "16px",
                filter: "brightness(0) invert(1)",
              }}
            />
          }
          sx={{
            bgcolor: "#E762A9",
            "&:hover": {
              bgcolor: "#D554A0",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(231, 98, 169, 0.3)",
            },
            "&:disabled": {
              bgcolor: "#e0e0e0",
              color: "#9e9e9e",
              transform: "none",
              boxShadow: "none",
            },
            borderRadius: 4,
            py: 2,
            fontSize: "1.1rem",
            fontWeight: 700,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 16px rgba(231, 98, 169, 0.2)",
            mb: 2,
          }}
        >
<<<<<<< HEAD
          잇플 모임 만들기
=======
          다음 단계로
>>>>>>> feature/new-post
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          선택한 카테고리에 맞는 모임을 만들어보세요
        </Typography>
      </Container>
    </Box>
  );
}

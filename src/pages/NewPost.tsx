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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [userLocation, setUserLocation] = useState<string>("홍대입구 근처");

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

  const handleNext = () => {
    if (selectedCategory) {
      // 카테고리를 state로 전달하여 두 번째 페이지로 이동
      navigate("/new/step2", { state: { category: selectedCategory } });
    }
  };

  const handleBack = () => {
    navigate("/");
  };

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

        {/* 카테고리 선택 */}
        <Box display="flex" flexDirection="column" gap={2} mb={3}>
          {categories.map((category) => (
            <Box
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
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

        {/* 다음 버튼 */}
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
          다음 단계로
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          선택한 카테고리에 맞는 모임을 만들어보세요
        </Typography>
      </Container>
    </Box>
  );
}

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Container,
  Avatar,
  Chip,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate } from "react-router-dom";

// 로고 이미지
import logoSvg from "../assets/logo.png";

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
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh" }}>
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

      <Container maxWidth="sm" sx={{ px: 3, py: 3 }}>
        {/* 프로필 섹션 */}
        <Card
          sx={{
            borderRadius: 4,
            p: 3,
            mb: 3,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            border: "1px solid rgba(231, 98, 169, 0.08)",
          }}
        >
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
                  홍대입구 근처
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography variant="body1" color="text.secondary" mb={3}>
            모임의 성격에 맞는 카테고리를 선택해주세요
          </Typography>
        </Card>

        {/* 카테고리 선택 */}
        <Card
          sx={{
            borderRadius: 4,
            p: 3,
            mb: 3,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            border: "1px solid rgba(231, 98, 169, 0.08)",
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={3} color="#333">
            카테고리 선택
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={2}>
            {categories.map((category) => (
              <Chip
                key={category.value}
                label={`${category.emoji} ${category.label}`}
                onClick={() => setSelectedCategory(category.value)}
                sx={{
                  cursor: "pointer",
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
                  fontSize: "0.9rem",
                  py: 2,
                  px: 1,
                  height: "auto",
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
              />
            ))}
          </Box>
        </Card>

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

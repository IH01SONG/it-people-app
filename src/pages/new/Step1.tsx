import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Container,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../../constants/categories";
import type { Category } from "../../utils/category";

export default function Step1() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );


  const getCategoryDescription = (categoryName: string): string => {
    const descMap: Record<string, string> = {
      자기계발: "함께 성장하고 발전해요",
      봉사활동: "나눔과 베풂을 실천해요",
      "운동/스포츠": "건강하게 운동해요",
      "문화/예술": "문화생활을 함께해요",
      "사교/인맥": "새로운 인맥을 만들어요",
      취미: "재미있는 취미를 공유해요",
      외국어: "언어를 배우고 교류해요",
      맛집: "맛있는 식사를 함께해요",
      반려동물: "반려동물과 함께해요",
    };
    return descMap[categoryName] || "새로운 만남을 시작해요";
  };

  // 이름 기반 미리보기 이미지(서버 필드가 생기면 그걸 사용하세요)
  const previewByName: Record<string, string> = {
    자기계발:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&crop=center",
    봉사활동:
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop&crop=center",
    "운동/스포츠":
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
    "문화/예술":
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop&crop=center",
    "사교/인맥":
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop&crop=center",
    취미: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400&h=300&fit=crop&crop=center",
    외국어:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center",
    맛집: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center",
    반려동물:
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop&crop=center",
  };
  const getCategoryPreviewImage = (categoryName: string): string =>
    previewByName[categoryName] ?? previewByName["반려동물"];

  const handleSubmit = () => {
    // 선택된 카테고리가 없으면 첫 번째 카테고리 사용 (UX 개선)
    const cat = selectedCategory ?? CATEGORIES[0] ?? null;
    if (cat?._id) {
      navigate("/new/step2", {
        state: {
          categoryId: cat._id, // ✅ 서버에 보낼 값
          categoryName: cat.name, // UI/표시용
        },
      });
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
        "@media (min-width:600px)": {
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
        <IconButton onClick={() => navigate("/")} sx={{ color: "white" }}>
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
          카테고리 선택
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ px: 3, py: 3, flex: 1 }}>
        {/* 프로그레스 */}
        <Box mb={4}>
          <Stepper activeStep={0} sx={{ mb: 2 }}>
            <Step>
              <StepLabel>카테고리 선택</StepLabel>
            </Step>
            <Step>
              <StepLabel>상세 정보</StepLabel>
            </Step>
            <Step>
              <StepLabel>완료</StepLabel>
            </Step>
          </Stepper>
        </Box>

        {/* 안내 메시지 */}
        <Typography
          variant="h5"
          fontWeight={700}
          color="#333"
          mb={2}
          textAlign="center"
        >
          어떤 활동을 함께하고 싶나요?
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          mb={3}
          textAlign="center"
        >
          관심있는 카테고리를 선택해주세요
        </Typography>

        {/* 카테고리 목록 */}
        <Box mb={4}>
          {CATEGORIES.map((category: Category) => {
            const isSelected = selectedCategory?._id === category._id;
            return (
              <Card
                key={category._id}
                onClick={() => setSelectedCategory(category)}
                sx={{
                  p: 3,
                  mb: 2,
                  cursor: "pointer",
                  borderRadius: 3,
                  border: isSelected
                    ? "2px solid #E762A9"
                    : "1px solid #e0e0e0",
                  bgcolor: isSelected ? "rgba(231, 98, 169, 0.05)" : "white",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    borderColor: "#E762A9",
                  },
                  boxShadow: isSelected
                    ? "0 4px 12px rgba(231, 98, 169, 0.2)"
                    : "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: isSelected ? "#E762A9" : "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      filter: isSelected ? "brightness(0) invert(1)" : "none",
                    }}
                  >
                    {category.icon}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={isSelected ? "#E762A9" : "#333"}
                    mb={0.5}
                  >
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getCategoryDescription(category.name)}
                  </Typography>
                </Box>
                {isSelected && (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: "#E762A9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="body2" color="white" fontSize="16px">
                      ✓
                    </Typography>
                  </Box>
                )}
              </Card>
            );
          })}
        </Box>

        {/* 선택된 카테고리 미리보기 */}
        {selectedCategory && (
          <Card
            sx={{
              mb: 4,
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(231, 98, 169, 0.1)",
              border: "2px solid #E762A9",
            }}
          >
            <Box
              sx={{
                position: "relative",
                height: 200,
                backgroundImage: `url(${getCategoryPreviewImage(
                  selectedCategory.name
                )})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              {/* 오버레이 그라데이션 */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1))",
                }}
              />
              {/* 카테고리 정보 */}
              <Box sx={{ position: "relative", p: 3, width: "100%" }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="h4">
                    {selectedCategory.icon}
                  </Typography>
                  <Typography variant="h5" color="white" fontWeight={700}>
                    {selectedCategory.name}
                  </Typography>
                </Box>
                <Typography variant="body1" color="rgba(255,255,255,0.9)">
                  {getCategoryDescription(selectedCategory.name)}
                </Typography>
              </Box>
            </Box>
          </Card>
        )}
      </Container>

      {/* 하단 버튼 */}
      <Box
        sx={{ p: 2, bgcolor: "white", borderTop: 1, borderColor: "divider" }}
      >
        <Container maxWidth="sm">
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedCategory && CATEGORIES.length === 0}
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
            }}
          >
            다음 단계로
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

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

export default function Step1() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const categories = ["자기개발", "봉사활동", "운동/스포츠", "문화/예술", "사교/인맥", "취미", "외국어", "맛집", "반려동물"];

  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      자기개발: "📚",
      봉사활동: "🤝",
      "운동/스포츠": "🏃‍♂️",
      "문화/예술": "🎨",
      "사교/인맥": "👥",
      취미: "🎯",
      외국어: "🌍",
      맛집: "🍽️",
      반려동물: "🐕",
    };
    return emojiMap[category] || "📍";
  };

  const getCategoryDescription = (category: string): string => {
    const descMap: Record<string, string> = {
      자기개발: "함께 성장하고 발전해요",
      봉사활동: "나눔과 베풂을 실천해요",
      "운동/스포츠": "건강하게 운동해요",
      "문화/예술": "문화생활을 함께해요",
      "사교/인맥": "새로운 인맥을 만들어요",
      취미: "재미있는 취미를 공유해요",
      외국어: "언어를 배우고 교류해요",
      맛집: "맛있는 식사를 함께해요",
      반려동물: "반려동물과 함께해요",
    };
    return descMap[category] || "새로운 만남을 시작해요";
  };

  const handleSubmit = () => {
    if (selectedCategory) {
      navigate("/new/step2", { state: { category: selectedCategory } });
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
          {categories.map((category: string) => (
            <Card
              key={category}
              onClick={() => setSelectedCategory(category)}
              sx={{
                p: 3,
                mb: 2,
                cursor: "pointer",
                borderRadius: 3,
                border:
                  selectedCategory === category
                    ? "2px solid #E762A9"
                    : "1px solid #e0e0e0",
                bgcolor:
                  selectedCategory === category
                    ? "rgba(231, 98, 169, 0.05)"
                    : "white",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: 2,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  borderColor: "#E762A9",
                },
                boxShadow:
                  selectedCategory === category
                    ? "0 4px 12px rgba(231, 98, 169, 0.2)"
                    : "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor:
                    selectedCategory === category ? "#E762A9" : "#f8f9fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    filter:
                      selectedCategory === category
                        ? "brightness(0) invert(1)"
                        : "none",
                  }}
                >
                  {getCategoryEmoji(category)}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color={selectedCategory === category ? "#E762A9" : "#333"}
                  mb={0.5}
                >
                  {category}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getCategoryDescription(category)}
                </Typography>
              </Box>
              {selectedCategory === category && (
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
          ))}
        </Box>
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
            disabled={!selectedCategory}
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
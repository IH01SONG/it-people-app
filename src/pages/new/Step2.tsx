import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Chip,
  Container,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../lib/api";
import MapPicker from "../../components/MapPicker";
import { getDefaultImageByCategory } from "../../utils/defaultImages";

interface FormData {
  title: string;
  content: string;
  venue: string;
  location: string;
  category: string;
  maxParticipants: number;
  meetingDate: string;
  tags: string[];
  image?: string;
}

export default function Step2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 컴포넌트 마운트 시 스크롤을 맨 위로 이동
  useEffect(() => {
    const scrollToTop = () => {
      // 여러 방법으로 스크롤 조정
      window.scrollTo(0, 0);
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // 컨테이너가 있으면 컨테이너도 스크롤 조정
      if (containerRef.current) {
        containerRef.current.scrollIntoView({
          behavior: "auto",
          block: "start",
          inline: "start",
        });
      }
    };

    // 즉시 실행
    scrollToTop();

    // 렌더링 후 여러 번 실행
    const timers = [
      setTimeout(scrollToTop, 0),
      setTimeout(scrollToTop, 50),
      setTimeout(scrollToTop, 100),
      setTimeout(scrollToTop, 200),
    ];

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    venue: "",
    location: "",
    category: "",
    maxParticipants: 4,
    meetingDate: "",
    tags: [],
    image: undefined,
  });

  // 이미지 상태 제거 - 카테고리별 기본 이미지만 사용
  const [newTag, setNewTag] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationInput, setLocationInput] = useState("위치 로딩 중...");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMapUpdating, setIsMapUpdating] = useState(false);

  // 향후 위치 선택 기능 확장 시 사용
  const participantQuickOptions = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30];

  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
      setFormData((prev) => ({
        ...prev,
        category: location.state.category,
      }));

      // 카테고리 설정 후에도 스크롤을 맨 위로 이동
      const scrollToTop = () => {
        window.scrollTo(0, 0);
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        if (containerRef.current) {
          containerRef.current.scrollIntoView({
            behavior: "auto",
            block: "start",
            inline: "start",
          });
        }
      };

      setTimeout(scrollToTop, 50);
      setTimeout(scrollToTop, 100);
    }
  }, [location.state]);

  // MapPicker에서 위치가 변경될 때 호출되는 함수
  const handleLocationChange = useCallback(
    (location: string, coordinates: { lat: number; lng: number }) => {
      setIsMapUpdating(true);
      setLocationInput(location);
      setFormData((prev) => ({ ...prev, location }));
      setCoords(coordinates);
      // 지도에서 업데이트된 것이므로 검색 키워드는 업데이트하지 않음
      setTimeout(() => setIsMapUpdating(false), 100);
    },
    []
  );

  // 위치 입력 필드가 변경될 때 검색 키워드 업데이트 (디바운싱 적용)
  useEffect(() => {
    // 지도에서 업데이트 중이면 검색하지 않음
    if (isMapUpdating) return;

    if (
      !locationInput.trim() ||
      locationInput === "현재 위치" ||
      locationInput.includes("위도:") ||
      locationInput.includes("경도:") ||
      locationInput === "위치 로딩 중..."
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setSearchKeyword(locationInput);
    }, 1000);

    return () => clearTimeout(timer);
  }, [locationInput, isMapUpdating]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!formData.content.trim()) {
      alert("모임 설명을 입력해주세요.");
      return;
    }

    try {
      // 카테고리에 맞는 기본 이미지 자동 추가
      let finalImageUrls: string[] = [];
      if (formData.category) {
        const defaultImage = getDefaultImageByCategory(formData.category);
        finalImageUrls = [defaultImage];
      }

      // 위치 정보 설정 (선택사항)
      const displayLocation = locationInput || formData.location;
      const locationData = coords
        ? {
            type: "Point" as const,
            coordinates: [coords.lng, coords.lat], // [경도, 위도] 순서
            address: displayLocation || "위치 정보", // 백엔드에서 address 필드 지원
          }
        : null;

      // 백엔드 API 스키마에 맞춘 게시글 데이터
      const postPayload = {
        title: formData.title,
        tags: formData.tags,
        maxParticipants: formData.maxParticipants,
        content: formData.content.trim(),
        ...(locationData && { location: locationData }),
        ...(formData.category && { category: formData.category }),
        ...(formData.venue && { venue: formData.venue }),
        ...(formData.meetingDate && {
          meetingDate: new Date(formData.meetingDate).toISOString()
        }),
        // 이미지 필드 - 백엔드 호환성을 위해 둘 다 전송
        ...(finalImageUrls.length > 0 && {
          imageUrls: finalImageUrls,
          images: finalImageUrls // 백엔드 호환성을 위해 추가
        }),
      };

      // 백엔드 API 호출 전 디버깅
      console.log('🚀 전송할 데이터:', JSON.stringify(postPayload, null, 2));

      await api.posts.create(postPayload);

      alert("게시글이 성공적으로 작성되었습니다!");
      navigate("/", { state: { refreshPosts: true } });
    } catch (error: any) {
      console.error("게시글 생성 실패:", error);
      console.error("🚨 오류 상세:", error?.response?.data);
      console.error("🚨 오류 상태:", error?.response?.status);

      let errorMessage = "게시글 생성에 실패했습니다.";
      if (error?.response?.status === 400) {
        const serverError = error?.response?.data?.message || error?.response?.data?.error;
        errorMessage = serverError ? `입력 오류: ${serverError}` : "입력 정보를 확인해주세요.";
        console.error("🔍 400 오류 상세:", serverError);
      } else if (error?.response?.status === 401) {
        errorMessage = "로그인이 필요합니다.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(errorMessage + " 다시 시도해주세요.");
    }
  };

  // 이미지 업로드 함수 제거

  // 이미지 업로드 기능 제거 - 카테고리별 기본 이미지만 사용

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };


  const isFormValid = formData.title.trim().length > 0;

  // Step1에서 전달받지 못한 경우 기본값 설정
  useEffect(() => {
    if (!selectedCategory && !location.state?.category) {
      setSelectedCategory("기타");
      setFormData((prev) => ({
        ...prev,
        category: "기타",
      }));
    }
  }, [selectedCategory, location.state]);

  return (
    <Box
      sx={{
        bgcolor: "#f5f7fa",
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
        <IconButton onClick={() => navigate(-1)} sx={{ color: "white" }}>
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
          모임 상세 정보
        </Typography>
      </Box>

      <Container
        ref={containerRef}
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
        {/* 항상 모바일 폭처럼 보이도록 */}

        {/* 프로그레스 */}
        <Box mb={4}>
          <Stepper activeStep={1} sx={{ mb: 2 }}>
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

        {/* 선택된 카테고리 표시 */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            p: 2,
            mb: 3,
            background: "linear-gradient(135deg, #E762A9 0%, #D554A0 100%)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="body2" color="white" fontWeight={600} mb={1}>
            선택한 카테고리
          </Typography>
          <Typography variant="h6" color="white" fontWeight={700}>
            {selectedCategory}
          </Typography>
        </Card>

        {/* 제목 입력 */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="제목을 입력해 주세요(5-20글자)"
            value={formData.title}
            onChange={(e) => {
              const title = e.target.value;
              if (title.length <= 20) {
                setFormData({ ...formData, title });
              }
            }}
            variant="outlined"
            helperText={`${formData.title.length}/20자`}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: "1.1rem",
                "&:hover": {
                  borderColor: "#E762A9",
                },
                "&.Mui-focused": {
                  borderColor: "#E762A9",
                  boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                },
              },
            }}
          />
        </Box>


        {/* 소개글 입력 */}
        <Box mb={3}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="모임에 대해 자세히 설명해주세요 (필수)"
            value={formData.content}
            onChange={(e) => {
              const content = e.target.value;
              if (content.length <= 100) {
                setFormData({ ...formData, content });
              }
            }}
            helperText={`${formData.content.length}/100자`}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#E762A9",
                },
                "&.Mui-focused": {
                  borderColor: "#E762A9",
                  boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                },
              },
            }}
          />
        </Box>

        {/* 만날 위치 및 시간 */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={2} color="#333">
            만날 위치 및 시간
          </Typography>

          {/* 위치 입력 필드 */}
          <Box mb={2}>
            <TextField
              fullWidth
              placeholder="위치를 입력해주세요"
              value={locationInput}
              onChange={(e) => {
                const newLocation = e.target.value;
                setLocationInput(newLocation);
                setFormData({
                  ...formData,
                  location: newLocation,
                });
              }}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "#E762A9",
                  },
                  "&.Mui-focused": {
                    borderColor: "#E762A9",
                    boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                  },
                },
              }}
            />
          </Box>

          {/* 지도 영역 */}
          <Box mb={3}>
            <MapPicker
              onLocationChange={handleLocationChange}
              searchKeyword={searchKeyword}
            />
          </Box>

          {/* 날짜/시간 설정 */}
          <Box display="flex" gap={2} mb={2}>
            <TextField
              fullWidth
              type="date"
              value={
                formData.meetingDate ? formData.meetingDate.split("T")[0] : ""
              }
              onChange={(e) => {
                const date = e.target.value;
                const time = formData.meetingDate
                  ? formData.meetingDate.split("T")[1]
                  : "18:00";
                setFormData({
                  ...formData,
                  meetingDate: date ? `${date}T${time}` : "",
                });
              }}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              fullWidth
              type="time"
              value={
                formData.meetingDate
                  ? formData.meetingDate.split("T")[1]
                  : "18:00"
              }
              onChange={(e) => {
                const date = formData.meetingDate
                  ? formData.meetingDate.split("T")[0]
                  : new Date().toISOString().split("T")[0];
                setFormData({
                  ...formData,
                  meetingDate: `${date}T${e.target.value}`,
                });
              }}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* 최대 모집 인원 - 직관적 컨트롤 */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              최대 모집 인원
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton
                aria-label="decrease"
                onClick={() =>
                  setFormData({
                    ...formData,
                    maxParticipants: Math.max(2, formData.maxParticipants - 1),
                  })
                }
                size="small"
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                value={formData.maxParticipants}
                onChange={(e) => {
                  const v = Number(e.target.value.replace(/[^0-9]/g, "")) || 2;
                  setFormData({
                    ...formData,
                    maxParticipants: Math.min(30, Math.max(2, v)),
                  });
                }}
                slotProps={{
                  input: {
                    inputMode: "numeric",
                    style: { textAlign: "center", width: 64 },
                  },
                }}
                size="small"
              />
              <IconButton
                aria-label="increase"
                onClick={() =>
                  setFormData({
                    ...formData,
                    maxParticipants: Math.min(30, formData.maxParticipants + 1),
                  })
                }
                size="small"
              >
                <AddIcon />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                명
              </Typography>
            </Box>

            {/* 빠른 선택 옵션 */}
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {participantQuickOptions.map((num) => (
                <Chip
                  key={num}
                  label={`${num}`}
                  size="small"
                  onClick={() =>
                    setFormData({ ...formData, maxParticipants: num })
                  }
                  sx={{
                    cursor: "pointer",
                    bgcolor:
                      formData.maxParticipants === num ? "#E762A9" : "white",
                    color: formData.maxParticipants === num ? "white" : "#666",
                    border: `1px solid ${
                      formData.maxParticipants === num ? "#E762A9" : "#e0e0e0"
                    }`,
                    "&:hover": {
                      bgcolor:
                        formData.maxParticipants === num
                          ? "#D554A0"
                          : "#f5f5f5",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* 해시태그 입력 */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={2} color="#333">
            해시태그 입력
          </Typography>

          {/* 해시태그 입력 필드 */}
          <TextField
            fullWidth
            placeholder="#태그입력"
            value={newTag}
            onChange={(e) => {
              // # 기호 자동 제거
              const value = e.target.value.replace(/^#+/, "");
              setNewTag(value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (newTag.trim()) {
                  handleAddTag();
                }
              }
            }}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#E762A9",
                },
                "&.Mui-focused": {
                  borderColor: "#E762A9",
                  boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                },
              },
            }}
          />

          {/* 입력된 해시태그 표시 */}
          {formData.tags.length > 0 && (
            <Box mt={2}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={`#${tag}`}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                    sx={{
                      bgcolor: "#E762A9",
                      color: "white",
                      fontWeight: 600,
                      "& .MuiChip-deleteIcon": {
                        color: "rgba(255,255,255,0.8)",
                        "&:hover": {
                          color: "white",
                        },
                      },
                      "&:hover": {
                        bgcolor: "#D554A0",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* 완료 버튼 */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={!isFormValid}
          sx={{
            bgcolor: "#E762A9",
            "&:hover": {
              bgcolor: "#D554A0",
            },
            "&:disabled": {
              bgcolor: "#e0e0e0",
              color: "#9e9e9e",
            },
            borderRadius: 2,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 700,
            mb: 2,
          }}
        >
          완료
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          모임을 만들면 다른 사용자들이 참여 신청을 할 수 있어요
        </Typography>
      </Container>
    </Box>
  );
}

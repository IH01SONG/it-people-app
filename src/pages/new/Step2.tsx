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
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../lib/api";
import MapPicker from "../../components/MapPicker";

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
  validHours: number; // 게시글 유효시간 (시간 단위, 최대 24시간)
}

export default function Step2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 컴포넌트 마운트 시 스크롤을 맨 위로 이동
  useEffect(() => {
    const scrollToTop = () => {
      // 여러 방법으로 스크롤 조정
      window.scrollTo(0, 0);
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // 컨테이너가 있으면 컨테이너도 스크롤 조정
      if (containerRef.current) {
        containerRef.current.scrollIntoView({
          behavior: 'auto',
          block: 'start',
          inline: 'start'
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
      timers.forEach(timer => clearTimeout(timer));
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
    validHours: 24, // 기본값 24시간
  });

  const [images, setImages] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationInput, setLocationInput] = useState("위치 로딩 중...");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMapUpdating, setIsMapUpdating] = useState(false);

  // 향후 위치 선택 기능 확장 시 사용
  const participantQuickOptions = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30];

  // 카테고리별 기본 이미지 매핑
  const getDefaultImageByCategory = (categoryId: string): string => {
    const defaultImages: { [key: string]: string } = {
      '68c3bdd957c06e06e2706f9a': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center', // 운동
      '68c3bdd957c06e06e2706f9b': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center', // 스터디
      '68c3bdd957c06e06e2706f9c': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop&crop=center', // 맛집
      '68c3bdd957c06e06e2706f9d': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center', // 문화
      '68c3bdd957c06e06e2706f9e': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop&crop=center', // 친목
      '68c3bdd957c06e06e2706f9f': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop&crop=center', // 게임
      '68c3bdd957c06e06e2706fa0': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop&crop=center', // 여행
      '68c3bdd957c06e06e2706fa1': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop&crop=center', // 기타
    };

    return defaultImages[categoryId] || defaultImages['68c3bdd957c06e06e2706fa1']; // 기본값은 '기타' 카테고리 이미지
  };

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
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        if (containerRef.current) {
          containerRef.current.scrollIntoView({
            behavior: 'auto',
            block: 'start',
            inline: 'start'
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

    // 설명글은 선택사항으로 변경 (0자도 허용)

    try {
      // 이미지가 없으면 카테고리에 맞는 기본 이미지를 자동으로 추가
      let finalImages = images;
      if (finalImages.length === 0 && formData.category) {
        const defaultImage = getDefaultImageByCategory(formData.category);
        finalImages = [defaultImage];
        console.log(`📷 카테고리 '${formData.category}'에 맞는 기본 이미지 추가:`, defaultImage);
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
        validHours: formData.validHours, // 게시글 유효시간 추가
        // 선택적 필드들
        ...(formData.content.trim() && { content: formData.content.trim() }), // 내용이 있을 때만 추가
        ...(locationData && { location: locationData }),
        ...(formData.category && { category: formData.category }),
        ...(formData.venue && { venue: formData.venue }),
        ...(formData.meetingDate && { meetingDate: formData.meetingDate }),
        ...(finalImages.length > 0 && { images: finalImages }),
      };

      // 백엔드 API 호출
      await api.posts.create(postPayload);

      alert("게시글이 성공적으로 작성되었습니다!");
      navigate("/", { state: { refreshPosts: true } });
    } catch (error: unknown) {
      console.error("게시글 생성 실패:", error);

      let errorMessage = "게시글 생성에 실패했습니다.";
      if (error && typeof error === "object") {
        if ("status" in error && (error as { status: number }).status === 401) {
          errorMessage = "로그인이 필요합니다.";
        } else if (
          "status" in error &&
          (error as { status: number }).status === 400
        ) {
          errorMessage = "입력 정보를 확인해주세요.";
        }
        if ("message" in error) {
          errorMessage = (error as { message: string }).message;
        }
      }

      alert(errorMessage + " 다시 시도해주세요.");
    }
  };

  const handleImageUpload = () => {
    if (images.length >= 3) return;
    fileInputRef.current?.click();
  };

  const handleFilesChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 3 - images.length;
    const selected = files.slice(0, remainingSlots);

    const newUrls: string[] = selected.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newUrls]);

    // 입력 값 초기화 (같은 파일 다시 선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

  // 표시할 위치 텍스트 계산 함수
  const getDisplayLocation = () => {
    if (locationInput && locationInput.trim()) {
      return locationInput;
    }
    if (formData.location && formData.location.trim()) {
      return formData.location;
    }
    if (coords) {
      return "선택된 위치";
    }
    return "위치를 선택해주세요";
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

        {/* 이미지 업로드 */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={1} color="#333">
            사진 첨부
          </Typography>
          <Box display="flex" gap={2}>
            {images.map((img, idx) => (
              <Box key={idx} sx={{ position: "relative" }}>
                <Box
                  component="img"
                  src={img}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                  }}
                />
                <IconButton
                  onClick={() =>
                    setImages((prev) => prev.filter((_, i) => i !== idx))
                  }
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    bgcolor: "white",
                    color: "#666",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    "&:hover": { bgcolor: "#f5f5f5" },
                  }}
                >
                  ×
                </IconButton>
              </Box>
            ))}
            {images.length < 3 && (
              <Box
                onClick={handleImageUpload}
                sx={{
                  width: 80,
                  height: 80,
                  border: "2px dashed #E762A9",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  bgcolor: "rgba(231, 98, 169, 0.02)",
                  "&:hover": {
                    bgcolor: "rgba(231, 98, 169, 0.05)",
                    borderColor: "#D554A0",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <PhotoCameraIcon
                  sx={{ fontSize: 24, color: "#E762A9", mb: 0.5 }}
                />
                <Typography
                  variant="caption"
                  color="#E762A9"
                  textAlign="center"
                >
                  {images.length}/3
                  <br />
                  (선택)
                </Typography>
              </Box>
            )}
            {/* 모바일/데스크탑 파일 선택 인풋 (숨김) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleFilesChange}
              style={{ display: "none" }}
            />
          </Box>

          {/* 카테고리별 기본 이미지 미리보기 */}
          {images.length === 0 && formData.category && (
            <Box mt={2} p={2} bgcolor="rgba(231, 98, 169, 0.05)" borderRadius={2}>
              <Typography variant="caption" color="text.secondary" mb={1} display="block">
                이미지를 업로드하지 않으면 카테고리에 맞는 기본 이미지가 자동으로 추가됩니다:
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <img
                  src={getDefaultImageByCategory(formData.category)}
                  alt="기본 이미지 미리보기"
                  style={{
                    width: 60,
                    height: 40,
                    objectFit: 'cover',
                    borderRadius: 4,
                    border: '1px solid #e0e0e0'
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  카테고리 기본 이미지
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* 소개글 입력 */}
        <Box mb={3}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="소개글을 입력해 주세요 (0-100글자, 선택사항)"
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
        {/* 만날 위치 및 시간 */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={2} color="#333">
            만날 위치 및 시간
          </Typography>

          {/* 날짜/시간 표시 */}
          <Box
            sx={{
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              mb: 2,
              bgcolor: "#f8f9fa",
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <LocationOnIcon sx={{ fontSize: 16, color: "#E762A9" }} />
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  color:
                    getDisplayLocation() === "위치를 선택해주세요"
                      ? "#999"
                      : "#333",
                }}
              >
                {getDisplayLocation()}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              ●{" "}
              <span
                style={{
                  color: formData.meetingDate ? "inherit" : "#999",
                  fontStyle: formData.meetingDate ? "normal" : "italic",
                }}
              >
                {formData.meetingDate
                  ? new Date(formData.meetingDate).toLocaleDateString("ko-KR", {
                      month: "numeric",
                      day: "numeric",
                      weekday: "short",
                    })
                  : "날짜를 선택해주세요"}
              </span>
              <br />●{" "}
              <span
                style={{
                  color: formData.meetingDate ? "inherit" : "#999",
                  fontStyle: formData.meetingDate ? "normal" : "italic",
                }}
              >
                {formData.meetingDate
                  ? new Date(formData.meetingDate).toLocaleTimeString("ko-KR", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "시간을 선택해주세요"}
              </span>
            </Typography>
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

        {/* 게시글 유효시간 설정 */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={2} color="#333">
            게시글 유효시간 (자동 삭제)
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            설정한 시간 후 게시글이 자동으로 삭제됩니다. (최대 24시간)
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              aria-label="decrease hours"
              onClick={() =>
                setFormData({
                  ...formData,
                  validHours: Math.max(1, formData.validHours - 1),
                })
              }
              size="small"
            >
              <RemoveIcon />
            </IconButton>
            <TextField
              value={formData.validHours}
              onChange={(e) => {
                const v = Number(e.target.value.replace(/[^0-9]/g, "")) || 1;
                setFormData({
                  ...formData,
                  validHours: Math.min(24, Math.max(1, v)),
                });
              }}
              slotProps={{
                input: {
                  sx: { textAlign: "center", width: "60px" },
                },
              }}
              variant="outlined"
              size="small"
            />
            <IconButton
              aria-label="increase hours"
              onClick={() =>
                setFormData({
                  ...formData,
                  validHours: Math.min(24, formData.validHours + 1),
                })
              }
              size="small"
            >
              <AddIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              시간
            </Typography>
          </Box>

          {/* 시간 선택 버튼들 */}
          <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
            {[1, 3, 6, 12, 24].map((hours) => (
              <Button
                key={hours}
                variant="outlined"
                size="small"
                onClick={() => setFormData({ ...formData, validHours: hours })}
                sx={{
                  bgcolor: formData.validHours === hours ? "#E762A9" : "white",
                  color: formData.validHours === hours ? "white" : "#666",
                  borderColor: formData.validHours === hours ? "#E762A9" : "#e0e0e0",
                  "&:hover": {
                    bgcolor: formData.validHours === hours
                      ? "#E762A9"
                      : "rgba(231, 98, 169, 0.1)",
                    borderColor: "#E762A9",
                  },
                }}
              >
                {hours}시간
              </Button>
            ))}
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

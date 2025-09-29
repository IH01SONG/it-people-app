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
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../lib/api";
import MapPicker from "../../components/MapPicker";
// import { getDefaultImageByCategory } from "../../utils/defaultImages";

interface FormData {
  title: string;
  content: string;
  venue: string;
  location: string; // 주소 문자열
  categoryId: string; // 서버로 보낼 카테고리 ID
  maxParticipants: number;
  meetingDate: string; // 'YYYY-MM-DDTHH:mm'
  tags: string[];
}

type Coords = { lat: number; lng: number };

export default function Step2() {
  const navigate = useNavigate();
  const location = useLocation();

  // Step1에서 넘어온 값: { categoryId, categoryName } 를 기대
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    venue: "",
    location: "",
    categoryId: "", // 서버 전송용 카테고리 ID
    maxParticipants: 4,
    meetingDate: "",
    tags: [],
  });

  // 태그/위치/검색 관련 상태
  const [newTag, setNewTag] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [currentLocationCoords, setCurrentLocationCoords] =
    useState<Coords | null>(null);
  const [locationInput, setLocationInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMapUpdating, setIsMapUpdating] = useState(false);

  // 인원 빠른 선택
  const participantQuickOptions = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30];

  /** 현재 위치 좌표 가져오기 */
  const getCurrentLocationCoords = useCallback((): Promise<Coords> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const fallback = { lat: 37.5665, lng: 126.978 }; // 서울시청
        setCurrentLocationCoords(fallback);
        resolve(fallback);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocationCoords(c);
          resolve(c);
        },
        () => {
          const fallback = { lat: 37.5665, lng: 126.978 };
          setCurrentLocationCoords(fallback);
          resolve(fallback);
        }
      );
    });
  }, []);

  /** 좌표 → 주소 변환 */
  const coordsToAddress = useCallback(
    (lat: number, lng: number): Promise<string> => {
      return new Promise((resolve) => {
        if (!window.kakao?.maps?.services) {
          resolve(`위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`);
          return;
        }
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(lng, lat, (result: any[], status: string) => {
          if (
            status === window.kakao.maps.services.Status.OK &&
            result.length > 0
          ) {
            const roadAddress = result[0].road_address;
            const address = roadAddress
              ? roadAddress.address_name
              : result[0].address.address_name;
            resolve(address);
          } else {
            resolve(`위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`);
          }
        });
      });
    },
    []
  );

  /** 표시용 위치 문자열 */
  const getDisplayLocation = () =>
    locationInput?.trim() || formData.location?.trim() || "위치를 선택해주세요";

  /** MapPicker 콜백 */
  const handleLocationChange = useCallback((locText: string, c: Coords) => {
    setIsMapUpdating(true);
    setLocationInput(locText);
    setFormData((prev) => ({ ...prev, location: locText }));
    setCoords(c);
    setTimeout(() => setIsMapUpdating(false), 100);
  }, []);

  // 마운트 시 현재 위치 시도
  useEffect(() => {
    getCurrentLocationCoords();
  }, [getCurrentLocationCoords]);

  // Step1에서 넘어온 카테고리 반영 (ID를 서버에 보냄)
  useEffect(() => {
    const state = (location.state || {}) as {
      categoryId?: string;
      categoryName?: string;
    };
    if (state.categoryId && state.categoryName) {
      setSelectedCategoryId(state.categoryId);
      setSelectedCategoryName(state.categoryName);
      setFormData((prev) => ({ ...prev, categoryId: state.categoryId || "" }));
    } else {
      // 폴백: 기타
      setSelectedCategoryId("fallback");
      setSelectedCategoryName("기타");
      setFormData((prev) => ({ ...prev, category: "fallback" }));
    }
  }, [location.state]);

  // 위치 입력 → 검색 키워드(디바운스)
  useEffect(() => {
    if (isMapUpdating) return;
    if (
      !locationInput.trim() ||
      locationInput.includes("위도:") ||
      locationInput.includes("경도:")
    ) {
      return;
    }
    const t = setTimeout(() => setSearchKeyword(locationInput), 1000);
    return () => clearTimeout(t);
  }, [locationInput, isMapUpdating]);

  /** 기본이미지(카테고리 기반) */
  const getDefaultImages = (): string[] => {
    const url = getDefaultImageByCategory(selectedCategoryName || "기타");
    return url ? [url] : [];
  };

  /** 태그 추가/삭제 */
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const isFormValid = formData.title.trim().length > 0;

  /** 제출 */
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    }
    if (!formData.content.trim()) {
      alert("소개글을 입력해 주세요.");
      return;
    }
    if (formData.content.trim().length < 5) {
      alert("소개글은 최소 5자 이상 입력해 주세요.");
      return;
    }

    try {
<<<<<<< HEAD
      // 좌표/주소 보완
      let finalCoords = coords ?? currentLocationCoords;
=======
      // 이미지가 없으면 카테고리에 맞는 기본 이미지를 자동으로 추가
      const finalImages: string[] = [];

      // 위치 정보 설정 (필수) - 위치가 입력되지 않으면 현재 위치 사용
      let finalCoords = coords;
>>>>>>> feature/mypage
      let displayLocation = locationInput?.trim() || formData.location?.trim();

      if (!finalCoords) {
        try {
          finalCoords = await getCurrentLocationCoords();
        } catch {
          finalCoords = { lat: 37.5665, lng: 126.978 };
        }
      }
      if (!displayLocation && finalCoords) {
        displayLocation = await coordsToAddress(
          finalCoords.lat,
          finalCoords.lng
        );
      }

      const locationData = finalCoords
        ? {
            type: "Point" as const,
            coordinates: [finalCoords.lng, finalCoords.lat], // [lng, lat]
            address: displayLocation || "",
          }
        : undefined;

      const finalImageUrls = getDefaultImages();

      const postPayload = {
<<<<<<< HEAD
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags,
        maxParticipants: formData.maxParticipants,
        ...(locationData && { location: locationData }), // 백엔드가 필수라면 항상 포함으로 변경 가능
        categoryId: selectedCategoryId || formData.categoryId, // 반드시 ID로 전송
        ...(formData.venue.trim() && { venue: formData.venue.trim() }),
=======
        title: formData.title,
        content: formData.content.trim(), // 필수 필드로 변경
        tags: formData.tags,
        maxParticipants: formData.maxParticipants,
        location: locationData, // 위치 정보는 항상 포함 (필수)
        ...(formData.category && { category: formData.category }),
        ...(formData.venue?.trim() && { venue: formData.venue.trim() }),
>>>>>>> feature/mypage
        ...(formData.meetingDate && {
          meetingDate: new Date(formData.meetingDate).toISOString(),
        }),
<<<<<<< HEAD
        ...(finalImageUrls.length > 0 && {
          imageUrls: finalImageUrls,
          images: finalImageUrls, // 백엔드 호환
=======
        // 이미지 필드 - 백엔드 호환성을 위해 둘 다 전송
        ...(finalImages.length > 0 && {
          imageUrls: finalImages,
          images: finalImages // 백엔드 호환성을 위해 추가
>>>>>>> feature/mypage
        }),
      };

      const response = await api.posts.create(postPayload);
      console.log("게시글 작성 성공:", response);
      alert("게시글이 성공적으로 작성되었습니다!");
      navigate("/", { state: { refreshPosts: true } });
    } catch (error: any) {
      console.error("게시글 생성 실패:", error);
      const status = error?.response?.status;
      const serverMsg =
        error?.response?.data?.message || error?.response?.data?.error;
      if (status === 400) {
        alert(`입력 오류: ${serverMsg || "입력 정보를 확인해 주세요."}`);
      } else if (status === 401) {
        alert("로그인이 필요합니다.");
      } else {
        alert(
          serverMsg ||
            error?.message ||
            "서버 오류가 발생했습니다. 다시 시도해 주세요."
        );
      }
    }
  };

  // 초기 카테고리 폴백(안전망)
  useEffect(() => {
    if (!selectedCategoryName && !(location.state as any)?.categoryName) {
      setSelectedCategoryName("기타");
      setSelectedCategoryId("fallback");
      setFormData((prev) => ({ ...prev, categoryId: "fallback" }));
    }
  }, [selectedCategoryName, location.state]);

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
        "@media (min-width:600px)": { maxWidth: "600px" },
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
          sx={{ flexGrow: 1, textAlign: "center", mr: 4, fontWeight: 700 }}
        >
          모임 상세 정보
        </Typography>
      </Box>

      <Container
        maxWidth="sm"
        sx={{
          px: 3,
          py: 3,
          maxWidth: "600px !important",
          "@media (min-width: 600px)": { maxWidth: "600px !important" },
        }}
      >
        {/* 진행 표시 */}
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

        {/* 선택된 카테고리 */}
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
            {selectedCategoryName}
          </Typography>
        </Card>

        {/* 제목 */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="제목을 입력해 주세요(5-20글자)"
            value={formData.title}
            onChange={(e) => {
              const title = e.target.value;
              if (title.length <= 20) setFormData((p) => ({ ...p, title }));
            }}
            variant="outlined"
            helperText={`${formData.title.length}/20자`}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: "1.1rem",
                "&:hover": { borderColor: "#E762A9" },
                "&.Mui-focused": {
                  borderColor: "#E762A9",
                  boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                },
              },
            }}
          />
        </Box>

<<<<<<< HEAD
        {/* 소개글 */}
=======
        {/* 이미지 업로드 */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={1} color="#333">
            사진 첨부
          </Typography>
          <Box display="flex" gap={2}>
            {[].map((img, idx) => (
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
                    console.log('이미지 삭제 기능 비활성화')
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
            {false && (
              <Box
                onClick={() => console.log('이미지 업로드 기능 비활성화')}
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
                {/* <PhotoCameraIcon sx={{ fontSize: 24, color: "#E762A9", mb: 0.5 }} /> */}
                <Typography
                  variant="caption"
                  color="#E762A9"
                  textAlign="center"
                >
                  0/3
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
              onChange={() => console.log('파일 변경 기능 비활성화')}
              style={{ display: "none" }}
            />
          </Box>
        </Box>

        {/* 소개글 입력 */}
>>>>>>> feature/mypage
        <Box mb={3}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="소개글을 입력해 주세요 (최대 100글자)"
            value={formData.content}
            onChange={(e) => {
              const content = e.target.value;
              if (content.length <= 100)
                setFormData((p) => ({ ...p, content }));
            }}
            helperText={`${formData.content.length}/100자`}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover": { borderColor: "#E762A9" },
                "&.Mui-focused": {
                  borderColor: "#E762A9",
                  boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                },
              },
            }}
          />
        </Box>

        {/* 만날 위치 및 시간 */}
        <Box mb={3} key="meeting-location-time">
          <Typography variant="subtitle2" fontWeight={600} mb={2} color="#333">
            만날 위치 및 시간
          </Typography>

          {/* 위치/시간 표시 카드 */}
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
              {/* <LocationOnIcon sx={{ fontSize: 16, color: "#E762A9" }} /> */}
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  color:
                    "위치를 선택해주세요" === "위치를 선택해주세요"
                      ? "#999"
                      : "#333",
                }}
              >
                위치를 선택해주세요
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

          {/* 위치 입력(텍스트) */}
          <Box mb={2}>
            <TextField
              fullWidth
              placeholder="위치를 입력해주세요 (미입력 시 현재 위치로 설정됩니다)"
              value={locationInput}
              onChange={(e) => {
                const v = e.target.value;
                setLocationInput(v);
                setFormData((p) => ({ ...p, location: v }));
              }}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover": { borderColor: "#E762A9" },
                  "&.Mui-focused": {
                    borderColor: "#E762A9",
                    boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                  },
                },
              }}
            />
          </Box>

          {/* 지도 한 번만 렌더 */}
          <Box mb={3}>
            <MapPicker
              onLocationChange={handleLocationChange}
              searchKeyword={searchKeyword}
            />
          </Box>

          {/* 날짜/시간 설정 (한 번만) */}
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
                setFormData((p) => ({
                  ...p,
                  meetingDate: date ? `${date}T${time}` : "",
                }));
              }}
              variant="outlined"
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
                setFormData((p) => ({
                  ...p,
                  meetingDate: `${date}T${e.target.value}`,
                }));
              }}
              variant="outlined"
              size="small"
<<<<<<< HEAD
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
=======
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
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
>>>>>>> feature/mypage
            />
          </Box>

          {/* 최대 모집 인원 */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              최대 모집 인원
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton
                aria-label="decrease"
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    maxParticipants: Math.max(2, p.maxParticipants - 1),
                  }))
                }
                size="small"
              >
                <RemoveIcon />
              </IconButton>

              <TextField
                value={formData.maxParticipants}
                onChange={(e) => {
                  const v = Number(e.target.value.replace(/[^0-9]/g, "")) || 2;
                  setFormData((p) => ({
                    ...p,
                    maxParticipants: Math.min(30, Math.max(2, v)),
                  }));
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
                  setFormData((p) => ({
                    ...p,
                    maxParticipants: Math.min(30, p.maxParticipants + 1),
                  }))
                }
                size="small"
              >
                <AddIcon />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                명
              </Typography>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {participantQuickOptions.map((num) => {
                const active = formData.maxParticipants === num;
                return (
                  <Chip
                    key={num}
                    label={`${num}`}
                    size="small"
                    onClick={() =>
                      setFormData((p) => ({ ...p, maxParticipants: num }))
                    }
                    sx={{
                      cursor: "pointer",
                      bgcolor: active ? "#E762A9" : "white",
                      color: active ? "white" : "#666",
                      border: `1px solid ${active ? "#E762A9" : "#e0e0e0"}`,
                      "&:hover": { bgcolor: active ? "#D554A0" : "#f5f5f5" },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* 해시태그 */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={2} color="#333">
            해시태그 입력
          </Typography>

          <TextField
            fullWidth
            placeholder="#태그입력"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value.replace(/^#+/, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (newTag.trim()) handleAddTag();
              }
            }}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover": { borderColor: "#E762A9" },
                "&.Mui-focused": {
                  borderColor: "#E762A9",
                  boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                },
              },
            }}
          />

          {formData.tags.length > 0 && (
            <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
              {formData.tags.map((tag, i) => (
                <Chip
                  key={`${tag}-${i}`}
                  label={`#${tag}`}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  sx={{
                    bgcolor: "#E762A9",
                    color: "white",
                    fontWeight: 600,
                    "& .MuiChip-deleteIcon": {
                      color: "rgba(255,255,255,0.8)",
                      "&:hover": { color: "white" },
                    },
                    "&:hover": { bgcolor: "#D554A0", transform: "scale(1.05)" },
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
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
            "&:hover": { bgcolor: "#D554A0" },
            "&:disabled": { bgcolor: "#e0e0e0", color: "#9e9e9e" },
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

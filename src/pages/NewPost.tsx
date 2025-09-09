import { useState, useEffect } from "react";
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
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
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

export default function NewPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    location: "홍대입구",
    venue: "",
    maxParticipants: 4,
    meetingDate: "",
    tags: [] as string[],
  });
  const [userLocation, setUserLocation] = useState<string>("홍대입구 근처");
  const [image, setImage] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");

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
                  setFormData(prev => ({ ...prev, location: address }));
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

  const categories = [
    { value: "식사", label: "식사" },
    { value: "카페/디저트", label: "카페/디저트" },
    { value: "쇼핑", label: "쇼핑" },
    { value: "운동", label: "운동" },
    { value: "스터디/코딩", label: "스터디/코딩" },
    { value: "게임", label: "게임" },
    { value: "영화/문화", label: "영화/문화" },
    { value: "기타", label: "기타" },
  ];

  const locations = ["홍대입구", "강남", "신촌", "이태원", "명동", "건대입구"];
  const participantOptions = [2, 3, 4, 5, 6, 8, 10];

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("글 작성을 위해 로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
      navigate("/login");
      return;
    }
    if (formData.title.trim() && formData.content.trim() && formData.category) {
      // 위치 정보 가져오기 (기본으로 홍대 좌표)
      const locationData = {
        type: "Point" as const,
        coordinates: [126.9235, 37.5502], // 홍대입구역 좌표
        address: `${formData.location} 근처`,
      };

      // 백엔드 스키마에 맞춘 필드만 전송
      const payload = {
        title: formData.title,
        content: formData.content,
        location: locationData,
        venue: formData.venue || `${formData.location} 모임장소`,
        category: formData.category,
        tags: formData.tags,
        maxParticipants: formData.maxParticipants,
        meetingDate: formData.meetingDate || undefined,
        image: image || undefined,
      };

      try {
        // 백엔드에 게시글 생성 요청
        const response = await api.posts.create(payload as any);
        if (response.success) {
          console.log("게시글 생성 성공:", response.data);
          // 성공 시 홈으로 이동
          navigate("/");
          return;
        }
        throw new Error("서버가 성공을 반환하지 않았습니다.");
      } catch (error) {
        console.error("게시글 생성 실패:", error);
        // TODO: 에러 알림 표시
        alert("게시글 생성에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleImageUpload = () => {
    // 실제 구현에서는 파일 선택 다이얼로그를 열어야 함
    const dummyImages = [
      "https://picsum.photos/seed/food1/400/300",
      "https://picsum.photos/seed/cafe1/400/300",
      "https://picsum.photos/seed/study1/400/300",
    ];
    setImage(dummyImages[Math.floor(Math.random() * dummyImages.length)]);
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

  const isFormValid =
    formData.title.trim().length > 0 &&
    formData.content.trim().length > 0 &&
    formData.category;

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
                새로운 모임을 만들어보세요!
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationOnIcon sx={{ fontSize: 16, color: "#E762A9" }} />
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
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            variant="outlined"
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "#f8f9fa",
                "&:hover": {
                  backgroundColor: "#f1f3f5",
                },
                "&.Mui-focused": {
                  backgroundColor: "white",
                  boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                },
              },
            }}
            inputProps={{
              style: {
                fontSize: "1rem",
                fontWeight: 500,
              },
            }}
          />

          {/* 내용 입력 */}
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="어떤 활동을 하고 싶은지 자세히 설명해주세요"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            variant="outlined"
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "#f8f9fa",
                "&:hover": {
                  backgroundColor: "#f1f3f5",
                },
                "&.Mui-focused": {
                  backgroundColor: "white",
                  boxShadow: "0 0 0 2px rgba(231, 98, 169, 0.2)",
                },
              },
            }}
          />

          {/* 이미지 업로드 */}
          <Box mb={3}>
            {image ? (
              <Box sx={{ position: "relative" }}>
                <Box
                  component="img"
                  src={image}
                  sx={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 3,
                    mb: 2,
                  }}
                />
                <IconButton
                  onClick={() => setImage(null)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(0,0,0,0.6)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.8)",
                    },
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
                  borderColor: "#E762A9",
                  color: "#E762A9",
                  borderStyle: "dashed",
                  "&:hover": {
                    borderColor: "#D554A0",
                    bgcolor: "rgba(231, 98, 169, 0.04)",
                  },
                }}
              >
                사진 추가하기
              </Button>
            )}
          </Box>
        </Card>

        {/* 모임 설정 */}
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
                onClick={() =>
                  setFormData({ ...formData, category: cat.value })
                }
                sx={{
                  cursor: "pointer",
                  bgcolor:
                    formData.category === cat.value ? "#E762A9" : "white",
                  color: formData.category === cat.value ? "white" : "#666",
                  border: `1px solid ${
                    formData.category === cat.value ? "#E762A9" : "#e0e0e0"
                  }`,
                  borderRadius: 3,
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor:
                      formData.category === cat.value ? "#D554A0" : "#f8f9fa",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
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
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              sx={{
                borderRadius: 3,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E762A9",
                },
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxParticipants: e.target.value as number,
                })
              }
              sx={{
                borderRadius: 3,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E762A9",
                },
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
            onChange={(e) =>
              setFormData({ ...formData, venue: e.target.value })
            }
            variant="outlined"
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />

          {/* 모임 날짜/시간 */}
          <TextField
            fullWidth
            label="모임 날짜/시간"
            type="datetime-local"
            value={formData.meetingDate}
            onChange={(e) =>
              setFormData({ ...formData, meetingDate: e.target.value })
            }
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />

          {/* 태그 입력 */}
          <Box mb={2}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              mb={2}
              color="#666"
            >
              관련 태그
            </Typography>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                size="small"
                placeholder="태그 추가 (Enter로 입력)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                sx={{
                  flexGrow: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                size="small"
                sx={{
                  borderColor: "#E762A9",
                  color: "#E762A9",
                  "&:hover": {
                    borderColor: "#D554A0",
                    bgcolor: "rgba(231, 98, 169, 0.04)",
                  },
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
                    bgcolor: "#E762A9",
                    color: "white",
                    "& .MuiChip-deleteIcon": {
                      color: "rgba(255,255,255,0.7)",
                      "&:hover": {
                        color: "white",
                      },
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
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
          잇플 모임 만들기
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          모든 필수 정보를 입력하고 모임을 만들어보세요
        </Typography>
      </Container>
    </Box>
  );
}
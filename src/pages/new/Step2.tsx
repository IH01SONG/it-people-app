import { useState, useEffect, useRef } from "react";
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
<<<<<<< Updated upstream
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch, API_BASE_URL } from "../../utils/api";
import { getDefaultImageForCategory } from "../../utils/defaultImages";
import MapPicker from "./MapPicker";
// import logoSvg from "../../assets/logo.png";
=======
import { useNavigate, useLocation } from "react-router-dom";
import { Map, MapMarker } from "react-kakao-maps-sdk";
>>>>>>> Stashed changes

interface FormData {
  title: string;
  content: string;
  venue: string;
  location: string;
  category: string;
<<<<<<< HEAD
  content: string;
  meetingDate?: string;
  tags?: string[];
}

interface ExtendedFormData extends FormData {
  meetingTime: string;
  duration: string;
  maxParticipants: string;
  additionalInfo: string;
  tags: string[];
  venue: string;
  location: string;
<<<<<<< Updated upstream
=======
  maxParticipants: number;
  meetingDate: string;
  tags: string[];
  image?: string;
>>>>>>> feature/new-post
=======
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationData {
  id: string;
  name: string;
  category: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
>>>>>>> Stashed changes
}

export default function Step2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [userLocation, setUserLocation] = useState<string>("홍대입구");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    venue: "",
    location: "",
    category: "",
<<<<<<< Updated upstream
    maxParticipants: 4,
    meetingDate: "",
    tags: [],
    image: undefined,
=======
    content: ""
  });
  
  const [formData, setFormData] = useState<ExtendedFormData>({
    ...step1Data,
    meetingTime: "",
    duration: "",
    maxParticipants: "",
    additionalInfo: "",
    tags: [],
    coordinates: {
      lat: 37.5502,
      lng: 126.9235
    }
>>>>>>> Stashed changes
  });

  const [images, setImages] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
<<<<<<< Updated upstream
  const [mapOpen, setMapOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationInput, setLocationInput] = useState("");
=======
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5502, lng: 126.9235 });
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 홍대 주변 주요 장소들
  const hongdaeLocations: LocationData[] = [
    {
      id: "hongik-univ",
      name: "홍익대학교",
      category: "대학교",
      address: "서울 마포구 와우산로 94",
      coordinates: { lat: 37.5486, lng: 126.9203 }
    },
    {
      id: "hongdae-playground",
      name: "홍대 놀이터",
      category: "핫플레이스",
      address: "서울 마포구 와우산로21길",
      coordinates: { lat: 37.5500, lng: 126.9215 }
    },
    {
      id: "hongdae-station",
      name: "홍대입구역",
      category: "지하철역",
      address: "서울 마포구 양화로 지하188",
      coordinates: { lat: 37.5502, lng: 126.9235 }
    },
    {
      id: "mecenatpolis",
      name: "메세나폴리스",
      category: "쇼핑몰",
      address: "서울 마포구 양화로 45",
      coordinates: { lat: 37.5495, lng: 126.9245 }
    },
    {
      id: "hongdae-ak",
      name: "AK&홍대",
      category: "쇼핑몰",
      address: "서울 마포구 양화로 200",
      coordinates: { lat: 37.5510, lng: 126.9255 }
    },
    {
      id: "starbucks-hongdae",
      name: "스타벅스 홍대점",
      category: "카페",
      address: "서울 마포구 양화로 155",
      coordinates: { lat: 37.5505, lng: 126.9225 }
    },
    {
      id: "bluebottle-hongdae",
      name: "블루보틀 홍대점",
      category: "카페",
      address: "서울 마포구 와우산로29나길 17",
      coordinates: { lat: 37.5485, lng: 126.9195 }
    },
    {
      id: "megabox-hongdae",
      name: "홍대 메가박스",
      category: "영화관",
      address: "서울 마포구 양화로 153",
      coordinates: { lat: 37.5508, lng: 126.9228 }
    }
  ];
>>>>>>> Stashed changes

  // 향후 위치 선택 기능 확장 시 사용
  // const locations = ["홍대입구", "강남", "신촌", "이태원", "명동", "건대입구"];
  const participantQuickOptions = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30];

  // 사용자 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Kakao Maps API를 사용하여 좌표를 주소로 변환
          if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2Address(
              longitude,
              latitude,
              (result: any, status: any) => {
                if (
                  status === window.kakao.maps.services.Status.OK &&
                  result[0]
                ) {
                  const address =
                    result[0].road_address?.region_2depth_name ||
                    result[0].address?.region_2depth_name ||
                    result[0].road_address?.region_3depth_name ||
                    result[0].address?.region_3depth_name;
                  if (address) {
                    setUserLocation(address);
                    setFormData((prev) => ({
                      ...prev,
                      location: address,
                    }));
                  }
                }
              }
            );
          }
        },
        (error) => {
          console.log("위치 정보를 가져올 수 없습니다:", error);
          // 기본값으로 설정
          setFormData((prev) => ({
            ...prev,
            location: userLocation,
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000, // 5분간 캐시
        }
      );
    } else {
      // Geolocation을 지원하지 않는 경우 기본값 사용
      setFormData((prev) => ({
        ...prev,
        location: userLocation,
      }));
      
      // Step1에서 선택한 장소와 매칭되는 좌표 찾기
      const matchedLocation = hongdaeLocations.find(loc => 
        loc.name.includes(step1.venue.split(' ')[0]) || 
        step1.venue.includes(loc.name.split(' ')[0])
      );
      
      if (matchedLocation) {
        setSelectedLocation(matchedLocation);
        setMapCenter(matchedLocation.coordinates);
        setFormData(prev => ({
          ...prev,
          coordinates: matchedLocation.coordinates
        }));
      }
    }
  }, [userLocation]);

<<<<<<< HEAD
  const handleSubmit = async () => {
    // 백엔드 API 호출을 위한 데이터 준비
    const postData = {
      title: formData.title,
      content: formData.content,
      category: formData.category,
      location: {
        type: 'Point' as const,
        coordinates: [formData.coordinates?.lng || 126.9235, formData.coordinates?.lat || 37.5502],
        address: selectedLocation?.address || formData.location || '홍대입구 근처'
      },
      venue: formData.venue,
      maxParticipants: parseInt(formData.maxParticipants.split('명')[0]),
      meetingDate: formData.meetingTime ? new Date(formData.meetingTime) : undefined,
      tags: formData.tags || [],
      additionalInfo: formData.additionalInfo
    };
    
    // TODO: API 호출
    // await api.post('/api/posts', postData);
    
    navigate('/feedback-result', { state: { ...formData, postData } });
=======
  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
      setFormData((prev) => ({
        ...prev,
        category: location.state.category,
      }));

      // 카테고리가 설정되면 기본 이미지를 자동으로 추가 (이미지가 없는 경우에만)
      if (images.length === 0) {
        const defaultImage = getDefaultImageForCategory(
          location.state.category
        );
        if (defaultImage) {
          setImages([defaultImage]);
        }
      }
    }
  }, [location.state, images.length]);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    // 이미지가 없으면 카테고리에 맞는 기본 이미지를 자동으로 추가
    let finalImages = images;
    if (finalImages.length === 0 && formData.category) {
      const defaultImage = getDefaultImageForCategory(formData.category);
      if (defaultImage) {
        finalImages = [defaultImage];
        setImages(finalImages); // UI에도 반영
      }
    }

    // 위치 정보 가져오기 (사용자가 입력한 위치 또는 지도에서 선택한 장소)
    const displayLocation = locationInput || formData.location || userLocation;
    const locationData = {
      type: "Point" as const,
      coordinates: [coords?.lng || 126.9235, coords?.lat || 37.5502], // lng,lat 순서
      address: displayLocation || `${userLocation} 근처`,
    };

    // 백엔드 스키마에 맞춘 필드만 전송
    const payload = {
      title: formData.title,
      content: formData.content,
      location: locationData,
      venue: formData.venue || `${displayLocation} 모임장소`,
      category: formData.category,
      tags: formData.tags,
      maxParticipants: formData.maxParticipants,
      meetingDate: formData.meetingDate || undefined,
      image: finalImages[0] || undefined,
    };

    try {
      // 1) 이미지가 있으면 업로드 (멀티 파트)
      let imageUrl: string | undefined = undefined;
      if (finalImages.length > 0) {
        // 기본 이미지(외부 URL)인 경우 업로드하지 않고 바로 사용
        if (finalImages[0].startsWith("https://images.unsplash.com/")) {
          imageUrl = finalImages[0];
        } else {
          // 사용자가 업로드한 이미지인 경우에만 서버에 업로드
          const blobPromises = finalImages.map(async (url) => {
            const resp = await fetch(url);
            return await resp.blob();
          });
          const blobs = await Promise.all(blobPromises);
          const formDataUpload = new FormData();
          blobs.forEach((b, idx) =>
            formDataUpload.append("files", b, `image_${idx}.jpg`)
          );
          // 가정: 서버 업로드 엔드포인트 /uploads (필요 시 변경)
          const uploadRes = await fetch(`${API_BASE_URL}/uploads`, {
            method: "POST",
            body: formDataUpload,
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json().catch(() => ({}));
            // 서버가 배열/단일 URL을 반환한다고 가정
            imageUrl = (data?.urls && data.urls[0]) || data?.url || undefined;
          }
        }
      }

      const finalPayload: typeof payload & { image?: string } = {
        ...payload,
        image: imageUrl ?? payload.image,
      };
      await apiFetch("/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      navigate("/");
    } catch (error) {
      console.error("게시글 생성 실패:", error);
      alert("게시글 생성에 실패했습니다. 다시 시도해주세요.");
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
>>>>>>> feature/new-post
  };

  const handleLocationSelect = (locationData: LocationData) => {
    setSelectedLocation(locationData);
    setMapCenter(locationData.coordinates);
    setFormData(prev => ({
      ...prev,
      venue: locationData.name,
      location: locationData.address,
      coordinates: locationData.coordinates
    }));
  };

  const handleMapClick = (target: any, mouseEvent: any) => {
    const { latLng } = mouseEvent;
    const newCoords = {
      lat: latLng.getLat(),
      lng: latLng.getLng()
    };
    
    setMapCenter(newCoords);
    setFormData(prev => ({
      ...prev,
      coordinates: newCoords
    }));
    
    // 선택된 기존 장소 해제
    setSelectedLocation(null);
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
    formData.title.trim().length > 0 && formData.content.trim().length > 0;

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

<<<<<<< HEAD
      {/* 입력한 제목 요약 */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          p: 2,
          mb: 3,
          background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Typography variant="body2" color="white" fontWeight={600} mb={1}>
          만들 모임
        </Typography>
        <Typography variant="h6" color="white" fontWeight={700}>
          "{step1Data.title}"
        </Typography>
        <Typography variant="body2" color="white" sx={{ opacity: 0.9 }} mt={1}>
          장소: {step1Data.venue} • {step1Data.category}
        </Typography>
      </Card>

      {/* 지도 섹션 */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          p: 3,
          mb: 3,
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Box mb={2}>
          <Typography variant="h6" fontWeight={600} mb={1} display="flex" alignItems="center" gap={1}>
            <LocationOnIcon sx={{ color: '#FFD700' }} />
            만날 장소 확인
          </Typography>
          <Typography variant="body2" color="text.secondary">
            지도에서 정확한 만날 장소를 확인하거나 선택해주세요
          </Typography>
        </Box>

        {/* 카카오 맵 */}
        <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
          <Map
            center={mapCenter}
            style={{ width: '100%', height: '300px' }}
            level={3}
            onClick={handleMapClick}
            onLoad={() => setIsMapLoaded(true)}
          >
            {/* 선택된 위치 마커 */}
            <MapMarker
              position={formData.coordinates || mapCenter}
              image={{
                src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
                size: { width: 64, height: 69 },
                options: { offset: { x: 27, y: 69 } }
              }}
            />

            {/* 주변 장소들 마커 */}
            {hongdaeLocations.map((loc) => (
              <MapMarker
                key={loc.id}
                position={loc.coordinates}
                title={loc.name}
                image={{
                  src: selectedLocation?.id === loc.id 
                    ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'
                    : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                  size: { width: 24, height: 35 },
                  options: { offset: { x: 12, y: 35 } }
                }}
                onClick={() => handleLocationSelect(loc)}
              />
            ))}
          </Map>
        </Box>

        {/* 주변 장소 목록 */}
        <Box>
          <Typography variant="subtitle2" mb={1}>
            주변 추천 장소
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {hongdaeLocations.slice(0, 6).map((loc) => (
              <Chip
                key={loc.id}
                label={`${loc.name} (${loc.category})`}
                size="small"
                onClick={() => handleLocationSelect(loc)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedLocation?.id === loc.id ? '#FFD700' : 'white',
                  color: selectedLocation?.id === loc.id ? '#333' : '#666',
                  border: '1px solid #ddd',
                  '&:hover': {
                    bgcolor: selectedLocation?.id === loc.id ? '#FFC107' : '#f5f5f5'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </Card>

      {/* 상세 정보 폼 */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          p: 3,
          mb: 3,
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Box mb={3}>
          <div className="text-xl mb-2 text-center font-bold">세부 설정</div>
          <Typography variant="h6" fontWeight={600} textAlign="center" mb={1}>
            모임 세부 정보
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            언제 만날지, 몇 명까지 참여할지 설정해주세요
          </Typography>
=======
      <Container maxWidth="sm" sx={{ px: 3, py: 3 }}>
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
        ></Container>
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
>>>>>>> feature/new-post
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
            placeholder="제목을 입력해 주세요(5글자 이상)"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            variant="outlined"
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
          {images.length > 0 &&
            images[0].startsWith("https://images.unsplash.com/") && (
              <Typography
                variant="caption"
                color="primary"
                mb={2}
                display="block"
              >
                💡 카테고리에 맞는 기본 이미지가 자동으로 추가되었습니다.
                원하시면 다른 사진으로 변경하실 수 있어요!
              </Typography>
            )}
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
        </Box>

        {/* 소개글 입력 */}
        <Box mb={3}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="소개글을 입력해 주세요"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
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
              <Typography variant="body2" fontWeight={600}>
                {formData.location || userLocation} 근처
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              ●{" "}
              {formData.meetingDate
                ? new Date(formData.meetingDate).toLocaleDateString("ko-KR", {
                    month: "numeric",
                    day: "numeric",
                    weekday: "short",
                  })
                : "날짜 미정"}{" "}
              <br></br>●{" "}
              {formData.meetingDate
                ? new Date(formData.meetingDate).toLocaleTimeString("ko-KR", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "시간 미정"}
            </Typography>
<<<<<<< Updated upstream
          </Box>

          {/* 위치 입력 필드 */}
          <Box mb={2}>
            <TextField
              fullWidth
              placeholder="위치를 입력해주세요"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setFormData({
                  ...formData,
                  location: e.target.value || userLocation,
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
          <Button
            variant="outlined"
            onClick={() => setMapOpen(true)}
            sx={{
              mb: 2,
              bgcolor: "white",
              borderColor: "#E762A9",
              color: "#E762A9",
              "&:hover": { bgcolor: "rgba(231, 98, 169, 0.05)" },
            }}
          >
            지도에서 위치 선택
          </Button>

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
=======
            <Box display="flex" gap={1} mb={2}>
              <TextField
                size="small"
                placeholder="태그 추가 (Enter로 입력)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyPress}
                sx={{ flexGrow: 1 }}
              />
              <Button 
                variant="outlined" 
                onClick={handleAddTag}
                disabled={!newTag.trim()}
>>>>>>> Stashed changes
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
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  style: { textAlign: "center", width: 64 },
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
            onKeyPress={(e) => {
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
      <MapPicker
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onSelect={(c) => {
          setCoords({ lat: c.lat, lng: c.lng });
          const placeName =
            c.address || `위도: ${c.lat.toFixed(4)}, 경도: ${c.lng.toFixed(4)}`;
          setLocationInput(placeName);
          setFormData((prev) => ({
            ...prev,
            location: placeName,
          }));
          setMapOpen(false);
        }}
        center={coords || undefined}
      />
    </Box>
  );
}

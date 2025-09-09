import { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate, useLocation } from "react-router-dom";
import { Map, MapMarker } from "react-kakao-maps-sdk";

interface FormData {
  title: string;
  venue: string;
  location: string;
  category: string;
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
}

export default function Step2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step1Data, setStep1Data] = useState<FormData>({
    title: "",
    venue: "",
    location: "",
    category: "",
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
  });

  const [newTag, setNewTag] = useState("");
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

  useEffect(() => {
    if (location.state) {
      const step1 = location.state as FormData;
      setStep1Data(step1);
      setFormData(prev => ({
        ...prev,
        ...step1
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
  }, [location.state]);

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
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-24 bg-white min-h-screen">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between py-4">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600} color="#333">
          상세 정보
        </Typography>
        <div className="w-10"></div>
      </div>

      {/* 프로그레스 */}
      <Box mb={4}>
        <Stepper activeStep={1} sx={{ mb: 2 }}>
          <Step>
            <StepLabel>기본 정보</StepLabel>
          </Step>
          <Step>
            <StepLabel>상세 내용</StepLabel>
          </Step>
          <Step>
            <StepLabel>완료</StepLabel>
          </Step>
        </Stepper>
      </Box>

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
        </Box>

        <Box sx={{ space: 3 }}>
          <TextField
            fullWidth
            label="만날 시간"
            placeholder="예: 오늘 저녁 7시, 내일 오후 2시"
            value={formData.meetingTime}
            onChange={(e) => setFormData({...formData, meetingTime: e.target.value})}
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>예상 소요 시간</InputLabel>
            <Select
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              label="예상 소요 시간"
            >
              <MenuItem value="30분~1시간">30분~1시간</MenuItem>
              <MenuItem value="1~2시간">1~2시간</MenuItem>
              <MenuItem value="2~3시간">2~3시간</MenuItem>
              <MenuItem value="3시간 이상">3시간 이상</MenuItem>
              <MenuItem value="하루 종일">하루 종일</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>최대 참여 인원</InputLabel>
            <Select
              value={formData.maxParticipants}
              onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
              label="최대 참여 인원"
            >
              <MenuItem value="2명 (나 + 1명)">2명 (나 + 1명)</MenuItem>
              <MenuItem value="3명 (나 + 2명)">3명 (나 + 2명)</MenuItem>
              <MenuItem value="4명 (나 + 3명)">4명 (나 + 3명)</MenuItem>
              <MenuItem value="5명 (나 + 4명)">5명 (나 + 4명)</MenuItem>
              <MenuItem value="6명 (나 + 5명)">6명 (나 + 5명)</MenuItem>
              <MenuItem value="제한 없음">제한 없음</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="추가 정보"
            placeholder="특별한 준비물, 주의사항, 참여자에게 바라는 점 등"
            value={formData.additionalInfo}
            onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />

          {/* 태그 입력 */}
          <Box mb={2}>
            <Typography variant="subtitle2" mb={1}>
              관련 태그
            </Typography>
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
                size="small"
              >
                추가
              </Button>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  sx={{ bgcolor: '#FFD700', color: '#333' }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Card>

      {/* 추천 태그 */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          p: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          추천 태그
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {["혼밥탈출", "새친구", "홍대맛집", "카페투어", "영화친구", "쇼핑메이트", "게임친구", "스터디", "혼자하기아쉬운", "즉석만남"].map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={() => {
                if (!formData.tags.includes(tag)) {
                  setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, tag]
                  }));
                }
              }}
              sx={{ 
                cursor: 'pointer',
                bgcolor: formData.tags.includes(tag) ? '#FFD700' : 'white',
                color: formData.tags.includes(tag) ? '#333' : '#666',
                '&:hover': {
                  bgcolor: formData.tags.includes(tag) ? '#FFC107' : '#f5f5f5'
                }
              }}
            />
          ))}
        </Box>
      </Card>

      {/* 하단 버튼 */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
        <div className="max-w-md mx-auto">
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            sx={{
              bgcolor: '#FFD700',
              color: '#333',
              fontWeight: 700,
              borderRadius: 3,
              py: 1.5,
              '&:hover': {
                bgcolor: '#FFC107',
              }
            }}
          >
            모임 만들기
          </Button>
        </div>
      </Box>
    </div>
  );
}
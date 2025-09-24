// 백업용 원본 Map 컴포넌트
import { useState, useEffect, useRef } from "react";
import { Map as KakaoMap, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Chip,
  InputAdornment,
  IconButton,
  Slide,
  Fade,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import AppHeader from "../components/AppHeader";
import type { Post } from "../types/home.types";

// 로고 이미지
import logoSvg from "../assets/logo.png";
import { getCategoryName } from "../utils/hardcodedCategories";

interface MapPost extends Omit<Post, 'location'> {
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
}

interface FilterState {
  category: string;
  tags: string[];
  searchQuery: string;
}

export default function Map() {
  const [loading, error] = useKakaoLoader({
    appkey: "0c537754f8fad9d1b779befd5d75dc07",
    libraries: ["services", "clusterer", "drawing"],
  });

  const [center, setCenter] = useState({
    lat: 37.5502,
    lng: 126.9235, // 홍대입구역
  });
  const [selectedPost, setSelectedPost] = useState<MapPost | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("홍대입구");
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    tags: [],
    searchQuery: "",
  });

  const mapRef = useRef<any>(null);

  // 홈 페이지와 동일한 목 데이터 (지도용으로 변환)
  const generateMapPosts = (): MapPost[] => {
    const locations = [
      { name: "홍대입구", lat: 37.5502, lng: 126.9235 },
      { name: "강남", lat: 37.4979, lng: 127.0276 },
      { name: "신촌", lat: 37.5559, lng: 126.9356 },
      { name: "이태원", lat: 37.5344, lng: 126.9944 },
      { name: "명동", lat: 37.5636, lng: 126.9822 },
      { name: "건대입구", lat: 37.5403, lng: 127.0698 },
    ];

    const postTemplates = [
      {
        title: "저녁 같이 먹을 사람?",
        content: "혼밥 싫어서 같이 드실 분 구해요! 맛있는 피자 같이 먹어요",
        category: "식사",
        tags: ["혼밥탈출", "새친구"],
      },
      {
        title: "카페에서 수다떨어요",
        content: "근처 카페에서 커피 마시며 대화해요. 디저트도 같이!",
        category: "카페",
        tags: ["카페투어", "수다"],
      },
      {
        title: "쇼핑 같이 해요",
        content: "쇼핑하면서 구경하실 분! 같이 다녀요",
        category: "쇼핑",
        tags: ["쇼핑메이트", "구경"],
      },
      {
        title: "운동 메이트 구해요",
        content: "함께 운동할 분 찾아요! 헬스장이나 런닝 같이해요",
        category: "운동",
        tags: ["헬스", "런닝"],
      },
      {
        title: "스터디 모임",
        content: "공부 같이 할 사람 모집! 조용한 카페에서 각자 공부해요",
        category: "스터디",
        tags: ["공부", "집중"],
      },
    ];

    return Array.from({ length: 15 }, (_, i) => {
      const template = postTemplates[i % postTemplates.length];
      const location = locations[i % locations.length];
      const now = Date.now();
      
      // 위치에 약간의 랜덤 오프셋 추가
      const latOffset = (Math.random() - 0.5) * 0.01;
      const lngOffset = (Math.random() - 0.5) * 0.01;

      return {
        id: `map-${i}`,
        title: template.title,
        content: template.content,
        author: `사용자${i}`,
        authorId: `user-${i}`,
        location: {
          type: 'Point' as const,
          coordinates: [location.lng + lngOffset, location.lat + latOffset],
          address: `${location.name} 근처`,
        },
        venue: `${location.name} ${template.category === '식사' ? '맛집' : template.category === '카페' ? '카페' : '모임장소'}`,
        category: template.category,
        tags: template.tags,
        image: Math.random() > 0.5 ? `https://picsum.photos/seed/${i}/400/250` : undefined,
        participants: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, idx) => `participant-${i}-${idx}`),
        maxParticipants: Math.floor(Math.random() * 3) + 3,
        meetingDate: new Date(now + Math.random() * 7 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
        chatRoom: `chat-map-${i}`,
        viewCount: Math.floor(Math.random() * 50) + 1,
        createdAt: new Date(now - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - Math.random() * 12 * 60 * 60 * 1000).toISOString(),
        isLiked: Math.random() > 0.7,
      };
    });
  };

  const [posts, setPosts] = useState<MapPost[]>([]);

  useEffect(() => {
    // 페이지 로드 시 게시글 데이터 생성
    setTimeout(() => {
      setPosts(generateMapPosts());
      setIsLoading(false);
    }, 1000);
  }, []);

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCenter({ lat: latitude, lng: longitude });
        setCurrentLocation("현재 위치");
      });
    }
  };

  // 필터링된 게시글
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = !filters.category || post.category === filters.category;
    const matchesTags = filters.tags.length === 0 || filters.tags.some(tag => post.tags.includes(tag));
    const matchesSearch = !filters.searchQuery || 
      post.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    return matchesCategory && matchesTags && matchesSearch;
  });

  const categories = ["식사", "카페", "쇼핑", "운동", "스터디", "문화생활"];
  const availableTags = [...new Set(posts.flatMap(post => post.tags))];

  const handlePostClick = (post: MapPost) => {
    setSelectedPost(post);
    setCenter({
      lat: post.location.coordinates[1],
      lng: post.location.coordinates[0],
    });
  };

  const handleJoinRequest = (postId: string) => {
    console.log("참여 신청:", postId);
    setSelectedPost(null);
    // TODO: 실제 참여 신청 로직
  };

  const handleTagFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // 커스텀 마커 이미지 생성
  const createMarkerImage = (category: string, isSelected: boolean = false) => {
    const categoryColors: { [key: string]: string } = {
      "식사": "#FF6B6B",
      "카페": "#4ECDC4",
      "쇼핑": "#45B7D1",
      "운동": "#96CEB4",
      "스터디": "#FFEAA7",
      "문화생활": "#DDA0DD",
      "기본": "#E762A9"
    };

    const color = categoryColors[category] || categoryColors["기본"];
    const size = isSelected ? 40 : 30;

    return {
      src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
      `)}`,
      size: { width: size, height: size },
    };
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* 헤더 */}
      <AppHeader />

      {/* 지도 검색 및 필터 */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Box display="flex" gap={1} mb={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="지역이나 모임을 검색해보세요"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#E762A9' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: '#f8f9fa',
              }
            }}
          />
          <IconButton 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            sx={{ 
              bgcolor: isFilterOpen ? '#E762A9' : '#f8f9fa',
              color: isFilterOpen ? 'white' : '#E762A9',
              borderRadius: 2,
              '&:hover': {
                bgcolor: isFilterOpen ? '#D554A0' : '#f1f3f5'
              }
            }}
          >
            <FilterListIcon />
          </IconButton>
          <IconButton 
            onClick={getCurrentLocation}
            sx={{ 
              bgcolor: '#f8f9fa',
              color: '#E762A9',
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#f1f3f5'
              }
            }}
          >
            <MyLocationIcon />
          </IconButton>
        </Box>

        {/* 필터 패널 */}
        <Slide direction="down" in={isFilterOpen} mountOnEnter unmountOnExit>
          <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 3, p: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              카테고리
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    category: prev.category === category ? '' : category 
                  }))}
                  sx={{
                    bgcolor: filters.category === category ? '#E762A9' : 'white',
                    color: filters.category === category ? 'white' : '#666',
                    '&:hover': {
                      bgcolor: filters.category === category ? '#D554A0' : '#f1f3f5',
                    },
                    cursor: 'pointer',
                    borderRadius: 2,
                  }}
                />
              ))}
            </Box>

            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              태그
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {availableTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => handleTagFilter(tag)}
                  sx={{
                    bgcolor: filters.tags.includes(tag) ? '#E762A9' : 'white',
                    color: filters.tags.includes(tag) ? 'white' : '#666',
                    '&:hover': {
                      bgcolor: filters.tags.includes(tag) ? '#D554A0' : '#f1f3f5',
                    },
                    cursor: 'pointer',
                    borderRadius: 2,
                  }}
                />
              ))}
            </Box>
          </Box>
        </Slide>
      </Box>

      {/* 지도 제목 */}
      <Box sx={{ px: 2, py: 1, bgcolor: 'white' }}>
        <Typography variant="h6" fontWeight={600} color="#333">
          {currentLocation} 지역 모임 지도
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {filteredPosts.length}개의 모임을 찾았어요
        </Typography>
      </Box>

      {/* 카카오 지도 */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        {loading || isLoading ? (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            height="100%"
            bgcolor="#f8f9fa"
          >
            <Box textAlign="center">
              <CircularProgress sx={{ color: '#E762A9', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {loading ? "지도를 로드하고 있어요..." : "주변 모임을 찾고 있어요..."}
              </Typography>
            </Box>
          </Box>
        ) : error ? (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            height="100%"
            bgcolor="#f8f9fa"
          >
            <Box textAlign="center">
              <Typography variant="h6" color="error" mb={1}>
                지도를 불러올 수 없어요
              </Typography>
              <Typography variant="body2" color="text.secondary">
                네트워크를 확인하거나 잠시 후 다시 시도해주세요
              </Typography>
            </Box>
          </Box>
        ) : (
          <KakaoMap
            ref={mapRef}
            center={center}
            style={{ width: "100%", height: "100%" }}
            level={4}
            onClick={(_) => {
              setSelectedPost(null);
            }}
          >
            {filteredPosts.map((post) => (
              <MapMarker
                key={post.id}
                position={{
                  lat: post.location.coordinates[1],
                  lng: post.location.coordinates[0],
                }}
                image={createMarkerImage(getCategoryName(post.category), selectedPost?.id === post.id)}
                onClick={() => handlePostClick(post)}
                clickable={true}
              />
            ))}
          </KakaoMap>
        )}

        {/* 선택된 게시글 상세 정보 */}
        <Fade in={!!selectedPost}>
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            {selectedPost && (
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  {selectedPost.image && (
                    <Box
                      component="img"
                      src={Array.isArray(selectedPost.image) ? selectedPost.image[0] : selectedPost.image}
                      sx={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <IconButton
                    onClick={() => setSelectedPost(null)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.7)'
                      }
                    }}
                    size="small"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>

                <Box sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Chip
                      label={getCategoryName(selectedPost.category)}
                      size="small" 
                      sx={{ 
                        bgcolor: '#E762A9',
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20,
                        borderRadius: 2
                      }} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      인원 {selectedPost.participants.length}/{selectedPost.maxParticipants}명
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    {selectedPost.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {selectedPost.content}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <LocationOnIcon sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="caption" color="text.secondary">
                      {selectedPost.location.address} • {selectedPost.venue}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleJoinRequest(selectedPost.id)}
                    sx={{
                      bgcolor: '#E762A9',
                      '&:hover': {
                        bgcolor: '#D554A0'
                      },
                      borderRadius: 2,
                      py: 1
                    }}
                    startIcon={
                      <img 
                        src={logoSvg} 
                        alt="잇플 로고" 
                        style={{ 
                          width: "16px", 
                          height: "16px",
                          filter: "brightness(0) invert(1)"
                        }} 
                      />
                    }
                  >
                    잇플
                  </Button>
                </Box>
              </Card>
            )}
          </Box>
        </Fade>
      </Box>
    </div>
  );
}
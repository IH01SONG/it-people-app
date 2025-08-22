import { useState } from "react";
import { Map as KakaoMap, MapMarker, Circle } from "react-kakao-maps-sdk";
import { 
  TextField, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Slider, 
  Autocomplete, 
  Chip, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  IconButton, 
  Collapse 
} from "@mui/material";
import { FilterList, ExpandLess, ExpandMore } from "@mui/icons-material";

interface Post {
  id: number;
  title: string;
  content: string;
  location: {
    lat: number;
    lng: number;
  };
  author: string;
  createdAt: string;
  hashtags: string[];
  category: string;
}

interface DistrictData {
  name: string;
  lat: number;
  lng: number;
}

interface FilterState {
  hashtags: string[];
  category: string;
  sortBy: 'distance' | 'latest';
}

export default function Map() {
  const [radius, setRadius] = useState<number>(1000);
  const [center, setCenter] = useState({
    lat: 37.566826,
    lng: 126.9786567,
  });
  const [searchDistrict, setSearchDistrict] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    hashtags: [],
    category: '',
    sortBy: 'distance'
  });

  const seoulDistricts: DistrictData[] = [
    { name: "강남구 역삼동", lat: 37.5000, lng: 127.0360 },
    { name: "강남구 신사동", lat: 37.5200, lng: 127.0200 },
    { name: "서초구 서초동", lat: 37.4940, lng: 127.0200 },
    { name: "종로구 종로1가동", lat: 37.5700, lng: 126.9800 },
    { name: "중구 명동", lat: 37.5636, lng: 126.9822 },
    { name: "마포구 홍대입구역", lat: 37.5563, lng: 126.9239 },
  ];

  const mockPosts: Post[] = [
    {
      id: 1,
      title: "맛집 추천!",
      content: "이 근처 정말 맛있는 음식점 발견했어요",
      location: { lat: 37.566826, lng: 126.9786567 },
      author: "맛집헌터",
      createdAt: "2024-01-15",
      hashtags: ["맛집", "한식", "데이트"],
      category: "음식점"
    },
    {
      id: 2,
      title: "카페 추천",
      content: "분위기 좋은 카페 있어요",
      location: { lat: 37.567326, lng: 126.9796567 },
      author: "카페러버",
      createdAt: "2024-01-14",
      hashtags: ["카페", "디저트", "분위기"],
      category: "카페"
    },
    {
      id: 3,
      title: "운동 메이트 구해요",
      content: "같이 운동하실 분 구합니다",
      location: { lat: 37.565826, lng: 126.9776567 },
      author: "헬창",
      createdAt: "2024-01-16",
      hashtags: ["운동", "헬스", "메이트"],
      category: "운동"
    },
  ];

  const availableHashtags = [...new Set(mockPosts.flatMap(post => post.hashtags))];
  const availableCategories = [...new Set(mockPosts.map(post => post.category))];

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
  };

  const filteredPosts = mockPosts.filter((post) => {
    const distance = calculateDistance(
      center.lat,
      center.lng,
      post.location.lat,
      post.location.lng
    );
    
    const inRadius = radius === -1 || distance <= radius;
    
    const matchesHashtags = filters.hashtags.length === 0 || 
      filters.hashtags.some(tag => post.hashtags.includes(tag));
    
    const matchesCategory = !filters.category || post.category === filters.category;
    
    return inRadius && matchesHashtags && matchesCategory;
  });
  
  const sortedPosts = filteredPosts.sort((a, b) => {
    if (filters.sortBy === 'distance') {
      const distanceA = calculateDistance(center.lat, center.lng, a.location.lat, a.location.lng);
      const distanceB = calculateDistance(center.lat, center.lng, b.location.lat, b.location.lng);
      return distanceA - distanceB;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  
  const handleDistrictSelect = (district: DistrictData | null) => {
    if (district) {
      setCenter({ lat: district.lat, lng: district.lng });
    }
  };
  
  const handleHashtagFilter = (hashtag: string) => {
    setFilters(prev => ({
      ...prev,
      hashtags: prev.hashtags.includes(hashtag)
        ? prev.hashtags.filter(tag => tag !== hashtag)
        : [...prev.hashtags, hashtag]
    }));
  };
  
  const getRadiusLabel = (value: number) => {
    if (value === -1) return '전체';
    if (value === 15000) return '전체';
    return `${value / 1000}km`;
  };
  
  console.log('Current radius:', radius, 'Center:', center);
  console.log('Filtered posts:', filteredPosts.map(post => ({
    title: post.title,
    distance: calculateDistance(center.lat, center.lng, post.location.lat, post.location.lng)
  })));

  return (
    <div className="flex flex-col h-screen">
      <Box className="p-4 bg-white shadow-md">
        <div className="flex items-center gap-4 mb-4">
          <Autocomplete
            options={seoulDistricts}
            getOptionLabel={(option) => option.name}
            onChange={(_, value) => handleDistrictSelect(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="행정지역 동 검색"
                variant="outlined"
                size="small"
              />
            )}
            className="flex-1 max-w-xs"
          />
          
          <Box className="flex items-center gap-2 flex-1">
            <Typography variant="body2" className="min-w-max">
              거리 반경:
            </Typography>
            <Slider
              value={radius === -1 ? 15000 : radius}
              onChange={(_, value) => {
                if (value === 15000) {
                  setRadius(-1);
                } else {
                  setRadius(value as number);
                }
              }}
              min={1000}
              max={15000}
              step={null}
              marks={[
                { value: 1000, label: '1km' },
                { value: 5000, label: '5km' },
                { value: 10000, label: '10km' },
                { value: 15000, label: '전체' }
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => value === 15000 ? '전체' : getRadiusLabel(value)}
              className="flex-1 max-w-xs"
            />
          </Box>
        </div>
        
        <div className="flex items-center justify-between">
          <Typography variant="h6">
            지도
          </Typography>
          <IconButton onClick={() => setFilterOpen(!filterOpen)} size="small">
            <FilterList />
            {filterOpen ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>
        
        <Collapse in={filterOpen}>
          <Box className="mt-3 p-3 bg-gray-50 rounded">
            <div className="flex flex-wrap gap-3">
              <FormControl size="small" className="min-w-32">
                <InputLabel>카테고리</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  label="카테고리"
                >
                  <MenuItem value="">전체</MenuItem>
                  {availableCategories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" className="min-w-32">
                <InputLabel>정렬</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as 'distance' | 'latest' }))}
                  label="정렬"
                >
                  <MenuItem value="distance">가까운 순</MenuItem>
                  <MenuItem value="latest">최신 순</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div className="mt-3">
              <Typography variant="body2" className="mb-2">해시태그:</Typography>
              <div className="flex flex-wrap gap-1">
                {availableHashtags.map(hashtag => (
                  <Chip
                    key={hashtag}
                    label={`#${hashtag}`}
                    onClick={() => handleHashtagFilter(hashtag)}
                    color={filters.hashtags.includes(hashtag) ? "primary" : "default"}
                    variant={filters.hashtags.includes(hashtag) ? "filled" : "outlined"}
                    size="small"
                  />
                ))}
              </div>
            </div>
          </Box>
        </Collapse>
      </Box>

      <div className="flex-1">
        <KakaoMap
          center={center}
          style={{ width: "100%", height: "100%" }}
          level={radius === -1 ? 8 : radius <= 1000 ? 4 : radius <= 5000 ? 6 : 7}
          onClick={(_, mouseEvent) => {
            const latlng = mouseEvent.latLng;
            setCenter({
              lat: latlng.getLat(),
              lng: latlng.getLng(),
            });
          }}
        >
          <MapMarker
            position={center}
            image={{
              src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
              size: { width: 24, height: 35 },
            }}
          />
          
          {radius !== -1 && (
            <Circle
              center={center}
              radius={radius}
              strokeWeight={2}
              strokeColor="#FF6B6B"
              strokeOpacity={0.8}
              fillColor="#FF6B6B"
              fillOpacity={0.1}
            />
          )}
        </KakaoMap>
      </div>

      <Box className="p-4 bg-gray-50 max-h-80 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <Typography variant="h6">
            게시물 ({sortedPosts.length}개)
          </Typography>
          <div className="flex gap-1">
            {filters.hashtags.map(tag => (
              <Chip
                key={tag}
                label={`#${tag}`}
                onDelete={() => handleHashtagFilter(tag)}
                size="small"
                color="primary"
              />
            ))}
            {filters.category && (
              <Chip
                label={filters.category}
                onDelete={() => setFilters(prev => ({ ...prev, category: '' }))}
                size="small"
                color="secondary"
              />
            )}
          </div>
        </div>
        
        {sortedPosts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            조건에 맞는 게시물이 없습니다.
          </Typography>
        ) : (
          <div className="space-y-2">
            {sortedPosts.map((post) => {
              const distance = calculateDistance(
                center.lat,
                center.lng,
                post.location.lat,
                post.location.lng
              );
              
              return (
                <Card key={post.id} variant="outlined" className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <Typography variant="subtitle2" className="font-medium">
                        {post.title}
                      </Typography>
                      <Chip label={post.category} size="small" variant="outlined" />
                    </div>
                    
                    <Typography variant="body2" color="text.secondary" className="mb-2">
                      {post.content}
                    </Typography>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.hashtags.map(hashtag => (
                        <Chip
                          key={hashtag}
                          label={`#${hashtag}`}
                          size="small"
                          variant="outlined"
                          onClick={() => handleHashtagFilter(hashtag)}
                          className="cursor-pointer"
                        />
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Typography variant="caption" color="text.secondary">
                        작성자: {post.author}
                      </Typography>
                      <div className="flex gap-2">
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(distance)}m
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {post.createdAt}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Box>
    </div>
  );
}

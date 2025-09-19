import { useState, useEffect, useCallback } from "react";
import {
  Map as KakaoMap,
  MapMarker,
  useKakaoLoader,
} from "react-kakao-maps-sdk";
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  InputAdornment,
  IconButton,
  Slide,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import AppHeader from "../components/AppHeader";
import logoSvg from "../assets/logo.png";
import { usePosts } from "../hooks/usePosts";
import { useLocation as useLocationHook } from "../hooks/useLocation";
import type { Post } from "../types/home.types";
import { api } from "../lib/api";

export default function Map() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // 카카오 맵 SDK 로더
  const [mapLoading, mapError] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_API_KEY || "0c537754f8fad9d1b779befd5d75dc07",
  });

  // 실제 데이터 훅들
  const {
    posts,
    loading: postsLoading,
    loadPosts,
    handleJoinRequest,
    appliedPosts
  } = usePosts();

  const {
    currentLocation: locationName,
    currentCoords,
    getCurrentLocation: getLocation,
    locationLoading,
  } = useLocationHook();

  const [center, setCenter] = useState({
    lat: 37.5502, // 서울 기본값 (현재 위치 로딩 전)
    lng: 126.9235,
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(6);

  const [filters, setFilters] = useState({
    category: "",
    tags: [] as string[],
    searchQuery: "",
  });

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // 실제 Post 데이터를 기반으로 한 필터링된 게시글
  const filteredPosts = posts.filter((post) => {
    // 위치 정보가 있는 게시글만 지도에 표시
    if (!post.location ||
        typeof post.location !== 'object' ||
        !post.location.coordinates ||
        !Array.isArray(post.location.coordinates) ||
        post.location.coordinates.length !== 2) {
      return false;
    }

    const matchesCategory =
      !filters.category || post.category === filters.category;
    const matchesTags =
      filters.tags.length === 0 ||
      filters.tags.some((tag: string) => post.tags.includes(tag));
    const matchesSearch =
      !filters.searchQuery ||
      post.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(filters.searchQuery.toLowerCase());

    return matchesCategory && matchesTags && matchesSearch;
  });

  const availableTags = [...new Set(posts.flatMap((post) => post.tags))];

  // 카테고리 목록 로드
  const loadCategories = useCallback(async () => {
    try {
      const response = await api.posts.getAll({ limit: 100 }); // 많은 게시글을 가져와서 카테고리 추출
      const allPosts = Array.isArray(response) ? response : response.posts || [];
      const uniqueCategories = [...new Set(allPosts.map((post: any) => post.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("카테고리 로드 실패:", error);
      // 기본 카테고리 사용
      setCategories(["자기계발", "봉사활동", "운동/스포츠", "문화/예술", "사교/인맥", "취미", "외국어", "맛집", "반려동물"]);
    }
  }, []);

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback(() => {
    getLocation(); // useLocationHook의 getCurrentLocation 사용
  }, [getLocation]);

  // 위치 정보가 업데이트되면 지도 중심점 업데이트
  useEffect(() => {
    if (currentCoords) {
      setCenter({
        lat: currentCoords.lat,
        lng: currentCoords.lng,
      });
    }
  }, [currentCoords]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadCategories();
    getCurrentLocation();
    // 전체 게시글 로드 (위치 정보가 있는 것들)
    loadPosts(1);
  }, [loadCategories, getCurrentLocation, loadPosts]);

  const handleTagFilter = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // 줄 레벨 제어
  const handleZoomIn = () => {
    if (zoomLevel > 1) {
      setZoomLevel((prev) => prev - 1);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel < 14) {
      setZoomLevel((prev) => prev + 1);
    }
  };

  // 커스텀 마커 이미지 생성
  const createMarkerImage = (category: string, isSelected: boolean = false) => {
    const categoryColors: { [key: string]: string } = {
      식사: "#FF6B6B",
      카페: "#4ECDC4",
      쇼핑: "#45B7D1",
      운동: "#96CEB4",
      스터디: "#FFEAA7",
      문화생활: "#DDA0DD",
      기본: "#E91E63",
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

  if (mapError) {
    console.error("카카오맵 로딩 에러:", mapError);
  }

  return (
    <Box
      sx={{
        bgcolor: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "600px", // Step2와 동일
        margin: "0 auto",
      }}
    >
      <AppHeader />

      {/* 지도 검색 및 필터 */}
      <Box
        sx={{
          p: 3,
          bgcolor: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
          borderBottom: "1px solid #e8ecef",
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 12px rgba(231, 98, 169, 0.08)",
        }}
      >
        <Box display="flex" gap={1} mb={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="지역이나 모임을 검색해보세요"
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#E762A9" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                backgroundColor: "white",
                border: "1px solid #e8ecef",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#E762A9",
                  boxShadow: "0 4px 12px rgba(231, 98, 169, 0.12)",
                  transform: "translateY(-1px)",
                },
                "&.Mui-focused": {
                  borderColor: "#E762A9",
                  boxShadow: "0 4px 16px rgba(231, 98, 169, 0.2)",
                },
              },
            }}
          />
          <IconButton
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            sx={{
              bgcolor: isFilterOpen ? "#E762A9" : "#f8f9fa",
              color: isFilterOpen ? "white" : "#E762A9",
              borderRadius: 2,
              "&:hover": {
                bgcolor: isFilterOpen ? "#D554A0" : "#f1f3f5",
              },
            }}
          >
            <FilterListIcon />
          </IconButton>
          <IconButton
            onClick={getCurrentLocation}
            sx={{
              bgcolor: "white",
              color: "#E762A9",
              borderRadius: 3,
              border: "2px solid #E762A9",
              boxShadow: "0 2px 8px rgba(231, 98, 169, 0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                bgcolor: "#E762A9",
                color: "white",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(231, 98, 169, 0.3)",
              },
            }}
          >
            <MyLocationIcon />
          </IconButton>
        </Box>

        {/* 필터 패널 */}
        <Slide direction="down" in={isFilterOpen} mountOnEnter unmountOnExit>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 4,
              p: 3,
              mb: 3,
              boxShadow: "0 8px 24px rgba(231, 98, 169, 0.12)",
              border: "1px solid rgba(231, 98, 169, 0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              mb={2}
              sx={{
                color: "#333",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <FilterListIcon sx={{ fontSize: 20, color: "#E762A9" }} />
              카테고리 필터
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      category: prev.category === category ? "" : category,
                    }))
                  }
                  sx={{
                    bgcolor:
                      filters.category === category ? "#E762A9" : "white",
                    color: filters.category === category ? "white" : "#666",
                    borderRadius: 3,
                    border:
                      filters.category === category
                        ? "none"
                        : "2px solid #e8ecef",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    height: 36,
                    boxShadow:
                      filters.category === category
                        ? "0 2px 8px rgba(231, 98, 169, 0.3)"
                        : "0 2px 8px rgba(0,0,0,0.06)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor:
                        filters.category === category ? "#D554A0" : "#f8f9fa",
                      transform: "scale(1.05)",
                      boxShadow:
                        filters.category === category
                          ? "0 4px 12px rgba(231, 98, 169, 0.4)"
                          : "0 4px 12px rgba(0,0,0,0.1)",
                    },
                  }}
                />
              ))}
            </Box>

            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              태그
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {availableTags.map((tag: string) => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => handleTagFilter(tag)}
                  sx={{
                    bgcolor: filters.tags.includes(tag) ? "#E762A9" : "white",
                    color: filters.tags.includes(tag) ? "white" : "#666",
                    "&:hover": {
                      bgcolor: filters.tags.includes(tag)
                        ? "#D554A0"
                        : "#f1f3f5",
                    },
                    cursor: "pointer",
                    borderRadius: 2,
                  }}
                />
              ))}
            </Box>
          </Box>
        </Slide>
      </Box>

      {/* 지도 제목 */}
      <Box sx={{ px: 2, py: 1, bgcolor: "white" }}>
        <Typography variant="h6" fontWeight={600} color="#333">
          {locationName} 지역 모임 지도
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            {filteredPosts.length}개의 모임을 찾았어요
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            드래그로 이동 · 마커 제목 확인 · 줌 {zoomLevel}
          </Typography>
        </Box>
      </Box>

      {/* 지도와 게시글 영역을 분할 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "400px",
        }}
      >
        {/* 지도 영역 */}
        <Box
          sx={{
            flex: selectedPost ? (isMobile ? "1" : "1.5") : "1",
            position: "relative",
            minHeight: "300px",
            height: selectedPost ? (isMobile ? "50vh" : "60vh") : "70vh",
            p: 2,
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            borderRadius: 3,
          }}
        >
          {mapLoading || postsLoading ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
              bgcolor="#f8f9fa"
            >
              <Box textAlign="center">
                <CircularProgress sx={{ color: "#E762A9", mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {mapLoading ? '지도를 로드하고 있어요...' : '게시글을 로드하고 있어요...'}
                </Typography>
              </Box>
            </Box>
          ) : mapError ? (
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
                  카카오맵 API 키를 확인해주세요
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  에러: {mapError?.toString()}
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              <KakaoMap
                center={center}
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "300px",
                  borderRadius: "16px",
                  display: "block",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  border: "3px solid white",
                }}
                level={zoomLevel}
                draggable={true}
                scrollwheel={true}
                onClick={() => {
                  // 빈 지도 클릭 시에만 선택 해제
                }}
                onCenterChanged={(map) => {
                  const center = map.getCenter();
                  setCenter({
                    lat: center.getLat(),
                    lng: center.getLng(),
                  });
                }}
                onZoomChanged={(map) => {
                  setZoomLevel(map.getLevel());
                }}
              >
                {filteredPosts.map((post) => {
                  // GeoJSON 좌표 [경도, 위도] → [위도, 경도]로 변환
                  const [lng, lat] = post.location.coordinates;

                  console.log("🎯 마커 렌더링:", {
                    id: post.id,
                    lat: lat,
                    lng: lng,
                    category: post.category,
                    title: post.title,
                    location: post.location,
                  });

                  return (
                    <MapMarker
                      key={post.id}
                      position={{
                        lat: lat,
                        lng: lng,
                      }}
                      image={createMarkerImage(
                        post.category,
                        selectedPost?.id === post.id
                      )}
                      title={post.title}
                      onClick={() => {
                        setSelectedPost(post);
                        setCenter({ lat: lat, lng: lng });
                      }}
                      clickable={true}
                    />
                  );
                })}
              </KakaoMap>

              {/* 줄 레벨 컨트롤 버튼 */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 1000,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <IconButton
                  onClick={handleZoomIn}
                  sx={{
                    bgcolor: "white",
                    color: "#E762A9",
                    boxShadow: "0 4px 12px rgba(231, 98, 169, 0.15)",
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    border: "2px solid rgba(231, 98, 169, 0.1)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: "#E762A9",
                      color: "white",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(231, 98, 169, 0.3)",
                    },
                    "&:disabled": {
                      bgcolor: "#f5f5f5",
                      color: "#ccc",
                    },
                  }}
                  disabled={zoomLevel <= 1}
                >
                  <AddIcon />
                </IconButton>

                <Box
                  sx={{
                    bgcolor: "white",
                    color: "#E762A9",
                    borderRadius: 3,
                    py: 1,
                    px: 1.5,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    textAlign: "center",
                    minWidth: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(231, 98, 169, 0.15)",
                    border: "2px solid rgba(231, 98, 169, 0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {zoomLevel}
                </Box>

                <IconButton
                  onClick={handleZoomOut}
                  sx={{
                    bgcolor: "white",
                    color: "#E762A9",
                    boxShadow: "0 4px 12px rgba(231, 98, 169, 0.15)",
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    border: "2px solid rgba(231, 98, 169, 0.1)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: "#E762A9",
                      color: "white",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(231, 98, 169, 0.3)",
                    },
                    "&:disabled": {
                      bgcolor: "#f5f5f5",
                      color: "#ccc",
                    },
                  }}
                  disabled={zoomLevel >= 14}
                >
                  <RemoveIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Box>

        {/* 게시글 상세 영역 */}
        {selectedPost && (
          <Box
            sx={{
              flex: isMobile ? "0 0 auto" : "1",
              maxHeight: isMobile ? "50vh" : "none",
              bgcolor: "white",
              display: "flex",
              flexDirection: "column",
              borderRadius: "16px",
              m: 2,
              boxShadow: "0 8px 32px rgba(231, 98, 169, 0.15)",
              border: "1px solid rgba(231, 98, 169, 0.1)",
              overflow: "hidden",
            }}
          >
            {/* 헤더 */}
            <Box
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #E762A9 0%, #D554A0 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: "16px 16px 0 0",
                boxShadow: "0 4px 12px rgba(231, 98, 169, 0.3)",
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                모임 상세
              </Typography>
              <IconButton
                onClick={() => setSelectedPost(null)}
                size="small"
                sx={{
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* 콘텐츠 */}
            <Box
              sx={{
                p: 4,
                overflowY: "auto",
                flex: 1,
                background: "linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)",
              }}
            >
              {selectedPost.image && (
                <Box
                  component="img"
                  src={Array.isArray(selectedPost.image) ? selectedPost.image[0] : selectedPost.image}
                  alt={selectedPost.title}
                  sx={{
                    width: "100%",
                    height: isMobile ? 150 : 200,
                    objectFit: "cover",
                    borderRadius: 3,
                    mb: 3,
                  }}
                />
              )}

              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Chip
                  label={selectedPost.category}
                  size="small"
                  sx={{
                    bgcolor: "#E762A9",
                    color: "white",
                    fontSize: "0.8rem",
                    height: 28,
                    borderRadius: 3,
                    fontWeight: 600,
                  }}
                />
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight={500}
                >
                  인원 {selectedPost.participants.length}/
                  {selectedPost.maxParticipants}명
                </Typography>
              </Box>

              <Typography variant="h4" fontWeight={700} mb={3} color="#333">
                {selectedPost.title}
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                mb={4}
                sx={{ lineHeight: 1.7, fontSize: "1rem" }}
              >
                {selectedPost.content}
              </Typography>

              <Box display="flex" alignItems="center" gap={1.5} mb={4}>
                <LocationOnIcon sx={{ fontSize: 22, color: "#E762A9" }} />
                <Box>
                  <Typography
                    variant="body1"
                    color="text.primary"
                    fontWeight={600}
                  >
                    {selectedPost.location?.address || selectedPost.venue || "위치 정보"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPost.venue || "만날 장소"}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => {
                  handleJoinRequest(selectedPost.id);
                }}
                disabled={selectedPost.status === 'full' || selectedPost.status === 'completed'}
                sx={{
                  bgcolor: appliedPosts.has(selectedPost.id) ? "#C2185B" : "#E91E63",
                  color: "white",
                  borderRadius: 3,
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  boxShadow: "0 2px 8px rgba(231, 98, 169, 0.3)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: appliedPosts.has(selectedPost.id) ? "#9C1346" : "#C2185B",
                    boxShadow: "0 4px 12px rgba(231, 98, 169, 0.4)",
                    transform: "scale(1.02)",
                  },
                  "&:disabled": {
                    bgcolor: "#ccc",
                    color: "#666",
                  },
                }}
                startIcon={
                  <img
                    src={logoSvg}
                    alt="잇플 로고"
                    style={{
                      width: "20px",
                      height: "20px",
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                }
              >
                {selectedPost.status === 'full' ? '마감됨' :
                 selectedPost.status === 'completed' ? '종료됨' :
                 appliedPosts.has(selectedPost.id) ? '신청됨' : '잇플'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// MUI 아이콘
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// MUI 컴포넌트
import {
  IconButton,
  Typography,
  Box,
  Modal,
  TextField,
  Chip,
  InputAdornment,
  Card,
  CircularProgress,
  Button
} from "@mui/material";

// React Router
import { useNavigate } from "react-router-dom";

// React
import { useState, useEffect } from "react";

/**
 * SearchModal 컴포넌트 Props 정의
 */
interface SearchModalProps {
  open: boolean; // 모달 열림 상태
  onClose: () => void; // 모달 닫기 콜백
}

import type { Post } from "../types/home.types";

// 오른쪽에서 나타나는 모달 스타일
const rightModalStyle = {
  position: "fixed" as const,
  top: "60px",
  right: "16px",
  bottom: "60px",
  width: "75%",
  maxWidth: "320px",
  bgcolor: "background.paper",
  boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
  borderRadius: "16px",
  p: 0,
  outline: "none",
  transform: "translateX(0)",
  transition: "transform 0.3s ease-in-out",
  overflow: "hidden",
};

/**
 * 검색 모달 컴포넌트
 * 검색어 입력, 최근 검색어, 인기 카테고리, 실시간 검색 결과 기능을 제공
 */
export default function SearchModal({
  open,
  onClose,
}: SearchModalProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // localStorage에서 최근 검색어 로드
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        const parsed = JSON.parse(savedSearches);
        setRecentSearches(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
        setRecentSearches([]);
      }
    }
  }, []);

  // 최근 검색어를 localStorage에 저장
  const saveToRecentSearches = (query: string) => {
    if (!query.trim()) return;
    
    const updatedSearches = [
      query.trim(),
      ...recentSearches.filter(search => search !== query.trim())
    ].slice(0, 8); // 최대 8개까지만 저장
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const trendingTags = [
    "식사", "카페", "쇼핑", "운동", "문화생활", 
    "스터디", "취미", "산책", "영화", "공연"
  ];

  // Home 페이지와 동일한 데이터 생성 함수
  const generateMockPosts = (): Post[] => {
    const now = Date.now();
    const locations = ["홍대입구", "강남", "신촌", "이태원", "명동", "건대입구"];
    
    const postTemplates = [
      {
        title: "저녁 같이 먹을 사람?",
        content: "혼밥 싫어서 같이 드실 분 구해요! 맛있는 피자 같이 먹어요",
        category: "식사",
        expiresAt: now + 2 * 60 * 60 * 1000,
      },
      {
        title: "카페에서 수다떨어요",
        content: "근처 카페에서 커피 마시며 대화해요. 디저트도 같이!",
        category: "카페",
        expiresAt: now + 1 * 60 * 60 * 1000,
      },
      {
        title: "쇼핑 같이 해요",
        content: "쇼핑하면서 구경하실 분! 같이 다녀요",
        category: "쇼핑",
        expiresAt: now + 3 * 60 * 60 * 1000,
      },
      {
        title: "운동 메이트 구해요",
        content: "함께 운동할 분 찾아요! 헬스장이나 런닝 같이해요",
        category: "운동",
        expiresAt: now + 4 * 60 * 60 * 1000,
      },
      {
        title: "스터디 모임",
        content: "공부 같이 할 사람 모집! 조용한 카페에서 각자 공부해요",
        category: "스터디",
        expiresAt: now + 5 * 60 * 60 * 1000,
      },
      {
        title: "영화 보러 갈래요?",
        content: "새로 나온 영화 같이 보실 분! 영화 후 맛집도 가요",
        category: "문화생활",
        expiresAt: now + 3 * 60 * 60 * 1000,
      }
    ];

    return Array.from({ length: 20 }, (_, i) => {
      const template = postTemplates[i % postTemplates.length];
      const location = locations[i % locations.length];
      const createdAt = now - Math.random() * 12 * 60 * 60 * 1000;
      
      return {
        id: `search-${i}`,
        title: template.title,
        content: template.content,
        author: `사용자${i + 1}`,
        authorId: `user-${i + 1}`,
        location: {
          type: 'Point' as const,
          coordinates: [126.978 + (Math.random() - 0.5) * 0.1, 37.5665 + (Math.random() - 0.5) * 0.1] as [number, number],
          address: `${location} 근처`
        },
        venue: `${location} ${template.category === '식사' ? '맛집' : template.category === '카페' ? '카페' : template.category === '쇼핑' ? '쇼핑몰' : '모임장소'}`,
        category: template.category,
        tags: [template.category, '모임'],
        image: Math.random() > 0.5 ? `https://picsum.photos/seed/${template.category}${i}/400/250` : undefined,
        participants: [`user-${i + 1}`],
        maxParticipants: Math.floor(Math.random() * 3) + 4,
        status: 'active' as const,
        viewCount: Math.floor(Math.random() * 100),
        createdAt: new Date(createdAt).toISOString(),
        updatedAt: new Date(createdAt).toISOString(),
        isLiked: false,
      };
    });
  };

  // 검색 실행
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    
    // 검색어를 최근 검색어에 저장
    saveToRecentSearches(query);

    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const allPosts = generateMockPosts();
      const results = allPosts.filter(post => 
        post.title.toLowerCase().includes(lowerQuery) ||
        post.category.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery) ||
        post.location.address?.toLowerCase().includes(lowerQuery) ||
        post.venue?.toLowerCase().includes(lowerQuery)
      );
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  // 검색어 변경 시 자동 검색
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      performSearch(value);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  // 엔터 키 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      saveToRecentSearches(searchQuery);
      navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };

  // 검색 아이콘 클릭
  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      saveToRecentSearches(searchQuery);
      navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };

  // 뒤로가기 버튼 클릭
  const handleBackClick = () => {
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // 태그/최근 검색어 클릭
  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    performSearch(tag);
  };

  // 검색 결과 클릭 시 SearchResults 페이지로 이동
  const handleResultClick = () => {
    if (searchQuery.trim()) {
      saveToRecentSearches(searchQuery);
      navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
      setShowResults(false);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ zIndex: 1300 }}
    >
      <Box sx={rightModalStyle}>
        {/* Header with back button */}
        <Box
          sx={{ 
            bgcolor: '#E762A9', 
            color: 'white', 
            p: 2, 
            display: 'flex', 
            alignItems: 'center',
            borderRadius: "16px 16px 0 0"
          }}
        >
          {showResults && (
            <IconButton 
              onClick={handleBackClick} 
              sx={{ color: 'white', mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1, 
              textAlign: showResults ? 'left' : 'center',
              mr: showResults ? 0 : 4,
              fontWeight: 600
            }}
          >
            {showResults ? "검색 결과" : "검색"}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box p={3} sx={{ height: "100%", overflowY: "auto" }}>
          {/* 검색 입력 */}
          <TextField
            fullWidth
            placeholder="모임 이름, 지역, 카테고리 검색"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton 
                    onClick={handleSearchClick}
                    size="small"
                    sx={{ 
                      color: searchQuery.trim() ? '#E762A9' : '#666',
                      p: 0.5,
                      '&:hover': {
                        backgroundColor: searchQuery.trim() ? 'rgba(231, 98, 169, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                    disabled={!searchQuery.trim()}
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* 검색 결과 표시 */}
          {showResults && (
            <Box mb={3}>
              <Typography variant="subtitle2" fontWeight={600} mb={2}>
                검색 결과 {isSearching ? "" : `(${searchResults.length}개)`}
              </Typography>
              
              {isSearching ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} sx={{ color: '#E762A9' }} />
                </Box>
              ) : searchResults.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {searchResults.map((post) => (
                    <Card
                      key={post.id}
                      onClick={handleResultClick}
                      sx={{
                        p: 2,
                        mb: 2,
                        cursor: 'pointer',
                        borderRadius: 3,
                        border: '1px solid #f0f0f0',
                        '&:hover': {
                          bgcolor: '#f9f9f9',
                          borderColor: '#E762A9',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(231, 98, 169, 0.15)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Typography variant="body1" fontWeight={600} mb={1}>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {post.content.substring(0, 60)}...
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Chip 
                          label={post.category} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.7rem', 
                            height: 20,
                            bgcolor: '#E762A9',
                            color: 'white',
                            borderRadius: 2
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          인원 {post.participants}/{post.maxParticipants}명
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        위치: {post.location.address || `${post.location.coordinates[1].toFixed(3)}, ${post.location.coordinates[0].toFixed(3)}`}
                      </Typography>
                    </Card>
                  ))}
                  <Button 
                    fullWidth 
                    variant="contained" 
                    sx={{ 
                      mt: 2,
                      bgcolor: '#E762A9',
                      '&:hover': {
                        bgcolor: '#D554A0'
                      }
                    }}
                    onClick={handleResultClick}
                  >
                    모든 결과 보기
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  검색 결과가 없습니다.
                </Typography>
              )}
            </Box>
          )}

          {/* 최근 검색어 */}
          {!showResults && (
            <Box mb={3}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <HistoryIcon sx={{ color: '#666', fontSize: 18 }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  최근 검색어
                </Typography>
              </Box>
              {recentSearches.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {recentSearches.map((search, index) => (
                    <Chip
                      key={index}
                      label={search}
                      size="small"
                      onClick={() => handleTagClick(search)}
                      sx={{ 
                        cursor: "pointer",
                        bgcolor: '#f5f5f5',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: '#e0e0e0',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  아직 검색한 내역이 없어요
                </Typography>
              )}
            </Box>
          )}

          {/* 인기 태그 */}
          {!showResults && (
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TrendingUpIcon sx={{ color: '#666', fontSize: 18 }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  인기 태그
                </Typography>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {trendingTags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    onClick={() => handleTagClick(tag)}
                    sx={{
                      cursor: "pointer",
                      bgcolor: "#E762A9",
                      color: "#fff",
                      "&:hover": {
                        bgcolor: "#D554A0",
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
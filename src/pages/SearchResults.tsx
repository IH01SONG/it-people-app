import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  IconButton, 
  Card,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  Stack,
  Container
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { Post } from '../types/home.types';

// 로고 이미지
import logoSvg from "../assets/logo.png";

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('전체');

  const filters = ['전체', '식사', '카페', '쇼핑', '운동', '문화생활', '스터디'];

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

    return Array.from({ length: 30 }, (_, i) => {
      const template = postTemplates[i % postTemplates.length];
      const location = locations[i % locations.length];
      const createdAt = now - Math.random() * 12 * 60 * 60 * 1000;
      
      return {
        id: `search-result-${i}`,
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
        image: Math.random() > 0.4 ? `https://picsum.photos/seed/${template.category}${i}/400/300` : undefined,
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
  const performSearch = (searchTerm: string, filter: string = selectedFilter) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const lowerQuery = searchTerm.toLowerCase();
      const allPosts = generateMockPosts();
      let results = allPosts.filter(post => 
        post.title.toLowerCase().includes(lowerQuery) ||
        post.category.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery) ||
        post.location.address?.toLowerCase().includes(lowerQuery) ||
        post.venue?.toLowerCase().includes(lowerQuery)
      );

      // 필터 적용
      if (filter !== '전체') {
        results = results.filter(post => post.category === filter);
      }

      setSearchResults(results);
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchParams({ q: value });
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch(searchQuery);
    }
  };

  const handleFilterClick = (filter: string) => {
    setSelectedFilter(filter);
    performSearch(searchQuery, filter);
  };

  const handleJoinRequest = (postId: string) => {
    console.log("참여 신청:", postId);
  };

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header matching My page style */}
      <Box sx={{ 
        bgcolor: '#E762A9', 
        color: 'white', 
        p: 2.5, 
        display: 'flex', 
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(231, 98, 169, 0.3)'
      }}>
        <IconButton onClick={handleBack} sx={{ color: 'white' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1, 
            textAlign: 'center', 
            mr: 4,
            fontWeight: 700
          }}
        >
          검색 결과
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ px: 3, py: 3 }}>
        {/* Search Input */}
        <TextField
          fullWidth
          placeholder="모임 이름, 지역, 카테고리 검색"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleSearchSubmit}
          sx={{ 
            mb: 4,
            bgcolor: 'white',
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              },
              '&.Mui-focused': {
                boxShadow: '0 4px 16px rgba(231, 98, 169, 0.2)',
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#E762A9' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Filters */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <FilterListIcon sx={{ color: '#E762A9', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700} color="#333">
              카테고리
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1 }}>
            {filters.map((filter) => (
              <Chip
                key={filter}
                label={filter}
                onClick={() => handleFilterClick(filter)}
                sx={{
                  cursor: "pointer",
                  bgcolor: selectedFilter === filter ? "#E762A9" : "white",
                  color: selectedFilter === filter ? "white" : "#666",
                  borderRadius: 3,
                  fontWeight: 600,
                  boxShadow: selectedFilter === filter 
                    ? '0 4px 12px rgba(231, 98, 169, 0.3)' 
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  "&:hover": {
                    bgcolor: selectedFilter === filter ? "#D554A0" : "#f8f9fa",
                    transform: 'translateY(-1px)',
                    boxShadow: selectedFilter === filter 
                      ? '0 6px 16px rgba(231, 98, 169, 0.4)' 
                      : '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  transition: 'all 0.2s ease',
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap'
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Search Results Header */}
        <Box mb={3}>
          <Typography variant="h5" fontWeight={700} color="#333" mb={1}>
            '{query}' 검색 결과
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontSize: '1rem' }}>
            {isLoading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} sx={{ color: '#E762A9' }} />
                검색 중...
              </Box>
            ) : (
              `총 ${searchResults.length}개의 모임을 찾았어요 ✨`
            )}
          </Typography>
        </Box>

        {/* Loading */}
        {isLoading && (
          <Box display="flex" flexDirection="column" alignItems="center" py={6}>
            <CircularProgress sx={{ color: '#E762A9', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              모임을 찾고 있어요...
            </Typography>
          </Box>
        )}

        {/* Search Results */}
        {!isLoading && (
          <Box>
            {searchResults.length > 0 ? (
              <Stack spacing={3}>
                {searchResults.map((post) => (
                  <Card
                    key={post.id}
                    sx={{
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(231, 98, 169, 0.08)',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(231, 98, 169, 0.15)',
                        transform: 'translateY(-4px)',
                        borderColor: 'rgba(231, 98, 169, 0.2)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {post.image && (
                      <Box
                        component="img"
                        src={post.image}
                        alt={post.title}
                        sx={{
                          width: '100%',
                          height: 180,
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <Box p={3}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Chip
                          label={post.category}
                          size="small"
                          sx={{
                            bgcolor: '#E762A9',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            height: 24,
                            borderRadius: 3
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          인원 {post.participants}/{post.maxParticipants}명
                        </Typography>
                      </Box>
                      
                      <Typography variant="h6" fontWeight={700} mb={1.5} sx={{ color: '#333' }}>
                        {post.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" mb={2} sx={{ lineHeight: 1.6 }}>
                        {post.content}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                          위치: {post.location.address || `${post.location.coordinates[1].toFixed(3)}, ${post.location.coordinates[0].toFixed(3)}`}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                          장소: {post.venue}
                        </Typography>
                      </Box>

                      <Box display="flex" justifyContent="flex-end">
                        <Button
                          onClick={() => handleJoinRequest(post.id)}
                          sx={{
                            bgcolor: "#E91E63",
                            color: "white",
                            borderRadius: 20,
                            px: 2,
                            py: 0.5,
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            minWidth: "auto",
                            "&:hover": {
                              bgcolor: "#C2185B",
                              transform: "scale(1.05)",
                            },
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 8px rgba(233, 30, 99, 0.3)",
                          }}
                          startIcon={
                            <img 
                              src={logoSvg} 
                              alt="잇플 로고" 
                              style={{ 
                                width: "14px", 
                                height: "14px",
                                filter: "brightness(0) invert(1)"
                              }} 
                            />
                          }
                        >
                          잇플
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Box textAlign="center" py={8}>
                <Typography variant="h5" sx={{ color: '#666', fontWeight: 600 }} mb={2}>
                  검색 결과가 없어요 😅
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4} sx={{ lineHeight: 1.6 }}>
                  다른 키워드로 검색해보거나<br />필터를 변경해보세요
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                    setSelectedFilter('전체');
                  }}
                  sx={{
                    borderColor: '#E762A9',
                    color: '#E762A9',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#D554A0',
                      bgcolor: 'rgba(231, 98, 169, 0.06)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  검색 초기화
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
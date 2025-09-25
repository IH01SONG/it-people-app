import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Button
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { Post } from '../types/home.types';
import { api } from '../lib/api';
import PostCard from '../components/PostCard';

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('전체');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const filters = [
    '전체',
    '자기계발',
    '봉사활동',
    '운동/스포츠',
    '문화/예술',
    '사교/인맥',
    '취미',
    '외국어',
    '맛집',
    '반려동물'
  ];

  // 카테고리 한국어명을 백엔드 ObjectId로 매핑 (실제 API 응답에서 확인된 ID 사용)
  const getCategoryId = (koreanName: string): string | undefined => {
    const categoryMap: { [key: string]: string } = {
      '자기계발': '68c3bdd957c06e06e2706f85',
      '봉사활동': '68c3bdd957c06e06e2706f88',
      '운동/스포츠': '68c3bdd957c06e06e2706f8b',
      '문화/예술': '68c3bdd957c06e06e2706f8e',
      '사교/인맥': '68c3bdd957c06e06e2706f87',
      '취미': '68c3bdd957c06e06e2706f89',
      '외국어': '68c3bdd957c06e06e2706f8a',
      '맛집': '68c3bdd957c06e06e2706f9a',
      '반려동물': '68c3bdd957c06e06e2706f8d'
    };
    return categoryMap[koreanName];
  };


  // 검색어에서 카테고리 감지
  const detectCategoryFromQuery = (searchTerm: string): string => {
    const categoryKeywords = {
      '자기계발': ['자기계발', '성장', '개발', '공부', '스터디', '학습'],
      '봉사활동': ['봉사', '나눔', '베풂', '도움', '기부'],
      '운동/스포츠': ['운동', '스포츠', '헬스', '피트니스', '축구', '농구', '테니스', '요가', '필라테스', '런닝', '조깅'],
      '문화/예술': ['문화', '예술', '미술', '음악', '연극', '영화', '전시', '박물관', '콘서트'],
      '사교/인맥': ['사교', '인맥', '모임', '친구', '네트워킹', '만남'],
      '취미': ['취미', '게임', '독서', '사진', '요리', '만들기'],
      '외국어': ['외국어', '영어', '일본어', '중국어', '불어', '독일어', '스페인어', '언어'],
      '맛집': ['맛집', '식사', '음식', '카페', '디저트', '요리', '먹방', '레스토랑'],
      '반려동물': ['반려동물', '강아지', '고양이', '펫', '애완동물']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => searchTerm.includes(keyword))) {
        return category;
      }
    }
    return '전체';
  };

  // 검색 실행
  const performSearch = async (searchTerm: string, filter: string = selectedFilter) => {
    setIsLoading(true);

    // 검색어에서 카테고리 자동 감지
    const detectedCategory = detectCategoryFromQuery(searchTerm);
    if (detectedCategory !== '전체' && filter === '전체') {
      setSelectedFilter(detectedCategory);
      filter = detectedCategory;
    }

    try {
      // 카테고리 ID 매핑
      const categoryId = filter !== '전체' ? getCategoryId(filter) : undefined;

      const response = await api.posts.getAll({
        page: 1,
        limit: 50,
        category: categoryId
      });

      const results = Array.isArray(response) ? response : (response.data || response.posts || []);

      // API 응답 데이터 구조 정규화
      const normalizedResults = results.map((post: any, index: number) => {
        // 카테고리 정규화
        let categoryName = '기타';
        if (typeof post.category === 'object' && post.category !== null) {
          categoryName = post.category.name || post.category._id || '기타';
        } else if (typeof post.category === 'string') {
          categoryName = post.category;
        }

        // 태그 정규화
        let normalizedTags: string[] = [];
        if (Array.isArray(post.tags)) {
          normalizedTags = post.tags.map((tag: any) => {
            if (typeof tag === 'string') return tag;
            if (typeof tag === 'object' && tag?.name) return tag.name;
            return '';
          }).filter(Boolean);
        }

        return {
          ...post,
          id: post.id || post._id || `post-${index}`, // 고유 키 보장
          category: categoryName, // 문자열로 확실히 변환
          tags: normalizedTags, // 태그도 문자열 배열로 정규화
          participants: Array.isArray(post.participants) ? post.participants : [post.participants || 1],
          maxParticipants: post.maxParticipants || post.maxMembers || 5,
          location: {
            coordinates: post.location?.coordinates || [0, 0],
            address: post.location?.address || post.venue || '위치 정보 없음'
          },
          authorId: (typeof post.authorId === 'object' ? post.authorId?._id : post.authorId) || post.author_id || post.userId || 'unknown',
          author: (typeof post.authorId === 'object' ? post.authorId?.nickname : null) || post.authorName || post.nickname || '익명',
          createdAt: post.createdAt || post.created_at || new Date().toISOString()
        };
      });

      // 검색어가 있는 경우 클라이언트 사이드 필터링
      let filteredResults = normalizedResults;
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filteredResults = normalizedResults.filter((post: Post) =>
          post.title?.toLowerCase().includes(searchLower) ||
          post.content?.toLowerCase().includes(searchLower) ||
          post.category?.toLowerCase().includes(searchLower) ||
          post.location?.address?.toLowerCase().includes(searchLower)
        );
      }

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 현재 사용자 정보 로드
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userInfo = await api.getMe();
        setCurrentUserId(userInfo.id || userInfo._id);
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
      }
    };
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const handleBack = () => {
    navigate('/');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchParams({ q: searchQuery });
    }
  };

  const handleFilterClick = (filter: string) => {
    setSelectedFilter(filter);
    // 카테고리 버튼 클릭 시 검색어 입력란 비우기
    setSearchQuery('');
    setSearchParams({});
    performSearch('', filter);
  };


  return (
    <Box
      sx={{
        bgcolor: '#fff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
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

      <Box sx={{ px: 3, py: 3, flex: 1 }}>
        {/* Search Input */}
        <TextField
          fullWidth
          placeholder="모임 이름, 지역, 카테고리 검색"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchSubmit}
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
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            maxHeight: 'none',
            overflowX: 'visible',
            pb: 1
          }}>
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
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Search Results Header */}
        <Box mb={3}>
          <Typography variant="h5" fontWeight={700} color="#333" mb={1}>
            '{query}' 검색 결과
          </Typography>
          {isLoading ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={16} sx={{ color: '#E762A9' }} />
              <Typography variant="body1" sx={{ color: '#666', fontSize: '1rem' }}>
                검색 중...
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ color: '#666', fontSize: '1rem' }}>
              총 {searchResults.length}개의 모임을 찾았어요 ✨
            </Typography>
          )}
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {searchResults.map((post, index) => (
                  <PostCard
                    key={post.id || `search-result-${index}`}
                    post={post}
                  />
                ))}
              </Box>
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
      </Box>
    </Box>
  );
}
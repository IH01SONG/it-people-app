import { useState } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Card, 
  Chip,
  IconButton,
  InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HistoryIcon from "@mui/icons-material/History";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches] = useState([
    "React Hook", "TypeScript", "모바일 최적화", "코드 리뷰"
  ]);

  const trendingTags = [
    "React", "TypeScript", "JavaScript", "Frontend", "Backend", 
    "Mobile", "UI/UX", "성능최적화", "디버깅", "코드리뷰",
    "데이터베이스", "API", "보안", "테스팅"
  ];

  const popularTitles = [
    {
      title: "React Hook 최적화 완벽 가이드",
      category: "Frontend",
      rating: 4.8,
      feedback: 25
    },
    {
      title: "TypeScript 고급 타입 시스템 마스터하기",
      category: "Frontend", 
      rating: 4.6,
      feedback: 18
    },
    {
      title: "모바일 앱 성능 최적화 체크리스트",
      category: "Mobile",
      rating: 4.9,
      feedback: 32
    },
    {
      title: "REST API vs GraphQL 완벽 비교",
      category: "Backend",
      rating: 4.5,
      feedback: 21
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-24 bg-white min-h-screen">
      {/* 상단 헤더 */}
      <div className="py-4 text-center">
        <Typography variant="h6" fontWeight={700} color="#333">
          검색
        </Typography>
      </div>

      {/* 검색 입력 */}
      <TextField
        fullWidth
        placeholder="글 제목, 태그, 카테고리 검색"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ 
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#666' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* 최근 검색어 */}
      {recentSearches.length > 0 && (
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <HistoryIcon sx={{ color: '#666', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={600} color="#333">
              최근 검색어
            </Typography>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {recentSearches.map((search, index) => (
              <Chip
                key={index}
                label={search}
                size="small"
                onClick={() => setSearchQuery(search)}
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: '#f5f5f5',
                  '&:hover': {
                    bgcolor: '#e0e0e0'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* 인기 태그 */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TrendingUpIcon sx={{ color: '#666', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={600} color="#333">
            인기 태그
          </Typography>
        </Box>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {trendingTags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              onClick={() => setSearchQuery(tag)}
              sx={{ 
                cursor: 'pointer',
                bgcolor: '#FFD700',
                color: '#333',
                '&:hover': {
                  bgcolor: '#FFC107'
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 인기 글 제목 */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} color="#333" mb={2}>
          이주의 인기 글 제목
        </Typography>
        <div className="space-y-3">
          {popularTitles.map((item, index) => (
            <Card
              key={index}
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                p: 3,
                border: '1px solid rgba(0,0,0,0.05)',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Box flex={1}>
                  <Typography variant="body1" fontWeight={600} color="#333" mb={1}>
                    {item.title}
                  </Typography>
                  <Chip 
                    label={item.category} 
                    size="small"
                    sx={{
                      bgcolor: '#f0f0f0',
                      color: '#666',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
                <div className="text-xl">#{index + 1}</div>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2" color="#FFD700" fontWeight={600}>
                    ★ {item.rating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    피드백 {item.feedback}개
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  참고하기 →
                </Typography>
              </Box>
            </Card>
          ))}
        </div>
      </Box>

      {/* 검색 결과가 없을 때 */}
      {searchQuery && (
        <Box textAlign="center" py={8}>
          <div className="text-4xl mb-3">🔍</div>
          <Typography variant="h6" color="#333" fontWeight={600} mb={1}>
            "{searchQuery}"에 대한 검색 결과
          </Typography>
          <Typography variant="body2" color="text.secondary">
            관련된 글 제목을 찾을 수 없어요.
            <br />
            새로운 제목을 제출해보시는 건 어떨까요?
          </Typography>
        </Box>
      )}
    </div>
  );
}
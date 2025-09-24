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
import { api } from "../lib/api";

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


  // 검색 실행 (SearchResults 페이지로 이동)
  const performSearch = (query: string) => {
    if (!query.trim()) return;

    // 검색어를 최근 검색어에 저장
    saveToRecentSearches(query);

    // SearchResults 페이지로 이동
    navigate(`/search-results?q=${encodeURIComponent(query)}`);
    onClose();
  };

  // 검색어 변경 시
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // 엔터 키 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  // 검색 아이콘 클릭
  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  // 태그/최근 검색어 클릭
  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    performSearch(tag);
  };

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ zIndex: 1300 }}
    >
      <Box sx={rightModalStyle}>
        {/* Header */}
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
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              textAlign: 'center',
              mr: 4,
              fontWeight: 600
            }}
          >
            검색
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


          {/* 최근 검색어 */}
          {(
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
                      key={`search-${search}-${index}`}
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
          {(
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
                    key={`trending-${tag}-${index}`}
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
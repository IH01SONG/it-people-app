// MUI 아이콘
import CloseIcon from "@mui/icons-material/Close";

// MUI 컴포넌트
import {
  IconButton,
  Typography,
  Box,
  Modal,
  TextField,
  Chip,
} from "@mui/material";

/**
 * SearchModal 컴포넌트 Props 정의
 */
interface SearchModalProps {
  open: boolean; // 모달 열림 상태
  onClose: () => void; // 모달 닫기 콜백
  searchQuery: string; // 현재 검색어
  onSearchChange: (value: string) => void; // 검색어 변경 콜백
  recentSearches: string[]; // 최근 검색어 목록
  trendingTags: string[]; // 인기 카테고리 목록
}

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
 * 검색어 입력, 최근 검색어, 인기 카테고리 기능을 제공
 */
export default function SearchModal({
  open,
  onClose,
  searchQuery,
  onSearchChange,
  recentSearches,
  trendingTags,
}: SearchModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ zIndex: 1300 }}
    >
      <Box sx={rightModalStyle}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={2}
          borderBottom="1px solid #f0f0f0"
          sx={{ borderRadius: "16px 16px 0 0" }}
        >
          <Typography variant="h6" fontWeight={600}>
            검색
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box p={3} sx={{ height: "100%", overflowY: "auto" }}>
          <TextField
            fullWidth
            placeholder="모임 이름, 지역, 카테고리 검색"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              최근 검색어
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {recentSearches.map((search, index) => (
                <Chip
                  key={index}
                  label={search}
                  size="small"
                  onClick={() => onSearchChange(search)}
                  sx={{ cursor: "pointer" }}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              인기 카테고리
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {trendingTags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  onClick={() => onSearchChange(tag)}
                  sx={{
                    cursor: "pointer",
                    bgcolor: "#E91E63",
                    color: "white",
                    "&:hover": {
                      bgcolor: "#C2185B",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
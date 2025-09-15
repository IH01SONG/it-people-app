// MUI 아이콘
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RefreshIcon from "@mui/icons-material/Refresh";

// MUI 컴포넌트
import { IconButton, Card, Typography, Box, Badge } from "@mui/material";

// 타입 정의
import type { Notification } from "../types/home.types";

/**
 * LocationHeader 컴포넌트 Props 정의
 */
interface LocationHeaderProps {
  currentLocation: string; // 현재 선택된 위치
  notifications: Notification[]; // 알림 목록
  locationLoading?: boolean; // 위치 로딩 상태
  onLocationRefresh?: () => void; // 현재 위치 새로고침 콜백
  onSearchOpen: () => void; // 검색 모달 열기 콜백
  onNotificationOpen: () => void; // 알림 모달 열기 콜백
}

/**
 * 위치 헤더 컴포넌트
 * 현재 위치 표시, 위치 변경, 검색, 알림 기능을 제공
 */
export default function LocationHeader({
  currentLocation,
  notifications,
  locationLoading = false,
  onLocationRefresh,
  onSearchOpen,
  onNotificationOpen,
}: LocationHeaderProps) {
  return (
    <Card
      sx={{
        mt: 2,
        mb: 2,
        borderRadius: 3,
        boxShadow: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1,
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <LocationOnIcon color="primary" />
        <Typography fontWeight={700}>내 위치: {currentLocation}</Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        {onLocationRefresh && (
          <IconButton
            onClick={onLocationRefresh}
            disabled={locationLoading}
            size="small"
            sx={{
              color: locationLoading ? "#ccc" : "#E762A9",
              "&:hover": {
                bgcolor: "rgba(231, 98, 169, 0.1)",
              },
            }}
          >
            <RefreshIcon
              sx={{
                animation: locationLoading ? "spin 1s linear infinite" : "none",
                "@keyframes spin": {
                  "0%": {
                    transform: "rotate(0deg)",
                  },
                  "100%": {
                    transform: "rotate(360deg)",
                  },
                },
              }}
            />
          </IconButton>
        )}
        <IconButton onClick={onSearchOpen}>
          <SearchIcon sx={{ color: "#666" }} />
        </IconButton>
        <IconButton onClick={onNotificationOpen}>
          <Badge
            badgeContent={notifications.filter((n) => !n.read).length}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.6rem",
                height: "16px",
                minWidth: "16px",
              },
            }}
          >
            <NotificationsIcon sx={{ color: "#666" }} />
          </Badge>
        </IconButton>
      </Box>
    </Card>
  );
}

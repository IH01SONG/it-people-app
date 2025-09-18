// React Router
import { useNavigate } from "react-router-dom";

// MUI 아이콘
import CloseIcon from "@mui/icons-material/Close";

// MUI 컴포넌트
import {
  IconButton,
  Typography,
  Box,
  Button,
  Modal,
  List,
  ListItem,
} from "@mui/material";

// 타입 정의
import type { Notification } from "../types/home.types";

/**
 * NotificationModal 컴포넌트 Props 정의
 */
interface NotificationModalProps {
  open: boolean; // 모달 열림 상태
  onClose: () => void; // 모달 닫기 콜백
  notifications: Notification[]; // 알림 목록
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
 * 알림 모달 컴포넌트
 * 사용자의 알림 목록을 표시하고 채팅방 이동 기능을 제공
 */
export default function NotificationModal({
  open,
  onClose,
  notifications,
}: NotificationModalProps) {
  const navigate = useNavigate();

  /**
   * 알림 클릭 핸들러
   * 채팅방 ID가 있는 알림을 클릭하면 해당 채팅방으로 이동
   */
  const handleNotificationClick = (notification: Notification) => {
    if (notification.data?.chatRoomId) {
      navigate(`/chat/room/${notification.data.chatRoomId}`);
      onClose();
    }
  };

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
        >
          <Typography variant="h6" fontWeight={600}>
            알림
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  py: 2,
                  px: 3,
                  backgroundColor: notification.read
                    ? "transparent"
                    : "rgba(233, 30, 99, 0.05)",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(233, 30, 99, 0.1)",
                  },
                }}
              >
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="#333"
                    >
                      {notification.title}
                    </Typography>
                    {!notification.read && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "#E91E63",
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {notification.message}
                  </Typography>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                    {notification.data?.chatRoomId && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/chat/room/${notification.data?.chatRoomId}`);
                          onClose();
                        }}
                        sx={{
                          bgcolor: "#E91E63",
                          color: "white",
                          borderRadius: 2,
                          px: 2,
                          py: 0.5,
                          fontSize: "0.75rem",
                          "&:hover": {
                            bgcolor: "#C2185B",
                          },
                        }}
                      >
                        채팅하기
                      </Button>
                    )}
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box p={3} sx={{ borderTop: "1px solid #f0f0f0" }}>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              borderColor: "#E91E63",
              color: "#E91E63",
              "&:hover": {
                borderColor: "#C2185B",
                bgcolor: "rgba(233, 30, 99, 0.04)",
              },
            }}
          >
            모든 알림 읽음 처리
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
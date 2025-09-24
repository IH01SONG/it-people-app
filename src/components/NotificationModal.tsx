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

// API
import { api } from "../lib/api";

/**
 * NotificationModal 컴포넌트 Props 정의
 */
interface NotificationModalProps {
  open: boolean; // 모달 열림 상태
  onClose: () => void; // 모달 닫기 콜백
  notifications: Notification[]; // 알림 목록
  onRefreshNotifications?: () => void; // 알림 새로고침 콜백
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
  onRefreshNotifications,
}: NotificationModalProps) {
  const navigate = useNavigate();

  /**
   * 알림 클릭 핸들러
   * 채팅방 ID가 있는 알림을 클릭하면 해당 채팅방으로 이동
   */
  const handleNotificationClick = async (notification: Notification) => {
    // 읽지 않은 알림인 경우 읽음 처리
    if (!notification.read) {
      try {
        console.log('🔄 알림 읽음 처리 중...', notification.id);
        await api.notifications.markAsRead(notification.id);
        console.log('✅ 알림 읽음 처리 완료:', notification.id);
        // 알림 목록 새로고침
        if (onRefreshNotifications) {
          onRefreshNotifications();
        }
      } catch (error) {
        console.error('❌ 알림 읽음 처리 실패:', error);
        // 개별 알림 읽음 처리 실패는 사용자에게 알리지 않음 (UX 고려)
      }
    }

    if (notification.data?.chatRoomId) {
      navigate(`/chat/room/${notification.data.chatRoomId}`);
      onClose();
    } else if (notification.data?.postId) {
      // 게시글 관련 알림인 경우 해당 게시글로 이동 (구현 필요시)
      console.log('게시글 관련 알림 클릭:', notification.data.postId);
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
          {notifications.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={8}
              px={3}
            >
              <Typography
                variant="h6"
                color="text.secondary"
                mb={1}
                fontWeight={500}
              >
                알림이 없습니다
              </Typography>
              <Typography variant="body2" color="text.secondary">
                새로운 알림이 있으면 여기에 표시됩니다
              </Typography>
            </Box>
          ) : (
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
          )}
        </Box>

        {notifications.length > 0 && (
          <Box p={3} sx={{ borderTop: "1px solid #f0f0f0" }}>
            <Button
            fullWidth
            variant="outlined"
            onClick={async () => {
              const unreadCount = notifications.filter(n => !n.read).length;

              if (unreadCount === 0) {
                console.log('📝 읽지 않은 알림이 없습니다.');
                return;
              }

              try {
                console.log(`🔄 ${unreadCount}개의 읽지 않은 알림을 읽음 처리 중...`);

                // 첫 번째 시도: 모든 알림 일괄 처리
                try {
                  await api.notifications.markAllAsRead();
                  console.log('✅ 모든 알림 읽음 처리 완료');

                  // 알림 목록 새로고침
                  if (onRefreshNotifications) {
                    onRefreshNotifications();
                  }
                  return;
                } catch (batchError) {
                  console.warn('⚠️ 일괄 처리 실패, 개별 처리로 전환:', batchError);

                  // 두 번째 시도: 개별 알림 하나씩 처리
                  const unreadNotifications = notifications.filter(n => !n.read);
                  const errors = [];

                  for (const notification of unreadNotifications) {
                    try {
                      await api.notifications.markAsRead(notification.id);
                      console.log(`✅ 개별 알림 읽음 처리 완료: ${notification.id}`);
                    } catch (individualError) {
                      console.error(`❌ 개별 알림 읽음 처리 실패: ${notification.id}`, individualError);
                      errors.push(individualError);
                    }
                  }

                  if (errors.length === 0) {
                    console.log('✅ 모든 알림 개별 읽음 처리 완료');
                    // 알림 목록 새로고침
                    if (onRefreshNotifications) {
                      onRefreshNotifications();
                    }
                  } else if (errors.length < unreadNotifications.length) {
                    console.log(`⚠️ 일부 알림 읽음 처리 실패 (${errors.length}/${unreadNotifications.length})`);
                    // 부분 성공이므로 새로고침
                    if (onRefreshNotifications) {
                      onRefreshNotifications();
                    }
                    alert(`${unreadNotifications.length - errors.length}개 알림이 읽음 처리되었습니다. (${errors.length}개 실패)`);
                  } else {
                    throw batchError; // 원래 에러 던지기
                  }
                }
              } catch (error) {
                console.error('❌ 모든 알림 읽음 처리 실패:', error);
                alert('알림 읽음 처리에 실패했습니다. 서버 상태를 확인해주세요.');
              }
            }}
            disabled={notifications.filter(n => !n.read).length === 0}
            sx={{
              borderColor: "#E91E63",
              color: "#E91E63",
              "&:hover": {
                borderColor: "#C2185B",
                bgcolor: "rgba(233, 30, 99, 0.04)",
              },
              "&:disabled": {
                borderColor: "#ccc",
                color: "#999",
              },
            }}
          >
            {notifications.filter(n => !n.read).length === 0
              ? "모든 알림이 읽음 처리됨"
              : `모든 알림 읽음 처리 (${notifications.filter(n => !n.read).length}개)`
            }
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
}
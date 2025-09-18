// React hooks
import { useState, useCallback, useEffect } from "react";

// API
import { api } from "../lib/api";

// MUI 아이콘
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// MUI 컴포넌트
import {
  IconButton,
  Card,
  Typography,
  Box,
  Button,
  Collapse,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

// 타입 정의
import type { Activity } from "../types/home.types";

/**
 * MyActivities 컴포넌트 Props 정의
 */
interface MyActivitiesProps {
  activities: Activity[]; // 내 모임 활동 목록
  loading?: boolean; // 로딩 상태
  onEditActivity?: (activityId: string) => void; // 활동 수정 핸들러
  onDeleteActivity?: (activityId: string) => void; // 활동 삭제 핸들러
  onAcceptRequest?: (activityId: string, requestId: string) => void; // 신청 수락 핸들러
  onRejectRequest?: (activityId: string, requestId: string) => void; // 신청 거절 핸들러
}

/**
 * 내 모임 활동 컴포넌트
 * 사용자가 참여하거나 주최하는 모임 활동들을 표시
 */
export default function MyActivities({
  activities,
  loading = false,
  onEditActivity,
  onDeleteActivity,
  onAcceptRequest,
  onRejectRequest
}: MyActivitiesProps) {
  const [expanded, setExpanded] = useState(true); // 확장/축소 상태
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<{[activityId: string]: any[]}>({});
  const [loadingRequests, setLoadingRequests] = useState<{[activityId: string]: boolean}>({});

  // 남은 시간 계산 함수 (24시간 기준)
  const getRemainingTime = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);

    // Invalid Date 체크
    if (isNaN(created.getTime())) {
      return "시간 정보 없음";
    }

    const diffInMs = now.getTime() - created.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours >= 24) {
      return "만료됨";
    }

    const remainingHours = 24 - diffInHours;

    if (remainingHours < 1) {
      const remainingMinutes = Math.floor(remainingHours * 60);
      return `${remainingMinutes}분 남음`;
    } else {
      const hours = Math.floor(remainingHours);
      const minutes = Math.floor((remainingHours - hours) * 60);
      return minutes > 0 ? `${hours}시간 ${minutes}분 남음` : `${hours}시간 남음`;
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, activityId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedActivityId(activityId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedActivityId(null);
  };

  const handleEdit = () => {
    if (selectedActivityId && onEditActivity) {
      onEditActivity(selectedActivityId);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedActivityId && onDeleteActivity) {
      onDeleteActivity(selectedActivityId);
    }
    handleMenuClose();
  };

  // 특정 활동의 참여 요청 목록 로드
  const loadJoinRequests = useCallback(async (activityId: string) => {
    console.log(`🔄 참여 요청 로딩 시작: ${activityId}`);
    setLoadingRequests(prev => ({ ...prev, [activityId]: true }));
    try {
      const requests = await api.joinRequests.getByPost(activityId);
      console.log(`📥 활동 ${activityId}의 참여 요청 응답:`, requests);

      const requestsArray = Array.isArray(requests) ? requests : requests.requests || [];
      console.log(`📋 활동 ${activityId}의 참여 요청 ${requestsArray.length}개`);

      setJoinRequests(prev => ({
        ...prev,
        [activityId]: requestsArray
      }));
    } catch (error) {
      console.error(`❌ 활동 ${activityId}의 참여 요청 로드 실패:`, error);
      setJoinRequests(prev => ({ ...prev, [activityId]: [] }));
    } finally {
      setLoadingRequests(prev => ({ ...prev, [activityId]: false }));
    }
  }, []);

  // 컴포넌트가 확장될 때 주최자인 활동들의 참여 요청 로드
  useEffect(() => {
    if (expanded && activities.length > 0) {
      activities.forEach(activity => {
        if (activity.role === "주최자" && activity.status !== "모집 완료") {
          loadJoinRequests(activity.id);
        }
      });
    }
  }, [expanded, activities, loadJoinRequests]);

  // 신청 수락 핸들러
  const handleAcceptRequest = async (activityId: string, requestId: string) => {
    if (onAcceptRequest) {
      await onAcceptRequest(activityId, requestId);
      // 요청 목록 새로고침
      loadJoinRequests(activityId);
    }
  };

  // 신청 거절 핸들러
  const handleRejectRequest = async (activityId: string, requestId: string) => {
    if (onRejectRequest) {
      await onRejectRequest(activityId, requestId);
      // 요청 목록 새로고침
      loadJoinRequests(activityId);
    }
  };

  // 로딩 중이거나 활동이 없으면 컴포넌트를 렌더링하지 않음
  if (loading || activities.length === 0) {
    return null;
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        mb: 3,
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          p: 2.5,
          cursor: "pointer",
          borderBottom: expanded
            ? "1px solid rgba(0,0,0,0.1)"
            : "none",
          "&:hover": {
            bgcolor: "rgba(0,0,0,0.02)",
          },
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <div className="text-2xl">📋</div>
            <Box>
              <Typography variant="h6" fontWeight={600} color="#333">
                내 모임 활동
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activities.length}개의 모임
              </Typography>
            </Box>
          </Box>
          <IconButton sx={{ transition: "transform 0.3s ease" }}>
            {expanded ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2.5, pt: 0 }}>
          <div className="space-y-3 pt-3">
            {activities.map((item) => (
              <Card
                key={item.id}
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  p: 2,
                  border: "1px solid rgba(0,0,0,0.05)",
                  bgcolor: "rgba(248,249,250,0.5)",
                }}
              >
                <Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={0.5}
                  >
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{item.category}</span>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="#333"
                      >
                        {item.title}
                      </Typography>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          item.role === "주최자"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.role}
                      </span>
                    </Box>
                    {item.role === "주최자" && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, item.id)}
                        sx={{
                          color: "#666",
                          "&:hover": {
                            bgcolor: "rgba(0,0,0,0.08)"
                          }
                        }}
                        data-activity-id={item.id}
                        data-author-id={item.authorId}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    mb={2}
                    flexWrap="wrap"
                  >
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.status === "모집 완료"
                          ? "bg-green-100 text-green-700"
                          : item.status === "대기 중"
                          ? "bg-blue-100 text-blue-700"
                          : item.status === "모집 중"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {item.status}
                    </span>
                    <Typography variant="caption" color="text.secondary">
                      {getRemainingTime(item.createdAt)}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <span className="text-xs text-gray-500">인원</span>
                    <Typography variant="caption" color="text.secondary">
                      {item.members}/{item.maxMembers}명
                    </Typography>
                    {item.role === "주최자" &&
                      item.status !== "모집 완료" &&
                      joinRequests[item.id] &&
                      joinRequests[item.id].length > 0 && (
                        <Typography
                          variant="caption"
                          color="#E91E63"
                          sx={{ ml: 1 }}
                        >
                          • 대기 중인 신청 {joinRequests[item.id].length}명
                        </Typography>
                      )}
                  </Box>

                  {item.role === "주최자" && item.status !== "모집 완료" && (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {/* 참여 요청이 있는 경우 개별 수락/거절 버튼 */}
                      {joinRequests[item.id] && joinRequests[item.id].length > 0 ? (
                        joinRequests[item.id].map((request: any) => (
                          <Box key={request.id || request._id} display="flex" gap={0.5} mb={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary" sx={{ minWidth: '80px' }}>
                              {request.user?.nickname || request.user?.name || request.user?.email || '사용자'}:
                            </Typography>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleAcceptRequest(item.id, request.id || request._id)}
                              sx={{
                                fontSize: "0.6rem",
                                py: 0.3,
                                px: 1,
                                bgcolor: "#4CAF50",
                                "&:hover": {
                                  bgcolor: "#45a049",
                                },
                              }}
                            >
                              수락
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleRejectRequest(item.id, request.id || request._id)}
                              sx={{
                                fontSize: "0.6rem",
                                py: 0.3,
                                px: 1,
                                borderColor: "#f44336",
                                color: "#f44336",
                                "&:hover": {
                                  borderColor: "#d32f2f",
                                  bgcolor: "rgba(244, 67, 54, 0.04)",
                                },
                              }}
                            >
                              거절
                            </Button>
                          </Box>
                        ))
                      ) : (
                        /* 참여 요청이 없는 경우 대기 상태 표시 */
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {loadingRequests[item.id] ? "신청 현황 로딩 중..." : "현재 참여 신청이 없습니다"}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {item.role === "참여자" && (
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "0.7rem",
                          py: 0.5,
                          px: 1.5,
                          borderColor: "#f44336",
                          color: "#f44336",
                          "&:hover": {
                            borderColor: "#d32f2f",
                            bgcolor: "rgba(244, 67, 54, 0.04)",
                          },
                        }}
                      >
                        참여 취소
                      </Button>
                    </Box>
                  )}
                </Box>
              </Card>
            ))}
          </div>
        </Box>
      </Collapse>

      {/* 더보기 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 120,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>수정</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: '#f44336' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#f44336' }} />
          </ListItemIcon>
          <ListItemText>삭제</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
}
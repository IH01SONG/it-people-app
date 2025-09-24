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

// 카테고리 유틸
import { getCategoryDisplay } from "../utils/hardcodedCategories";

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
  onCancelParticipation?: (activityId: string) => void; // 참여 취소 핸들러
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
  onRejectRequest,
  onCancelParticipation
}: MyActivitiesProps) {
  const [expanded, setExpanded] = useState(true); // 확장/축소 상태
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<{[activityId: string]: unknown[]}>({});
  const [loadingRequests, setLoadingRequests] = useState<{[activityId: string]: boolean}>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // 현재 사용자 ID

  // 현재 사용자 정보 로드
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const currentUser = await api.users.getMe();
        const userId = currentUser?._id || currentUser?.id;
        setCurrentUserId(userId);
        console.log('👤 [MyActivities] 현재 사용자 ID 로드:', userId);
      } catch (error) {
        console.error('❌ [MyActivities] 현재 사용자 정보 로드 실패:', error);
      }
    };
    loadCurrentUser();
  }, []);

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

  // 모든 참여 요청을 한 번에 로드하고 활동별로 그룹핑 (다중 호출 최적화)
  const loadAllJoinRequests = useCallback(async () => {
    if (!currentUserId || !expanded || activities.length === 0) return;

    // 주최자인 활동들 찾기
    const hostActivities = activities.filter(activity =>
      activity.role === "주최자" &&
      activity.status !== "모집 완료" &&
      activity.authorId === currentUserId
    );

    if (hostActivities.length === 0) return;

    // 모든 주최자 활동에 대해 로딩 상태 설정
    const loadingState: {[activityId: string]: boolean} = {};
    hostActivities.forEach(activity => {
      loadingState[activity.id] = true;
    });
    setLoadingRequests(prev => ({ ...prev, ...loadingState }));

    try {
      console.log('🔍 [MyActivities] 모든 받은 참여 요청 한 번에 조회 중...');

      // 한 번의 API 호출로 모든 받은 요청 가져오기
      const receivedRequests = await api.joinRequests.getReceived({ status: 'pending', limit: 50 });
      const requests = receivedRequests?.data?.requests || receivedRequests?.requests || [];

      console.log('📋 [MyActivities] 받은 요청 전체 개수:', requests.length);

      // 메모리상에서 활동별로 그룹핑
      const groupedRequests: {[activityId: string]: any[]} = {};

      hostActivities.forEach(activity => {
        groupedRequests[activity.id] = [];
      });

      if (Array.isArray(requests)) {
        requests.forEach((req: any) => {
          const postId = req.post?._id || req.post || req.postId;
          if (postId && Object.prototype.hasOwnProperty.call(groupedRequests, postId) && req.status === 'pending') {
            groupedRequests[postId].push(req);
          }
        });
      }

      // 각 활동별 요청 개수 로그
      Object.entries(groupedRequests).forEach(([activityId, reqs]) => {
        console.log(`✅ [MyActivities] 활동 ${activityId}에 대한 pending 요청 ${reqs.length}개 발견`);
      });

      setJoinRequests(prev => ({ ...prev, ...groupedRequests }));
    } catch (error) {
      console.error('❌ [MyActivities] 모든 참여 요청 로드 실패:', error);
      // 에러 시 모든 활동에 빈 배열 설정
      const emptyRequests: {[activityId: string]: any[]} = {};
      hostActivities.forEach(activity => {
        emptyRequests[activity.id] = [];
      });
      setJoinRequests(prev => ({ ...prev, ...emptyRequests }));
    } finally {
      // 모든 주최자 활동에 대해 로딩 상태 해제
      const loadingState: {[activityId: string]: boolean} = {};
      hostActivities.forEach(activity => {
        loadingState[activity.id] = false;
      });
      setLoadingRequests(prev => ({ ...prev, ...loadingState }));
    }
  }, [currentUserId, expanded, activities]);

  // 컴포넌트가 확장되고 사용자 정보가 로드되면 모든 참여 요청 로드
  useEffect(() => {
    loadAllJoinRequests();
  }, [loadAllJoinRequests]);

  // 신청 수락 핸들러
  const handleAcceptRequest = async (activityId: string, requestId: string) => {
    if (onAcceptRequest) {
      await onAcceptRequest(activityId, requestId);
      // 모든 요청 목록 새로고침 (최적화된 방식)
      loadAllJoinRequests();
    }
  };

  // 신청 거절 핸들러
  const handleRejectRequest = async (activityId: string, requestId: string) => {
    if (onRejectRequest) {
      await onRejectRequest(activityId, requestId);
      // 모든 요청 목록 새로고침 (최적화된 방식)
      loadAllJoinRequests();
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
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        {getCategoryDisplay(item.category)}
                      </span>
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
                        item.status === "pending"
                          ? "bg-orange-100 text-orange-700"
                          : item.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : item.status === "모집 완료"
                          ? "bg-green-100 text-green-700"
                          : item.status === "대기 중"
                          ? "bg-blue-100 text-blue-700"
                          : item.status === "모집 중"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {item.status === "pending" ? "신청 대기중" :
                       item.status === "approved" ? "참여 중" :
                       item.status}
                    </span>
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

                  {item.role === "주최자" &&
                   item.status !== "모집 완료" &&
                   currentUserId &&
                   item.authorId === currentUserId && (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {/* 참여 요청이 있는 경우 개별 수락/거절 버튼 (권한 가드 적용) */}
                      {joinRequests[item.id] && joinRequests[item.id].length > 0 ? (
                        joinRequests[item.id].map((request: any, index: number) => (
                          <Box key={request.id || request._id || `request-${index}`} display="flex" gap={0.5} mb={1} alignItems="center">
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
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          console.log("🎯 [MyActivities UI] 취소 클릭:", {
                            postId: item.id,
                            status: item.status,
                            requestId: item.requestId,
                            title: item.title
                          });
                          if (onCancelParticipation) {
                            onCancelParticipation(item.id);
                          }
                        }}
                        sx={{
                          fontSize: "0.7rem",
                          py: 0.5,
                          px: 1.5,
                          borderColor: item.status === "pending" ? "#ff9800" : "#f44336",
                          color: item.status === "pending" ? "#ff9800" : "#f44336",
                          "&:hover": {
                            borderColor: item.status === "pending" ? "#f57c00" : "#d32f2f",
                            bgcolor: item.status === "pending"
                              ? "rgba(255, 152, 0, 0.04)"
                              : "rgba(244, 67, 54, 0.04)",
                          },
                        }}
                      >
                        {item.status === "pending" ? "참여 신청 취소" : "모임 탈퇴"}
                      </Button>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: "0.6rem",
                          fontStyle: 'italic',
                          textAlign: 'center'
                        }}
                      >
                        {item.status === "pending"
                          ? "신청만 취소됩니다"
                          : "참가자·채팅방에서 제거됩니다"
                        }
                      </Typography>
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
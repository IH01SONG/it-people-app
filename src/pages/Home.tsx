import { useState, useEffect, useCallback } from "react";
import { Typography, Box, CircularProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import LocationHeader from "../components/LocationHeader";
import MyActivities from "../components/MyActivities";
import PostCard from "../components/PostCard";
import SearchModal from "../components/SearchModal";
import NotificationModal from "../components/NotificationModal";
import type { Notification } from "../types/home.types";
import { api } from "../lib/api";
import { useLocation as useLocationHook } from "../hooks/useLocation";
import { useMyActivities } from "../hooks/useMyActivities";
import { usePosts } from "../hooks/usePosts";
import { useBlockUser } from "../contexts/BlockUserContext";
import { useSocket } from "../hooks/useSocket";

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  // 커스텀 훅들 사용
  const {
    currentLocation,
    currentCoordsRef,
    currentLocationRef,
    locationLoading,
    mapLoading,
    mapError,
    getCurrentLocation,
  } = useLocationHook();

  const {
    myActivities,
    activitiesLoading,
    loadMyActivities,
    removeActivitiesByUserName,
    removeActivitiesByAuthorId,
    handleCancelParticipation,
  } = useMyActivities();

  const {
    posts,
    loading,
    hasMore,
    lastPostElementRef,
    loadPosts,
    handleUserBlock: handlePostUserBlock,
    handleDeletePost,
    resetPosts,
  } = usePosts();

  // 차단 사용자 관리
  const { blockUser } = useBlockUser();

  // 실시간 소켓 연결
  const {
    isConnected,
    newNotification,
    clearNewNotification,
    requestNotificationPermission
  } = useSocket();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);



  // 알림 상태
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [, setNotificationLoading] = useState(false);

  // 알림 로드 함수
  const loadNotifications = useCallback(async () => {
    setNotificationLoading(true);
    try {
      const response = await api.notifications.getAll();
      if (response && Array.isArray(response)) {
        setNotifications(response);
      } else if (response && response.notifications) {
        setNotifications(response.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("알림 로드 실패:", error);
      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  }, []);





  // 컴포넌트 마운트 시 알림 로드 (한 번만)
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // 컴포넌트 마운트 시 내 활동 로드
  useEffect(() => {
    loadMyActivities();
  }, [loadMyActivities]);

  // 소켓 연결 후 브라우저 알림 권한 요청
  useEffect(() => {
    if (isConnected) {
      requestNotificationPermission();
    }
  }, [isConnected, requestNotificationPermission]);

  // 새로운 알림 수신 시 알림 목록 업데이트
  useEffect(() => {
    if (newNotification) {
      console.log('🔔 새 알림 수신:', newNotification);

      // 알림 목록 맨 앞에 추가
      setNotifications(prev => [newNotification, ...prev]);

      // 새 알림 상태 클리어
      clearNewNotification();

      // 참여 요청 관련 알림이면 내 활동도 새로고침
      if (newNotification.type === 'join_request') {
        loadMyActivities();
      }
    }
  }, [newNotification, clearNewNotification, loadMyActivities]);


  // 카카오맵 로딩 완료 후 현재 위치 가져오기
  useEffect(() => {
    if (!mapLoading && !mapError) {
      // 위치 로딩 중이 아니면 이미 캐시된 위치가 있는 것
      if (!locationLoading) {
        resetPosts();
        loadPosts(1, currentCoordsRef.current, currentLocationRef.current);
      } else {
        getCurrentLocation().then(() => {
          resetPosts();
          loadPosts(1, currentCoordsRef.current, currentLocationRef.current);
        });
      }
    }
  }, [mapLoading, mapError, locationLoading, getCurrentLocation, resetPosts, loadPosts]);

  // 새 게시글 작성 후 돌아왔을 때 게시글 새로고침
  useEffect(() => {
    const state = location.state as { refreshPosts?: boolean } | null;

    if (state?.refreshPosts) {
      // state 초기화를 위해 replace 사용
      window.history.replaceState({}, document.title);

      // 게시글 새로고침
      resetPosts();
      loadPosts(1, currentCoordsRef.current, currentLocationRef.current);

      // 내 활동도 새로고침
      loadMyActivities();
    }
  }, [location.state, loadPosts, loadMyActivities, resetPosts]);

  // 위치가 변경될 때 게시글 새로고침 로직 제거 (무한 루프 방지)
  // 대신 컴포넌트 마운트 시에만 게시글을 로드


  // 사용자 차단 시 내 활동에서도 제거
  const handleUserBlock = async (userId: string, userName: string) => {
    try {
      // 1. BlockUserContext를 통해 사용자 차단 (API 호출)
      await blockUser(userId, userName);
      
      // 2. 홈에서 차단된 사용자의 게시글 제거 (UI만)
      handlePostUserBlock(userId);
      
      // 3. 내 활동에서 차단된 사용자와 관련된 활동 제거
      removeActivitiesByUserName(userName);
      removeActivitiesByAuthorId(userId);
      
    } catch (error) {
      console.error("❌ 사용자 차단 실패:", error);
      alert("사용자 차단에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleEditPost = (postId: string) => {
    navigate(`/edit/${postId}`);
  };

  // 내 모임 활동 수정
  const handleEditActivity = (activityId: string) => {
    navigate(`/edit/${activityId}`);
  };

  // 내 모임 활동 삭제
  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm("정말로 이 모임을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("로그인이 필요합니다. 다시 로그인해주세요.");
        window.location.href = '/login';
        return;
      }

      // 서버 삭제 시도 (실패해도 클라이언트에서 처리)
      try {
        await api.posts.delete(activityId);
      } catch (error) {
        // 서버 삭제 실패 시 클라이언트에서 영구 숨김 처리
      }

      // 로컬 스토리지에 삭제된 게시글 ID 저장 (영구 숨김)
      const deletedPosts = JSON.parse(localStorage.getItem('deletedPosts') || '[]');
      if (!deletedPosts.includes(activityId)) {
        deletedPosts.push(activityId);
        localStorage.setItem('deletedPosts', JSON.stringify(deletedPosts));
      }

      // UI 새로고침
      loadMyActivities();
      resetPosts();
      loadPosts(1, currentCoordsRef.current, currentLocationRef.current);

      alert("모임이 삭제되었습니다.");

    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 참여 요청 수락
  const handleAcceptRequest = async (activityId: string, requestId: string) => {
    try {
      // 요청 승인
      const response = await api.joinRequests.approve(requestId);

      // 승인 알림 전송 (신청자에게)
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.id) {
          console.log('📢 참여 승인 알림 생성 중...');
          await api.notifications.createRequestAcceptedNotification(requestId, activityId, currentUser.id);
          console.log('✅ 참여 승인 알림 생성 완료');
        }
      } catch (notificationError) {
        console.log('⚠️ 승인 알림 생성 실패 (승인은 성공):', notificationError);
      }

      // 채팅방 자동 생성 및 알림
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.id && response?.chatRoomId) {
          console.log('💬 채팅방 생성 알림 생성 중...');
          await api.notifications.createChatRoomCreatedNotification(activityId, response.chatRoomId, currentUser.id);
          console.log('✅ 채팅방 생성 알림 생성 완료');
        }
      } catch (chatError) {
        console.log('⚠️ 채팅방 알림 생성 실패 (승인은 성공):', chatError);
      }

      // 내 활동 목록 새로고침
      loadMyActivities();

      alert("참여 요청을 수락했습니다.");
    } catch (error: any) {
      console.error("❌ 참여 요청 수락 실패:", error);

      const errorMessage = error?.response?.data?.message;
      let userMessage = "참여 요청 수락에 실패했습니다.";

      if (errorMessage) {
        switch (errorMessage) {
          case "참여 요청을 승인할 권한이 없습니다.":
          case "게시글 작성자만 승인/거절할 수 있습니다":
            userMessage = "본인이 작성한 모임의 요청만 승인할 수 있습니다. 🔒";
            break;
          case "이미 처리된 요청입니다.":
            userMessage = "이미 처리된 요청입니다. 다른 요청을 확인해보세요. ⏰";
            break;
          case "만료된 요청입니다.":
            userMessage = "만료된 요청입니다. 새로운 요청을 기다려보세요. 📅";
            break;
          default:
            userMessage = errorMessage;
        }
      }

      alert(userMessage);
    }
  };

  // 참여 요청 거절
  const handleRejectRequest = async (activityId: string, requestId: string) => {
    try {
      // 요청 거절
      await api.joinRequests.reject(requestId);

      // 거절 알림 전송 (신청자에게)
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.id) {
          console.log('📢 참여 거절 알림 생성 중...');
          await api.notifications.createRequestRejectedNotification(requestId, activityId, currentUser.id);
          console.log('✅ 참여 거절 알림 생성 완료');
        }
      } catch (notificationError) {
        console.log('⚠️ 거절 알림 생성 실패 (거절은 성공):', notificationError);
      }

      // 내 활동 목록 새로고침 (거절된 요청 제거)
      loadMyActivities();

      alert("참여 요청을 거절했습니다.");
    } catch (error: any) {
      console.error("❌ 참여 요청 거절 실패:", error);

      const errorMessage = error?.response?.data?.message;
      let userMessage = "참여 요청 거절에 실패했습니다.";

      if (errorMessage) {
        switch (errorMessage) {
          case "참여 요청을 거절할 권한이 없습니다.":
          case "게시글 작성자만 승인/거절할 수 있습니다":
            userMessage = "본인이 작성한 모임의 요청만 거절할 수 있습니다. 🔒";
            break;
          case "이미 처리된 요청입니다.":
            userMessage = "이미 처리된 요청입니다. 다른 요청을 확인해보세요. ⏰";
            break;
          case "만료된 요청입니다.":
            userMessage = "만료된 요청입니다. 새로운 요청을 기다려보세요. 📅";
            break;
          default:
            userMessage = errorMessage;
        }
      }

      alert(userMessage);
    }
  };

  // 카카오맵 로딩 중이면 로딩 스피너 표시
  if (mapLoading) {
    return (
      <Box
        sx={{
          bgcolor: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          지도를 로딩하고 있습니다...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "600px", // Step2와 동일
        margin: "0 auto",
      }}
    >
      {/* 공통 상단 헤더 */}
      <AppHeader />

      <div className="px-4 pb-24">
        <LocationHeader
          currentLocation={currentLocation}
          notifications={notifications}
          locationLoading={locationLoading}
          isSocketConnected={isConnected}
          onLocationRefresh={() => {
            getCurrentLocation().then(() => {
              // 위치 새로고침과 함께 게시글도 새로고침
              resetPosts();
              loadPosts(1, currentCoordsRef.current, currentLocationRef.current);
            });
          }}
          onSearchOpen={() => setSearchOpen(true)}
          onNotificationOpen={() => setNotificationOpen(true)}
        />

        <MyActivities
          activities={myActivities}
          loading={activitiesLoading}
          onEditActivity={handleEditActivity}
          onDeleteActivity={handleDeleteActivity}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          onCancelParticipation={handleCancelParticipation}
        />

        {/* 내 위치 동네 모임 게시글 목록 */}
        <Box mb={2}>
          <Typography variant="h6" fontWeight={600} color="#333" mb={1}>
            {currentLocation} 동네 모임
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentLocation} 근처에서 함께할 사람들을 찾아보세요
          </Typography>
        </Box>

        <div className="space-y-4">
          {posts.length === 0 && !loading ? (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                color: "text.secondary",
              }}
            >
              <Typography variant="body1" sx={{ mb: 1 }}>
                {currentLocation}에 등록된 모임이 없어요
              </Typography>
              <Typography variant="body2">
                새로운 모임을 만들어보세요!
              </Typography>
            </Box>
          ) : (
            posts.map((post, index) => (
              <div
                key={post.id}
                ref={posts.length === index + 1 ? lastPostElementRef : null}
              >
                <PostCard
                  post={post}
                  onUserBlock={handleUserBlock}
                  onEditPost={handleEditPost}
                  onDeletePost={handleDeletePost}
                />
              </div>
            ))
          )}
        </div>

        {/* 로딩 표시 */}
        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </Box>
        )}

        {/* 더 이상 게시글이 없을 때 */}
        {!hasMore && posts.length > 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              모든 모임을 확인했어요!
            </Typography>
          </Box>
        )}

        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

        <NotificationModal
          open={notificationOpen}
          onClose={() => setNotificationOpen(false)}
          notifications={notifications}
          onRefreshNotifications={loadNotifications}
        />
      </div>
    </Box>
  );
}

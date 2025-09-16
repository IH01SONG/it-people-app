import { useState, useEffect, useCallback } from "react";
import { Typography, Box, CircularProgress } from "@mui/material";
import { useLocation } from "react-router-dom";
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

export default function Home() {
  const location = useLocation();

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
  } = useMyActivities();

  const {
    posts,
    loading,
    hasMore,
    appliedPosts,
    lastPostElementRef,
    loadPosts,
    handleJoinRequest,
    handleUserBlock: handlePostUserBlock,
    handleDeletePost,
    resetPosts,
  } = usePosts();

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
      console.log("🔔 알림 API 응답:", response);
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





  // 컴포넌트 마운트 시 알림 로드
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // 컴포넌트 마운트 시 내 활동 로드
  useEffect(() => {
    loadMyActivities();
  }, [loadMyActivities]);

  // 카카오맵 로딩 완료 후 현재 위치 가져오기
  useEffect(() => {
    console.log("🔍 useEffect 실행:", { mapLoading, mapError, locationLoading });

    if (!mapLoading && !mapError) {
      console.log("✅ 카카오맵 로딩 완료, 위치 확인 시작");

      // 위치 로딩 중이 아니면 이미 캐시된 위치가 있는 것
      if (!locationLoading) {
        console.log("📍 위치 로딩 완료, 바로 게시글 로드");
        resetPosts();
        loadPosts(1, currentCoordsRef.current, currentLocationRef.current);
      } else {
        console.log("⏳ 위치 로딩 중, getCurrentLocation 호출");
        getCurrentLocation().then(() => {
          console.log("✅ getCurrentLocation 완료, 게시글 로드 시작");
          resetPosts();
          loadPosts(1, currentCoordsRef.current, currentLocationRef.current);
        });
      }
    } else {
      console.log("⏸️ 카카오맵 로딩 중 또는 에러:", { mapLoading, mapError });
    }
  }, [mapLoading, mapError, locationLoading, getCurrentLocation, resetPosts, loadPosts]);

  // 새 게시글 작성 후 돌아왔을 때 게시글 새로고침
  useEffect(() => {
    const state = location.state as { refreshPosts?: boolean } | null;
    console.log("🔍 location.state 체크:", state);

    if (state?.refreshPosts) {
      console.log("🔄 새 게시글 작성 후 돌아옴 - 새로고침 시작");

      // state 초기화를 위해 replace 사용
      window.history.replaceState({}, document.title);

      // 게시글 새로고침
      resetPosts();
      console.log("📝 게시글 상태 초기화 완료, loadPosts(1) 호출");
      loadPosts(1, currentCoordsRef.current, currentLocationRef.current);

      // 내 활동도 새로고침
      console.log("🎯 내 활동 새로고침 시작");
      loadMyActivities();
    }
  }, [location.state, loadPosts, loadMyActivities, resetPosts]);

  // 위치가 변경될 때 게시글 새로고침 로직 제거 (무한 루프 방지)
  // 대신 컴포넌트 마운트 시에만 게시글을 로드

  // 참여 신청 시 내 활동 새로고침 추가
  const handleJoinRequestWithRefresh = async (postId: string) => {
    await handleJoinRequest(postId);
    loadMyActivities();
  };

  // 사용자 차단 시 내 활동에서도 제거
  const handleUserBlock = async (userId: string, userName: string) => {
    await handlePostUserBlock(userId);
    removeActivitiesByUserName(userName);
  };

  const handleEditPost = (postId: string) => {
    console.log("게시글 수정:", postId);
    alert("게시글 수정 기능은 준비 중입니다.");
  };

  // 내 모임 활동 수정
  const handleEditActivity = (activityId: string) => {
    console.log("활동 수정:", activityId);
    alert("활동 수정 기능은 준비 중입니다.");
  };

  // 내 모임 활동 삭제
  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm("정말로 이 모임을 삭제하시겠습니까?")) {
      return;
    }

    try {
      console.log("🗑️ 활동 삭제 시작:", activityId);
      await api.posts.delete(activityId);

      console.log("✅ 활동 삭제 성공");

      // 내 활동 목록 새로고침
      loadMyActivities();

      // 게시글 목록도 새로고침 (삭제된 게시글이 있을 수 있음)
      resetPosts();
      loadPosts(1, currentCoordsRef.current, currentLocationRef.current);

      alert("모임이 삭제되었습니다.");
    } catch (error) {
      console.error("❌ 활동 삭제 실패:", error);
      alert("모임 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 참여 요청 수락
  const handleAcceptRequest = async (activityId: string, requestId: string) => {
    try {
      console.log("✅ 참여 요청 수락 시작:", { activityId, requestId });
      await api.joinRequests.accept(requestId);

      console.log("✅ 참여 요청 수락 성공");

      // 내 활동 목록 새로고침
      loadMyActivities();

      alert("참여 요청을 수락했습니다.");
    } catch (error) {
      console.error("❌ 참여 요청 수락 실패:", error);
      alert("참여 요청 수락에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 참여 요청 거절
  const handleRejectRequest = async (activityId: string, requestId: string) => {
    try {
      console.log("❌ 참여 요청 거절 시작:", { activityId, requestId });
      await api.joinRequests.reject(requestId);

      console.log("✅ 참여 요청 거절 성공");

      // 내 활동 목록 새로고침 (거절된 요청 제거)
      loadMyActivities();

      alert("참여 요청을 거절했습니다.");
    } catch (error) {
      console.error("❌ 참여 요청 거절 실패:", error);
      alert("참여 요청 거절에 실패했습니다. 다시 시도해주세요.");
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
                  onJoinRequest={handleJoinRequestWithRefresh}
                  isApplied={appliedPosts.has(post.id)}
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
        />
      </div>
    </Box>
  );
}

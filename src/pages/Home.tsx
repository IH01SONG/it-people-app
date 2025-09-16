import { useState, useEffect, useRef, useCallback } from "react";
import { Typography, Box, CircularProgress } from "@mui/material";
import { useKakaoLoader } from "react-kakao-maps-sdk";
import { useLocation } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import LocationHeader from "../components/LocationHeader";
import MyActivities from "../components/MyActivities";
import PostCard from "../components/PostCard";
import SearchModal from "../components/SearchModal";
import NotificationModal from "../components/NotificationModal";
import type { Post, Notification, Activity } from "../types/home.types";
import { api } from "../lib/api";

export default function Home() {
  const location = useLocation();

  // 카카오맵 SDK 로더
  const [mapLoading, mapError] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_API_KEY || "0c537754f8fad9d1b779befd5d75dc07",
    libraries: ["services"],
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("위치 확인 중...");
  const currentCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const currentLocationRef = useRef<string>("위치 확인 중...");
  const [locationLoading, setLocationLoading] = useState(true);

  // availableLocations는 더 이상 사용하지 않음

  // 백엔드 응답을 프론트엔드 Post 타입으로 변환하는 함수
  const transformBackendPost = (backendPost: any): Post => {
    return {
      id: backendPost._id,
      title: backendPost.title,
      content: backendPost.content,
      author: backendPost.author,
      authorId: typeof backendPost.authorId === 'object' ? backendPost.authorId._id : backendPost.authorId,
      location: backendPost.location,
      venue: backendPost.venue,
      category: backendPost.category?.name || backendPost.category || '기타',
      tags: Array.isArray(backendPost.tags)
        ? backendPost.tags.map((tag: any) => typeof tag === 'object' ? tag.name : tag)
        : [],
      image: backendPost.image,
      participants: backendPost.participants || [],
      maxParticipants: backendPost.maxParticipants,
      meetingDate: backendPost.meetingDate ? new Date(backendPost.meetingDate) : undefined,
      status: backendPost.status,
      chatRoom: backendPost.chatRoom,
      viewCount: backendPost.viewCount || 0,
      createdAt: backendPost.createdAt,
      updatedAt: backendPost.updatedAt,
      isLiked: false
    };
  };

  // getAddressFromCoords 함수는 getCurrentLocation 내부로 이동됨

  // 현재 위치를 가져오는 함수
  const getCurrentLocation = useCallback(async () => {
    console.log("🔄 getCurrentLocation 시작");
    setLocationLoading(true);

    // 카카오맵이 로딩 중이면 대기
    if (mapLoading) {
      console.log("⏳ 카카오맵 로딩 중...");
      setCurrentLocation("지도 로딩 중...");
      setLocationLoading(false);
      return;
    }

    // 카카오맵 로딩 에러가 있으면 기본값 사용
    if (mapError) {
      console.error("❌ 카카오맵 로딩 에러:", mapError);
      setCurrentLocation("홍대입구");
      currentLocationRef.current = "홍대입구";
      setPage(1);
      setPosts([]);
      loadPosts(1);
      setLocationLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      console.error("❌ Geolocation이 지원되지 않습니다.");
      setCurrentLocation("홍대입구");
      currentLocationRef.current = "홍대입구";
      setPage(1);
      setPosts([]);
      loadPosts(1);
      setLocationLoading(false);
      return;
    }

    try {
      console.log("📍 브라우저 위치 정보 요청 중...");
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5분간 캐시
          });
        }
      );

      const { latitude, longitude } = position.coords;
      const coords = { lat: latitude, lng: longitude };
      currentCoordsRef.current = coords;
      console.log("✅ 브라우저 위치 정보 획득:", coords);

      // 주소 변환을 Promise로 래핑하여 완료 후 게시글 로드
      try {
        if (!window.kakao || !window.kakao.maps) {
          console.warn("⚠️ 카카오맵 SDK 미로드, 기본 위치명 사용");
          setCurrentLocation("현재 위치");
          currentLocationRef.current = "현재 위치";
          setPage(1);
          setPosts([]);
          loadPosts(1);
          setLocationLoading(false);
          return;
        }

        console.log("🗺️ 카카오맵 주소 변환 시작...");
        const geocoder = new window.kakao.maps.services.Geocoder();

        // Promise로 래핑하여 주소 변환 완료 후 게시글 로드
        await new Promise<void>((resolve) => {
          geocoder.coord2Address(
            longitude,
            latitude,
            (result: unknown, status: unknown) => {
              let location = "현재 위치";

              if (status === window.kakao.maps.services.Status.OK) {
                if (result && Array.isArray(result) && result[0]) {
                  const region = (result[0] as Record<string, unknown>)
                    .address as Record<string, unknown>;
                  location = region.region_3depth_name as string;

                  if (!location || location.trim() === "") {
                    location = region.region_2depth_name as string;
                  }

                  if (!location || location.trim() === "") {
                    location = "알 수 없는 위치";
                  }
                }
              }

              console.log("🎯 주소 변환 완료:", location);
              setCurrentLocation(location);
              currentLocationRef.current = location;

              // 주소 변환 완료 후 게시글 로드
              setPage(1);
              setPosts([]);
              console.log("🔄 주소 변환 후 게시글 로드 시작");
              loadPosts(1);

              resolve();
            }
          );
        });
      } catch (error) {
        console.error("❌ 주소 변환 실패:", error);
        setCurrentLocation("현재 위치");
        currentLocationRef.current = "현재 위치";
        setPage(1);
        setPosts([]);
        loadPosts(1);
      }
    } catch (error) {
      console.error("❌ 위치 가져오기 실패:", error as Error);
      setCurrentLocation("홍대입구");
      currentLocationRef.current = "홍대입구";
      setPage(1);
      setPosts([]);
      loadPosts(1);
    } finally {
      setLocationLoading(false);
      console.log("✅ getCurrentLocation 완료");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoading, mapError]); // 카카오맵 로딩 상태 의존성 추가

  // 위치 변경 기능 제거 - 더 이상 사용하지 않음

  // 무한 스크롤 상태
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);

  // 신청한 게시글 관리
  const [appliedPosts, setAppliedPosts] = useState<Set<string>>(new Set());

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

  // 내 활동 상태
  const [myActivities, setMyActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // 내 활동 로드 함수
  const loadMyActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      // 내가 쓴 글과 참여한 모임을 병렬로 가져옴
      const [myPostsResponse, joinedPostsResponse] = await Promise.all([
        api.users.getMyPosts(),
        api.users.getJoinedPosts(),
      ]);

      const activities: Activity[] = [];

      // 내가 쓴 글을 활동으로 변환
      console.log("📝 내가 쓴 글 응답:", myPostsResponse);
      const myPosts = myPostsResponse?.posts || myPostsResponse || [];
      if (Array.isArray(myPosts)) {
        myPosts.forEach((post: unknown) => {
          const postData = post as Record<string, unknown>;
          activities.push({
            id: Number(`my-${postData.id as string}`.replace("my-", "")) || 0,
            title: postData.title as string,
            status: postData.status === "active" ? "모집 중" : "완료",
            time: new Date(postData.meetingDate as string).toLocaleString(
              "ko-KR"
            ),
            members: Number((postData.participants as unknown[])?.length || 0),
            maxMembers: postData.maxParticipants as number,
            category: postData.category as string,
            role: "주최자",
            createdAt: postData.createdAt as string,
          });
        });
      }

      // 참여한 모임을 활동으로 변환
      console.log("🤝 참여한 모임 응답:", joinedPostsResponse);
      const joinedPosts = joinedPostsResponse?.posts || joinedPostsResponse || [];
      if (Array.isArray(joinedPosts)) {
        joinedPosts.forEach((post: unknown) => {
          const postData = post as Record<string, unknown>;
          activities.push({
            id:
              Number(
                `joined-${postData.id as string}`.replace("joined-", "")
              ) || 0,
            title: postData.title as string,
            status: postData.status === "active" ? "참여 중" : "완료",
            time: new Date(postData.meetingDate as string).toLocaleString(
              "ko-KR"
            ),
            members: Number((postData.participants as unknown[])?.length || 0),
            maxMembers: postData.maxParticipants as number,
            category: postData.category as string,
            role: "참여자",
            createdAt: postData.createdAt as string,
          });
        });
      }

      // 날짜별로 정렬
      activities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMyActivities(activities);
    } catch (error) {
      console.error("내 활동 로드 실패:", error);
      setMyActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  // 무한 스크롤 로직
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingRef.current) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  /**
   * 게시글 데이터 로드 함수
   * @param pageNum - 로드할 페이지 번호
   */
  const loadPosts = useCallback(
    async (pageNum: number) => {
      if (loadingRef.current) {
        console.log("⏸️ 이미 로딩 중이므로 건너뛰기");
        return;
      }

      console.log("🔄 loadPosts 호출됨:", {
        pageNum,
        currentLocation: currentLocationRef.current,
        coords: currentCoordsRef.current,
        timestamp: new Date().toISOString()
      });

      setLoading(true);
      loadingRef.current = true;

      try {
        // ref를 통해 현재 좌표를 안전하게 참조 (무한 루프 방지)
        const coords = currentCoordsRef.current;
        const location = currentLocationRef.current;

        console.log("📍 API 요청 준비:", { coords, location, hasCoords: !!coords });

        // 현재 좌표가 있으면 주변 게시글을, 없으면 위치명으로 검색
        const response = coords
          ? await api.posts.getNearby(coords.lat, coords.lng, 5000)
          : await api.posts.getAll({
              page: pageNum,
              limit: pageNum === 1 ? 3 : 2,
              location: location,
            });

        console.log("📦 API 응답:", response);

        if (response && response.posts) {
          const backendPosts = response.posts;
          const apiHasMore = response.currentPage < response.totalPages;

          // 백엔드 응답을 프론트엔드 타입으로 변환
          const transformedPosts = backendPosts.map(transformBackendPost);

          console.log("✅ 게시글 로드 성공:", {
            postsCount: transformedPosts.length,
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            hasMore: apiHasMore,
            firstPost: transformedPosts[0]?.title, // 첫 번째 게시글 제목 확인
            allPosts: transformedPosts.map((p: Post) => ({ id: p.id, title: p.title }))
          });

          setPosts((prevPosts) => {
            const newPosts = pageNum === 1 ? transformedPosts : [...prevPosts, ...transformedPosts];
            console.log("📝 게시글 상태 업데이트:", {
              prevCount: prevPosts.length,
              newCount: newPosts.length,
              isFirstPage: pageNum === 1,
              newPostTitles: transformedPosts.map((p: Post) => p.title)
            });
            return newPosts;
          });
          setHasMore(apiHasMore);
        } else {
          console.log("❌ API 응답 실패 또는 데이터 없음", { response });
          // API가 실패한 경우 빈 배열 설정
          if (pageNum === 1) {
            setPosts([]);
            console.log("🗑️ 첫 번째 페이지 로드 실패로 게시글 목록 초기화");
          }
          setHasMore(false);
        }
      } catch (error) {
        console.error("❌ 게시글 로드 실패:", error);
        // API 에러 시 빈 배열 설정
        if (pageNum === 1) {
          setPosts([]);
          console.log("🗑️ 첫 번째 페이지 API 에러로 게시글 목록 초기화");
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        loadingRef.current = false;
        console.log("✅ loadPosts 완료:", { pageNum, timestamp: new Date().toISOString() });
      }
    },
    [] // 모든 의존성 제거하여 무한 루프 방지
  );

  // 게시글 로드는 getCurrentLocation에서 위치 설정 후 실행

  // 무한 스크롤을 위한 페이지 변경 처리
  useEffect(() => {
    if (page > 1) {
      loadPosts(page);
    }
  }, [page, loadPosts]);

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
    if (!mapLoading && !mapError) {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoading, mapError]); // 카카오맵 로딩 상태 변경 시 실행

  // 새 게시글 작성 후 돌아왔을 때 게시글 새로고침
  useEffect(() => {
    const state = location.state as { refreshPosts?: boolean } | null;
    console.log("🔍 location.state 체크:", state);

    if (state?.refreshPosts) {
      console.log("🔄 새 게시글 작성 후 돌아옴 - 새로고침 시작");

      // state 초기화를 위해 replace 사용
      window.history.replaceState({}, document.title);

      // 게시글 새로고침
      setPage(1);
      setPosts([]);
      console.log("📝 게시글 상태 초기화 완료, loadPosts(1) 호출");
      loadPosts(1);

      // 내 활동도 새로고침
      console.log("🎯 내 활동 새로고침 시작");
      loadMyActivities();
    }
  }, [location.state, loadPosts, loadMyActivities]); // 의존성 추가

  // 위치가 변경될 때 게시글 새로고침 로직 제거 (무한 루프 방지)
  // 대신 컴포넌트 마운트 시에만 게시글을 로드

  const handleJoinRequest = async (postId: string) => {
    try {
      const response = await api.joinRequests.create(postId);

      if (response.success) {
        const newAppliedPosts = new Set(appliedPosts);
        newAppliedPosts.add(postId);
        setAppliedPosts(newAppliedPosts);
        console.log("참여 신청 완료:", postId);

        // 참여 신청 후 내 활동 목록 새로고침
        loadMyActivities();
      }
    } catch (error) {
      console.error("참여 신청 실패:", error as Error);
      // 이미 신청한 경우 등의 에러 처리
      if (
        (error as { response?: { status: number } }).response?.status === 409
      ) {
        console.log("이미 신청한 모임입니다.");
      }
    }
  };

  const handleUserBlock = async (userId: string, userName: string) => {
    try {
      const response = await api.users.blockUser(userId);

      if (response.success) {
        console.log("사용자 차단 완료:", userName);
        // 차단된 사용자의 게시글을 목록에서 제거
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post.authorId !== userId)
        );
        // 내 활동에서도 해당 사용자와 관련된 활동 제거
        setMyActivities((prevActivities) =>
          prevActivities.filter(
            (activity) => !activity.title.includes(userName)
          )
        );
      }
    } catch (error) {
      console.error("사용자 차단 실패:", error as Error);
    }
  };

  const handleEditPost = (postId: string) => {
    console.log("게시글 수정:", postId);
    // TODO: 게시글 수정 페이지로 이동
    alert("게시글 수정 기능은 준비 중입니다.");
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      console.log("🗑️ 게시글 삭제 시작:", postId);
      await api.posts.delete(postId);

      console.log("✅ 게시글 삭제 성공");
      // 게시글 목록에서 삭제된 게시글 제거
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      // 내 활동에서도 해당 게시글 제거 (활동 ID는 숫자 형태로 저장됨)
      setMyActivities((prevActivities) =>
        prevActivities.filter((activity) => {
          const activityPostId = activity.id.toString().replace("my-", "");
          return activityPostId !== postId;
        })
      );

      alert("게시글이 삭제되었습니다.");
    } catch (error) {
      console.error("❌ 게시글 삭제 실패:", error);
      alert("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
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
            getCurrentLocation();
            // 위치 새로고침과 함께 게시글도 새로고침
            setPage(1);
            setPosts([]);
          }}
          onSearchOpen={() => setSearchOpen(true)}
          onNotificationOpen={() => setNotificationOpen(true)}
        />

        <MyActivities activities={myActivities} loading={activitiesLoading} />

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
                  onJoinRequest={handleJoinRequest}
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

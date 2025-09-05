import { useState, useEffect, useRef, useCallback } from "react";
import { Typography, Box } from "@mui/material";
import AppHeader from "../components/AppHeader";
import LocationHeader from "../components/LocationHeader";
import MyActivities from "../components/MyActivities";
import PostCard from "../components/PostCard";
import SearchModal from "../components/SearchModal";
import NotificationModal from "../components/NotificationModal";
import type { Post, Notification, Activity } from "../types/home.types";
import { api } from "../utils/api";

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("홍대입구");

  const availableLocations = [
    "홍대입구",
    "강남",
    "신촌",
    "이태원",
    "명동",
    "건대입구",
  ];

  const handleLocationChange = () => {
    const currentIndex = availableLocations.indexOf(currentLocation);
    const nextIndex = (currentIndex + 1) % availableLocations.length;
    setCurrentLocation(availableLocations[nextIndex]);
    // 위치 변경 시 게시글 새로고침
    setPage(1);
    setPosts([]);
  };

  // 무한 스크롤 상태
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);

  // 신청한 게시글 관리
  const [appliedPosts, setAppliedPosts] = useState<Set<string>>(new Set());

  const notifications: Notification[] = [
    {
      id: "1",
      userId: "current-user",
      type: "join_request",
      title: "새로운 모임 신청",
      message: "홍대 피자 모임에 참여 신청이 왔어요",
      data: {
        postId: "post1",
        requestId: "request1",
        chatRoomId: "room1",
      },
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      userId: "current-user",
      type: "request_accepted",
      title: "모임 참여 승인",
      message: "스타벅스 코딩 모임에 참여가 승인되었어요",
      data: {
        postId: "post2",
        chatRoomId: "room2",
      },
      read: false,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
  ];

  const myActivities: Activity[] = [
    {
      id: 1,
      title: "동네 카페 모임",
      status: "참여 중",
      time: "오늘 15:00",
      members: 2,
      maxMembers: 4,
      category: "카페",
      role: "참여자",
      createdAt: "2024-01-15T15:00:00",
    },
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 무한 스크롤 로직
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  /**
   * 게시글 데이터 로드 함수
   * @param pageNum - 로드할 페이지 번호
   */
  const loadPosts = useCallback(
    async (pageNum: number) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoading(true);

      try {
        const response = await api.posts.getAll({
          page: pageNum,
          limit: pageNum === 1 ? 10 : 10,
          location: currentLocation,
        });

        if (response.success && response.data) {
          const { posts: apiPosts, hasMore: apiHasMore } = response.data;
          setPosts((prevPosts) =>
            pageNum === 1 ? apiPosts : [...prevPosts, ...apiPosts]
          );
          setHasMore(apiHasMore);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [currentLocation]
  );

  useEffect(() => {
    loadPosts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, currentLocation]);

  const handleJoinRequest = async (postId: string) => {
    const newAppliedPosts = new Set(appliedPosts);

    if (appliedPosts.has(postId)) {
      newAppliedPosts.delete(postId);
      setAppliedPosts(newAppliedPosts);
      console.log("참여 취소:", postId);
    } else {
      newAppliedPosts.add(postId);
      setAppliedPosts(newAppliedPosts);
      console.log("참여 신청:", postId);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen">
      {/* 공통 상단 헤더 */}
      <AppHeader />

      <div className="px-4 pb-24">
        <LocationHeader
          currentLocation={currentLocation}
          notifications={notifications}
          onLocationChange={handleLocationChange}
          onSearchOpen={() => setSearchOpen(true)}
          onNotificationOpen={() => setNotificationOpen(true)}
        />

        <MyActivities activities={myActivities} />

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
          {posts.length === 0 && !loading && (
            <Box textAlign="center" py={6} color="text.secondary">
              <Typography variant="body1" fontWeight={600} mb={1}>
                아직 작성된 모임이 없어요
              </Typography>
              <Typography variant="body2" mb={2}>
                첫 번째 모임을 만들어보세요!
              </Typography>
            </Box>
          )}
          {posts.map((post, index) => (
            <div
              key={post.id}
              ref={posts.length === index + 1 ? lastPostElementRef : null}
            >
              <PostCard
                post={post}
                onJoinRequest={handleJoinRequest}
                isApplied={appliedPosts.has(post.id)}
              />
            </div>
          ))}
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
    </div>
  );
}

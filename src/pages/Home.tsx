import { useState, useEffect, useRef, useCallback } from "react";
import {
  Typography,
  Box,
} from "@mui/material";
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
  
  const availableLocations = ["홍대입구", "강남", "신촌", "이태원", "명동", "건대입구"];
  
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
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);

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
      if (loading) return; // 이미 로딩 중이면 실행 안함

      setLoading(true);
      
      try {
        // 실제 API 호출 (개발 중에는 목 데이터 사용)
        const response = await api.posts.getAll({
          page: pageNum,
          limit: pageNum === 1 ? 3 : 2,
          location: currentLocation
        });
        
        if (response.success && response.data) {
          const { posts: apiPosts, hasMore: apiHasMore } = response.data;
          setPosts((prevPosts) =>
            pageNum === 1 ? apiPosts : [...prevPosts, ...apiPosts]
          );
          setHasMore(apiHasMore);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.warn('API 호출 실패, 목 데이터 사용:', error);
      }
      
      // API 호출 실패 시 목 데이터 사용
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const now = Date.now();

      // 목 데이터 생성 (첫 페이지는 3개, 나머지는 2개)
      const mockPosts = Array.from(
        { length: Math.min(3, pageNum === 1 ? 3 : 2) },
        (_, i) => {
          // 모임 타입별 템플릿
          const posts = [
            {
              title: "저녁 같이 먹을 사람?",
              content: "혼밥 싫어서 같이 드실 분 구해요! 맛있는 피자 같이 먹어요",
              location: `${currentLocation} 근처`,
              venue: `${currentLocation} 피자집`,
              category: "식사",
              image: `https://picsum.photos/seed/pizza${pageNum}${i}/400/250`,
              expiresAt: now + 2 * 60 * 60 * 1000, // 2시간 후 만료
            },
            {
              title: "카페에서 수다떨어요",
              content: "근처 카페에서 커피 마시며 대화해요. 디저트도 같이!",
              location: `${currentLocation} 동네`,
              venue: `${currentLocation} 카페`,
              category: "카페",
              image: `https://picsum.photos/seed/cafe${pageNum}${i}/400/250`,
              expiresAt: now + 1 * 60 * 60 * 1000, // 1시간 후 만료
            },
            {
              title: "쇼핑 같이 해요",
              content: "쇼핑하면서 구경하실 분! 같이 다녀요",
              location: `${currentLocation} 상권`,
              venue: `${currentLocation} 쇼핑몰`,
              category: "쇼핑",
              image: null, // 일부는 이미지 없이
              expiresAt: now + 3 * 60 * 60 * 1000, // 3시간 후 만료
            },
          ];

          const selectedPost = posts[i] || posts[0];
          const createdAt = now - Math.random() * 12 * 60 * 60 * 1000; // 12시간 이내 랜덤하게 생성

          const participantIds = Array.from(
            { length: Math.floor(Math.random() * 2) + 1 },
            (_, idx) => `user${pageNum}${i}${idx}`
          );
          
          return {
            id: `${pageNum}-${i}`,
            title: selectedPost.title,
            content: selectedPost.content,
            author: `사용자${pageNum}${i}`,
            authorId: `user${pageNum}${i}`,
            location: {
              type: 'Point' as const,
              coordinates: [126.9235 + Math.random() * 0.01, 37.5502 + Math.random() * 0.01], // 홍대 근처
              address: selectedPost.location,
            },
            venue: selectedPost.venue,
            category: selectedPost.category,
            tags: ['혼밥탈출', '새친구', selectedPost.category].filter(Boolean),
            image: selectedPost.image,
            participants: participantIds,
            maxParticipants: Math.floor(Math.random() * 2) + 3, // 3-4명
            meetingDate: new Date(selectedPost.expiresAt),
            status: (selectedPost.expiresAt > now ? 'active' : 'completed') as 'active' | 'full' | 'completed' | 'cancelled',
            chatRoom: `chat-${pageNum}-${i}`,
            viewCount: Math.floor(Math.random() * 50) + 1,
            createdAt: new Date(createdAt).toISOString(),
            updatedAt: new Date(createdAt).toISOString(),
            isLiked: false,
          };
        }
      ).filter((post) => post.status === 'active'); // 활성화된 게시글만 필터링

      // 첫 페이지면 새로 설정, 아니면 기존 데이터에 추가
      setPosts((prevPosts) =>
        pageNum === 1 ? mockPosts : [...prevPosts, ...mockPosts]
      );
      setHasMore(pageNum < 10); // 10페이지까지만 로드 가능
      setLoading(false);
    },
    [loading, currentLocation]
  );

  useEffect(() => {
    loadPosts(page);
  }, [page, loadPosts]);

  const handleJoinRequest = async (postId: string) => {
    try {
      const response = await api.joinRequests.create(postId);
      if (response.success) {
        console.log("참여 신청 성공:", postId);
        // TODO: 성공 알림 표시 또는 UI 업데이트
      }
    } catch (error) {
      console.error("참여 신청 실패:", error);
      // TODO: 에러 알림 표시
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
          {posts.map((post, index) => (
            <div
              key={post.id}
              ref={posts.length === index + 1 ? lastPostElementRef : null}
            >
              <PostCard post={post} onJoinRequest={handleJoinRequest} />
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

        <SearchModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
        />

        <NotificationModal
          open={notificationOpen}
          onClose={() => setNotificationOpen(false)}
          notifications={notifications}
        />
      </div>
    </div>
  );
}

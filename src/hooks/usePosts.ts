import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "../lib/api";
import type { Post } from "../types/home.types";

export function usePosts() {
  // 무한 스크롤 상태
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);

  // 신청한 게시글 관리
  const [appliedPosts, setAppliedPosts] = useState<Set<string>>(new Set());

  // 백엔드 응답을 프론트엔드 Post 타입으로 변환하는 함수
  const transformBackendPost = (backendPost: any): Post => {
    // 작성자 정보 추출 (닉네임 우선, 없으면 이메일)
    let authorName = backendPost.author; // 기본값은 이메일
    if (typeof backendPost.authorId === 'object' && backendPost.authorId?.nickname) {
      authorName = backendPost.authorId.nickname;
    }

    // 카테고리 처리 (현재 백엔드에서 카테고리 필드가 없으므로 임시로 '일반'으로 설정)
    let categoryName = '일반';
    if (backendPost.category) {
      categoryName = backendPost.category?.name || backendPost.category || '일반';
    }

    return {
      id: backendPost._id,
      title: backendPost.title,
      content: backendPost.content,
      author: authorName,
      authorId: typeof backendPost.authorId === 'object' ? backendPost.authorId._id : backendPost.authorId,
      location: backendPost.location,
      venue: backendPost.venue,
      category: categoryName,
      tags: Array.isArray(backendPost.tags)
        ? backendPost.tags.map((tag: any) => typeof tag === 'object' ? tag.name : tag)
        : [],
      image: Array.isArray(backendPost.images) && backendPost.images.length > 0
        ? backendPost.images[0] // 첫 번째 이미지 사용
        : backendPost.image || (Array.isArray(backendPost.image) ? backendPost.image[0] : null),
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
   * @param coords - 현재 좌표
   * @param location - 현재 위치명
   */
  const loadPosts = useCallback(
    async (pageNum: number, coords?: { lat: number; lng: number } | null, location?: string) => {
      if (loadingRef.current) {
        console.log("⏸️ 이미 로딩 중이므로 건너뛰기");
        return;
      }

      console.log("🔄 loadPosts 호출됨:", {
        pageNum,
        location,
        coords,
        timestamp: new Date().toISOString()
      });

      setLoading(true);
      loadingRef.current = true;

      try {
        console.log("📍 API 요청 준비:", { coords, location, hasCoords: !!coords });

        // 현재 좌표가 있으면 주변 게시글을, 없으면 위치명으로 검색
        const response = coords
          ? await api.posts.getNearby(coords.lat, coords.lng, 5000)
          : await api.posts.getAll({
              page: pageNum,
              limit: pageNum === 1 ? 3 : 2,
              location: location,
            });


        // API 응답이 배열인지 객체인지 확인
        let backendPosts: any[] = [];
        let apiHasMore = false;

        if (response) {
          if (Array.isArray(response)) {
            // 응답이 직접 배열인 경우 (nearby API)
            backendPosts = response;
            apiHasMore = false; // nearby API는 페이지네이션이 없음
          } else if (response.posts && Array.isArray(response.posts)) {
            // 응답이 객체이고 posts 배열이 있는 경우 (일반 API)
            backendPosts = response.posts;
            apiHasMore = response.currentPage < response.totalPages;
          }
        }

        if (backendPosts.length > 0) {
          // 로컬에서 삭제된 게시글 ID 목록 가져오기
          const deletedPosts = JSON.parse(localStorage.getItem('deletedPosts') || '[]');

          // 백엔드 응답을 프론트엔드 타입으로 변환
          const transformedPosts = backendPosts
            .filter(post => !deletedPosts.includes(post._id)) // 삭제된 게시글 필터링
            .map(transformBackendPost)
            // 최신순으로 정렬 (createdAt 기준 내림차순)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


          setPosts((prevPosts) => {
            const newPosts = pageNum === 1 ? transformedPosts : [...prevPosts, ...transformedPosts];
            return newPosts;
          });
          setHasMore(apiHasMore);
        } else {
          if (pageNum === 1) {
            setPosts([]);
          }
          setHasMore(false);
        }
      } catch (error) {
        console.error("게시글 로드 실패:", error);
        if (pageNum === 1) {
          setPosts([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    []
  );

  // 무한 스크롤을 위한 페이지 변경 처리
  useEffect(() => {
    if (page > 1) {
      // 현재 위치 정보는 상위 컴포넌트에서 전달받아야 함
      loadPosts(page);
    }
  }, [page]);

  // 게시글 참여 신청
  const handleJoinRequest = async (postId: string) => {
    try {
      const response = await api.joinRequests.create(postId);

      if (response.success) {
        const newAppliedPosts = new Set(appliedPosts);
        newAppliedPosts.add(postId);
        setAppliedPosts(newAppliedPosts);
        console.log("참여 신청 완료:", postId);
      }
    } catch (error) {
      console.error("참여 신청 실패:", error as Error);
      if (
        (error as { response?: { status: number } }).response?.status === 409
      ) {
        console.log("이미 신청한 모임입니다.");
      }
    }
  };

  // 사용자 차단
  const handleUserBlock = async (userId: string) => {
    try {
      const response = await api.users.blockUser(userId);

      if (response.success) {
        console.log("사용자 차단 완료");
        // 차단된 사용자의 게시글을 목록에서 제거
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post.authorId !== userId)
        );
      }
    } catch (error) {
      console.error("사용자 차단 실패:", error as Error);
    }
  };

  // 게시글 삭제
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

      alert("게시글이 삭제되었습니다.");
    } catch (error) {
      console.error("❌ 게시글 삭제 실패:", error);
      alert("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 게시글 목록 초기화
  const resetPosts = useCallback(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
  }, []);

  return {
    posts,
    loading,
    hasMore,
    appliedPosts,
    lastPostElementRef,
    loadPosts,
    handleJoinRequest,
    handleUserBlock,
    handleDeletePost,
    resetPosts,
  };
}
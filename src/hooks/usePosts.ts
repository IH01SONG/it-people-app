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

  // 신청한 게시글 관리 (localStorage에서 초기화)
  const [appliedPosts, setAppliedPosts] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('appliedPosts');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // 백엔드 응답을 프론트엔드 Post 타입으로 변환하는 함수
  const transformBackendPost = (backendPost: any): Post => {
    // 디버그: 이미지 첨부 테스트 게시글의 백엔드 데이터 확인
    if (backendPost.title && backendPost.title.includes("이미지 첨부 테스트")) {
      console.log(`🔍 백엔드 원본 데이터 - "${backendPost.title}":`, {
        image: backendPost.image,
        images: backendPost.images,
        imageType: typeof backendPost.image,
        imagesType: typeof backendPost.images,
        fullData: backendPost
      });
    }
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
        ? backendPost.images // 전체 이미지 배열 사용
        : backendPost.image || null,
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
        return;
      }

      setLoading(true);
      loadingRef.current = true;

      try {

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

  // 컴포넌트 마운트 시 서버와 로컬 상태 동기화
  useEffect(() => {
    const syncParticipationStatus = async () => {
      try {
        const joinedPostsResponse = await api.users.getJoinedPosts();
        const joinedPosts = joinedPostsResponse?.posts || joinedPostsResponse || [];

        if (Array.isArray(joinedPosts)) {
          const serverAppliedPosts = new Set<string>();
          joinedPosts.forEach((post: any) => {
            const postId = post._id || post.id;
            if (postId) {
              serverAppliedPosts.add(postId);
            }
          });

          console.log('🔄 서버 참여 상태 동기화:', {
            serverAppliedPosts: Array.from(serverAppliedPosts),
            localAppliedPosts: Array.from(appliedPosts)
          });

          // 서버 상태로 로컬 상태 업데이트
          setAppliedPosts(serverAppliedPosts);
          localStorage.setItem('appliedPosts', JSON.stringify(Array.from(serverAppliedPosts)));
        }
      } catch (error) {
        console.error('❌ 참여 상태 동기화 실패:', error);
      }
    };

    syncParticipationStatus();
  }, []); // 한 번만 실행

  // 게시글 참여 신청/취소
  const handleJoinRequest = async (postId: string) => {
    const isAlreadyApplied = appliedPosts.has(postId);

    console.log('📋 참여 상태 확인:', {
      postId,
      isAlreadyApplied,
      appliedPostsSize: appliedPosts.size,
      appliedPostsArray: Array.from(appliedPosts)
    });

    if (isAlreadyApplied) {
      // 참여 취소 로직
      console.log('🚀 참여 취소 시작 - postId:', postId);

      // 확인 대화상자
      if (!window.confirm('정말로 참여를 취소하시겠습니까?')) {
        return;
      }

      // 인증 토큰 확인
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      try {
        // 1. 저장된 requestId 확인
        const requestIds = JSON.parse(localStorage.getItem('requestIds') || '{}');
        const requestId = requestIds[postId];

        console.log('🔍 저장된 requestId 확인:', { postId, requestId });

        if (requestId) {
          // 저장된 requestId로 직접 참여 취소
          console.log('🔄 저장된 requestId로 참여 취소 API 호출 중...');
          console.log('🔗 요청 URL:', `/join-requests/${requestId}`);
          await api.joinRequests.cancel(requestId);
          console.log('✅ 참여 취소 성공');

          // requestId 저장소에서 제거
          delete requestIds[postId];
          localStorage.setItem('requestIds', JSON.stringify(requestIds));
          console.log('✅ requestId 저장소에서 제거:', postId);
        } else {
          console.log('⚠️ 저장된 requestId가 없음. 서버에서 조회 시도...');

          // 저장된 requestId가 없으면 서버에서 조회 (기존 로직)
          console.log('🔍 해당 포스트의 참여 요청 목록 조회 중...');
          console.log('🔗 요청 URL:', `/join-requests/posts/${postId}/requests`);
          const allRequests = await api.joinRequests.getByPost(postId);
          console.log('📋 참여 요청 목록 전체:', allRequests);

          // 현재 사용자 정보 가져오기
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const currentUserId = currentUser.id;
          console.log('👤 현재 사용자 ID:', currentUserId);

          if (!currentUserId) {
            console.error('❌ 현재 사용자 ID가 없음');
            alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
            return;
          }

          // 내 참여 요청 찾기
          const myRequest = allRequests.find((req: any) =>
            req.requester === currentUserId ||
            req.requester?._id === currentUserId ||
            req.requesterId === currentUserId
          );

          if (!myRequest) {
            console.error('❌ 참여 요청을 찾을 수 없음');
            alert('참여 요청을 찾을 수 없습니다. 이미 취소되었거나 처리된 요청일 수 있습니다.');
            // 로컬 상태에서는 제거
            const newAppliedPosts = new Set(appliedPosts);
            newAppliedPosts.delete(postId);
            setAppliedPosts(newAppliedPosts);
            localStorage.setItem('appliedPosts', JSON.stringify(Array.from(newAppliedPosts)));

            // 참여 취소한 게시글로 기록
            const cancelledPosts = JSON.parse(localStorage.getItem('cancelledPosts') || '[]');
            if (!cancelledPosts.includes(postId)) {
              cancelledPosts.push(postId);
              localStorage.setItem('cancelledPosts', JSON.stringify(cancelledPosts));
            }
            return;
          }

          const foundRequestId = myRequest._id || myRequest.id;
          console.log('✅ 서버에서 참여 요청 ID 찾음:', foundRequestId);

          // 찾은 requestId로 참여 취소
          console.log('🔄 찾은 requestId로 참여 취소 API 호출 중...');
          await api.joinRequests.cancel(foundRequestId);
          console.log('✅ 참여 취소 성공');
        }

        // 5. 로컬 상태 업데이트
        const newAppliedPosts = new Set(appliedPosts);
        newAppliedPosts.delete(postId);
        setAppliedPosts(newAppliedPosts);
        localStorage.setItem('appliedPosts', JSON.stringify(Array.from(newAppliedPosts)));

        // 6. 참여 취소한 게시글 기록 (내 활동에서 제외하기 위함)
        const cancelledPosts = JSON.parse(localStorage.getItem('cancelledPosts') || '[]');
        if (!cancelledPosts.includes(postId)) {
          cancelledPosts.push(postId);
          localStorage.setItem('cancelledPosts', JSON.stringify(cancelledPosts));
        }

        alert("참여 취소가 완료되었습니다.");

      } catch (error: any) {
        console.error("🚨 참여 취소 실패:", error);
        console.error("🚨 오류 상태 코드:", error?.response?.status);
        console.error("🚨 오류 응답 데이터:", error?.response?.data);

        // 모든 오류를 사용자에게 표시하여 팀원들과 상담할 수 있도록 함
        const statusCode = error?.response?.status;
        const errorData = error?.response?.data;
        let errorMessage = "";

        if (statusCode === 404) {
          errorMessage = `참여 요청 조회 API가 존재하지 않습니다 (404). 백엔드 개발자에게 문의하세요.\n요청 URL: /join-requests/posts/${postId}/requests`;
        } else if (statusCode === 400) {
          errorMessage = "이미 처리된 요청은 취소할 수 없습니다.";
        } else if (statusCode === 403) {
          errorMessage = "참여 취소 권한이 없습니다.";
        } else {
          errorMessage = errorData?.message || `참여 취소에 실패했습니다.\n상태 코드: ${statusCode}\n백엔드 개발자에게 문의하세요.`;
        }

        alert(errorMessage);
      }
    } else {
      // 참여 신청 로직 (기존 코드)
      console.log('🚀 참여 신청 시작 - postId:', postId);

      // 취소된 게시글 목록에서 제거 (재참여 허용)
      const cancelledPosts = JSON.parse(localStorage.getItem('cancelledPosts') || '[]');
      if (cancelledPosts.includes(postId)) {
        const newCancelledPosts = cancelledPosts.filter((id: string) => id !== postId);
        localStorage.setItem('cancelledPosts', JSON.stringify(newCancelledPosts));
        console.log('✅ cancelledPosts에서 제거하여 재참여 허용:', postId);
      }

      // 인증 토큰 확인
      const token = localStorage.getItem('access_token');
      console.log('🔑 토큰 상태:', token ? '존재함' : '없음');

      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      try {
        // API 문서에 명시된 posts.join API 사용
        console.log('🔄 api.posts.join 시도...');
        console.log('🔗 요청 URL:', `/posts/${postId}/join`);
        console.log('📝 예상 HTTP 메소드: POST');
        console.log('📋 api.posts.join 함수 정의 확인:', api.posts.join.toString());

        const response = await api.posts.join(postId);
        console.log('✅ api.posts.join 성공:', response);
        console.log('📊 응답 타입:', typeof response);
        console.log('📋 응답 구조:', Object.keys(response || {}));

        if (response.success || response.message) {
          const newAppliedPosts = new Set(appliedPosts);
          newAppliedPosts.add(postId);
          setAppliedPosts(newAppliedPosts);

          // localStorage에 저장
          localStorage.setItem('appliedPosts', JSON.stringify(Array.from(newAppliedPosts)));

          // requestId 저장 (참여 취소 시 사용)
          if (response.data && response.data.requestId) {
            const requestIds = JSON.parse(localStorage.getItem('requestIds') || '{}');
            requestIds[postId] = response.data.requestId;
            localStorage.setItem('requestIds', JSON.stringify(requestIds));
            console.log('✅ requestId 저장:', { postId, requestId: response.data.requestId });
          }

          // 재신청의 경우 cancelledPosts에서 제거
          const cancelledPosts = JSON.parse(localStorage.getItem('cancelledPosts') || '[]');
          if (cancelledPosts.includes(postId)) {
            const newCancelledPosts = cancelledPosts.filter((id: string) => id !== postId);
            localStorage.setItem('cancelledPosts', JSON.stringify(newCancelledPosts));
            console.log('✅ 재신청으로 인해 cancelledPosts에서 제거:', postId);
          }

          // 참여 신청 알림 생성 시도 (현재 사용자 ID 가져오기)
          try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (currentUser.id) {
              console.log('📢 참여 신청 알림 생성 중...');
              await api.notifications.createJoinRequestNotification(postId, currentUser.id);
              console.log('✅ 참여 신청 알림 생성 완료');
            }
          } catch (notificationError) {
            console.log('⚠️ 알림 생성 실패 (참여 신청은 성공):', notificationError);
            // 알림 생성 실패는 참여 신청 성공에 영향을 주지 않음
          }

          alert("참여 신청이 완료되었습니다! 모임장에게 알림이 전송되었습니다.");
        }
      } catch (error: any) {
        console.error("🚨 참여 신청 실패:", error);
        console.error("🚨 오류 상태 코드:", error?.response?.status);
        console.error("🚨 오류 응답 데이터:", error?.response?.data);
        console.error("🚨 오류 URL:", error?.config?.url);
        console.error("🚨 요청 메서드:", error?.config?.method);

        // 구체적인 오류 메시지 처리
        if (error?.response?.status === 409) {
          alert("이미 참여 신청한 모임입니다.");
        } else if (error?.response?.status === 400) {
          const errorMsg = error?.response?.data?.message || "참여 신청에 실패했습니다.";
          alert(errorMsg);
        } else if (error?.response?.status === 401) {
          alert("로그인이 필요합니다.");
        } else if (error?.response?.status === 403) {
          alert("참여 신청 권한이 없습니다. (본인이 작성한 게시글이거나 이미 마감된 모임일 수 있습니다)");
        } else if (error?.response?.status === 404) {
          alert("게시글을 찾을 수 없습니다.");
        } else {
          const errorMsg = error?.response?.data?.message || "참여 신청에 실패했습니다. 다시 시도해주세요.";
          alert(errorMsg);
        }
      }
    }
  };

  // 사용자 차단
  const handleUserBlock = async (userId: string) => {
    try {
      const response = await api.users.blockUser(userId);

      if (response.success) {
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
      await api.posts.delete(postId);
      // 게시글 목록에서 삭제된 게시글 제거
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      alert("게시글이 삭제되었습니다.");
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
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
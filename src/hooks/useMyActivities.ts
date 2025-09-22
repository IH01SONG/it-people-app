import { useState, useCallback } from "react";
import { api } from "../lib/api";
import type { Activity } from "../types/home.types";
import { findMyPendingRequest } from "../utils/joinRequestId";
import { joinRequestStorage, postStorage, authStorage } from "../utils/localStorage";
import { handleCancelError, logDetailedError } from "../utils/errorHandling";

/** 안전 파싱 유틸 */
const toStringSafe = (v: unknown, fallback = ""): string =>
  v == null ? fallback : String(v);


export function useMyActivities() {
  const [myActivities, setMyActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // 카테고리 ID를 카테고리 이름으로 변환하는 함수
  const getCategoryName = (categoryId: string | object): string => {
    // 카테고리 ID와 이름 매핑 (임시로 하드코딩, 나중에 API로 가져올 수 있음)
    const categoryMap: { [key: string]: string } = {
      '68c3bdd957c06e06e2706f9a': '운동',
      '68c3bdd957c06e06e2706f9b': '스터디',
      '68c3bdd957c06e06e2706f9c': '맛집',
      '68c3bdd957c06e06e2706f9d': '문화',
      '68c3bdd957c06e06e2706f9e': '친목',
      '68c3bdd957c06e06e2706f9f': '게임',
      '68c3bdd957c06e06e2706fa0': '여행',
      '68c3bdd957c06e06e2706fa1': '기타',
    };

    if (typeof categoryId === 'string') {
      return categoryMap[categoryId] || '기타';
    } else if (typeof categoryId === 'object' && (categoryId as any).name) {
      return (categoryId as any).name;
    }
    return '기타';
  };

  // 내 활동 로드 함수
  const loadMyActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      // 현재 사용자 정보 가져오기
      const currentUser = await api.users.getMe();
      const currentUserId = currentUser?._id || currentUser?.id;

      // 내가 쓴 글과 참여한 모임을 병렬로 가져옴
      const [myPostsResponse, joinedPostsResponse] = await Promise.all([
        api.users.getMyPosts(),
        api.users.getJoinedPosts(),
      ]);

      const activities: Activity[] = [];

      // 로컬 저장소에서 게시글 상태 확인 (표준화된 유틸 사용)
      const deletedPosts = postStorage.getDeletedPosts();
      const appliedPosts = joinRequestStorage.getAppliedPosts();
      const cancelledPosts = joinRequestStorage.getCancelledPosts();

      console.log('🚫 [MyActivities] 로컬 저장소 상태:', {
        '삭제된_게시글': deletedPosts,
        '신청한_게시글': appliedPosts,
        '취소한_게시글': cancelledPosts
      });

      // 내가 쓴 글을 활동으로 변환
      const myPosts = myPostsResponse?.posts || myPostsResponse || [];
      if (Array.isArray(myPosts)) {
        myPosts.forEach((post: unknown) => {
          const postData = post as Record<string, unknown>;

          // _id 또는 id 필드 확인
          const postId = (postData._id as string) || (postData.id as string);

          // authorId가 객체인 경우 처리
          let authorId: string;
          if (typeof postData.authorId === 'object' && postData.authorId) {
            authorId = (postData.authorId as any)?._id || (postData.authorId as any)?.id;
          } else {
            authorId = (postData.authorId as string) || ((postData.author as any)?.id) || ((postData.author as any)?._id);
          }

          // 삭제된 게시글 필터링
          if (deletedPosts.includes(postId)) {
            return;
          }

          // 보안 검사: 현재 사용자가 실제 작성자인지 확인
          if (currentUserId && authorId && currentUserId !== authorId) {
            return; // 해당 게시글 건너뛰기
          }

          // 카테고리 처리
          const categoryName = getCategoryName(postData.category as string | object);

          activities.push({
            id: postId, // 원래 MongoDB ObjectId를 그대로 사용
            title: postData.title as string,
            status: postData.status === "active" ? "모집 중" : "완료",
            time: postData.meetingDate 
              ? new Date(postData.meetingDate as string).toLocaleString("ko-KR")
              : "미정",
            members: Number((postData.participants as unknown[])?.length || 0),
            maxMembers: postData.maxParticipants as number,
            category: categoryName,
            role: "주최자",
            createdAt: postData.createdAt as string,
            authorId: authorId, // 검증된 작성자 ID 사용
          });
        });
      }

      // 참여한 모임을 활동으로 변환
      const joinedPosts = joinedPostsResponse?.posts || joinedPostsResponse || [];
      if (Array.isArray(joinedPosts)) {
        joinedPosts.forEach((post: unknown) => {
          const postData = post as Record<string, unknown>;

          // _id 또는 id 필드 확인
          const postId = (postData._id as string) || (postData.id as string);

          // 참여 취소한 게시글은 제외
          if (cancelledPosts.includes(postId)) {
            console.log(`🚫 참여 취소한 게시글 제외: ${postId} - ${postData.title}`);
            return;
          }

          // appliedPosts에 없고 백엔드에서 참여한 모임으로 나오는 경우에는 표시
          // (백엔드 데이터를 우선하되, 명시적으로 취소한 것만 제외)

          // 카테고리 처리
          const categoryName = getCategoryName(postData.category as string | object);

          activities.push({
            id: postId, // 원래 MongoDB ObjectId를 그대로 사용
            title: postData.title as string,
            status: postData.status === "active" ? "참여 중" : "완료",
            time: postData.meetingDate
              ? new Date(postData.meetingDate as string).toLocaleString("ko-KR")
              : "미정",
            members: Number((postData.participants as unknown[])?.length || 0),
            maxMembers: postData.maxParticipants as number,
            category: categoryName,
            role: "참여자",
            createdAt: toStringSafe(postData.createdAt, new Date().toISOString()),
            authorId: toStringSafe(postData.authorId ?? postData._id ?? postData.id, "unknown"),
          } as Activity);
        });
      }

      // 날짜별로 정렬(최신 우선) — createdAt이 ISO 문자열이라는 가정
      activities.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime()
            ? 1
            : -1
      );

      setMyActivities(activities);
    } catch (error) {
      console.error("내 활동 로드 실패:", error as Error);
      setMyActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  // 내 활동에서 특정 활동 제거
  const removeActivity = useCallback((activityId: string) => {
    setMyActivities((prevActivities) =>
      prevActivities.filter((activity) => activity.id !== activityId)
    );
  }, []);

  // 내 활동에서 사용자명으로 활동 제거(타이틀에 포함되는 경우)
  const removeActivitiesByUserName = useCallback((userName: string) => {
    setMyActivities((prev) =>
      prev.filter((activity) => !activity.title.includes(userName))
    );
  }, []);

  // 차단된 사용자와 관련된 활동 제거 (작성자 ID 기반)
  const removeActivitiesByAuthorId = useCallback((authorId: string) => {
    setMyActivities((prev) =>
      prev.filter((activity) => activity.authorId !== authorId)
    );
  }, []);

  // 참여 취소 기능
  const handleCancelParticipation = useCallback(async (postId: string) => {
    // 확인 대화상자
    if (!window.confirm('정말로 참여를 취소하시겠습니까?')) {
      return;
    }

    // 인증 토큰 확인 (표준화된 유틸 사용)
    const token = authStorage.getToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // 1. 저장된 requestId 확인 (표준화된 유틸 사용)
      const requestId = joinRequestStorage.getRequestId(postId);

      console.log('🔍 [MyActivities] 저장된 requestId 확인:', { postId, requestId });

      if (requestId) {
        // 저장된 requestId로 직접 참여 취소
        console.log('🔄 [MyActivities] 저장된 requestId로 참여 취소 API 호출 중...');
        console.log('🔗 [MyActivities] 요청 URL:', `/join-requests/${requestId}`);
        await api.joinRequests.cancel(requestId);
        console.log('✅ [MyActivities] 참여 취소 성공');

        // 표준화된 저장소 관리
        joinRequestStorage.recordCancelRequest(postId);
        console.log('✅ [MyActivities] 저장소 상태 업데이트 완료:', postId);
      } else {
        console.log('⚠️ [MyActivities] 저장된 requestId가 없음. 서버에서 조회 시도...');

        // 저장된 requestId가 없으면 getSent API로 내가 보낸 요청들에서 찾기
        console.log('🔍 [MyActivities] 내가 보낸 참여 요청 목록 조회 중...');
        console.log('🔗 [MyActivities] 요청 URL:', `/join-requests/sent`);

        // 현재 사용자 정보 먼저 확보
        let currentUserId;
        try {
          const currentUser = await api.users.getMe();
          currentUserId = currentUser?._id || currentUser?.id;
          console.log('👤 [MyActivities] 현재 사용자 ID:', currentUserId);

          if (!currentUserId) {
            throw new Error('사용자 ID를 찾을 수 없습니다.');
          }
        } catch (userError) {
          console.error('❌ [MyActivities] 현재 사용자 정보 조회 실패:', userError);
          alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
          return;
        }

        const sentRequests = await api.joinRequests.getSent({ status: 'pending' });
        console.log('📋 [MyActivities] 내가 보낸 참여 요청 목록:', sentRequests);

        // 해당 postId에 대한 내 참여 요청 찾기 (개선된 유틸 사용)
        const requests = sentRequests.requests || sentRequests;
        console.log('🔍 [MyActivities] getSent API 응답 구조:', {
          '전체_응답': sentRequests,
          '요청_배열': requests,
          '요청_개수': Array.isArray(requests) ? requests.length : 0
        });

        const myRequest = findMyPendingRequest(requests, postId, currentUserId);

        if (!myRequest) {
          console.error('❌ [MyActivities] 참여 요청을 찾을 수 없음');
          alert('참여 요청을 찾을 수 없습니다. 이미 취소되었거나 처리된 요청일 수 있습니다.');
          // 로컬에서 해당 활동 제거
          removeActivity(postId);
          return;
        }

        const foundRequestId = myRequest._id || myRequest.id;
        console.log('✅ [MyActivities] 서버에서 참여 요청 ID 찾음:', foundRequestId);

        // 찾은 requestId로 참여 취소
        console.log('🔄 [MyActivities] 찾은 requestId로 참여 취소 API 호출 중...');
        await api.joinRequests.cancel(foundRequestId);
        console.log('✅ [MyActivities] 참여 취소 성공');

        // 표준화된 저장소 관리
        joinRequestStorage.recordCancelRequest(postId);
      }

      // 5. 로컬 상태 업데이트
      removeActivity(postId);

      alert("참여 취소가 완료되었습니다.");

    } catch (error: any) {
      // 표준화된 에러 처리
      const errorMessage = handleCancelError(error);

      // 상세 에러 로깅 (백엔드 개발자용)
      logDetailedError(error, 'MyActivities-Cancel', {
        postId,
        requestId: joinRequestStorage.getRequestId(postId),
        currentUserId,
        localStorage_상태: {
          requestIds: joinRequestStorage.getAllRequestIds(),
          appliedPosts: joinRequestStorage.getAppliedPosts(),
          cancelledPosts: joinRequestStorage.getCancelledPosts()
        },
        action: 'cancel_from_activities'
      });

      alert(errorMessage);
    }
  }, [removeActivity]);

  return {
    myActivities,
    activitiesLoading,
    loadMyActivities,
    removeActivity,
    removeActivitiesByUserName,
    removeActivitiesByAuthorId,
    handleCancelParticipation,
  };
}


import { useState, useCallback } from "react";
import { api } from "../lib/api";
import type { Activity } from "../types/home.types";
import { findMyPendingRequest } from "../utils/joinRequestId";
import {
  joinRequestStorage,
  postStorage,
  authStorage,
} from "../utils/localStorage";
import { handleCancelError, logDetailedError } from "../utils/errorHandling";
import { displayCategoryName } from "../utils/category";
import { CATEGORY_ID_TO_NAME } from "../constants/categories";



/** 다양한 응답 포맷에서 authorId 추출 */
const extractAuthorId = (post: any): string => {
  // 우선순위: post.authorId(객체/문자열) > post.author(객체) > 폴백
  if (post?.authorId) {
    return typeof post.authorId === "object"
      ? (post.authorId._id || post.authorId.id || "")
      : String(post.authorId);
  }
  if (post?.author && typeof post.author === "object") {
    return post.author._id || post.author.id || "";
  }
  return "";
};

export function useMyActivities() {
  const [myActivities, setMyActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // 내 활동 로드 함수
  const loadMyActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      // currentUserId가 로딩 중이면 대기하지 않고 항상 최신 정보를 가져옴
      const me = await api.users.getMe();
      const meId = me?._id || (me as any)?.id || null;

      // 내가 쓴 글, 대기중 요청, 참가 확정 글을 병렬 로드
      const [myPostsResponse, sentPendingResponse, joinedPostsResponse] = await Promise.all([
        api.users.getMyPosts(),
        api.joinRequests.getSent({ status: 'pending' }), // 대기중 요청
        api.users.getJoinedPosts(), // 참가 확정 글
      ]);

      const activities: Activity[] = [];

      // 로컬 저장소 상태
      const deletedPosts = postStorage.getDeletedPosts();
      const cancelledPosts = joinRequestStorage.getCancelledPosts();

      // 내가 쓴 글 → 활동 변환
      const myPosts = myPostsResponse?.posts || myPostsResponse || [];
      if (Array.isArray(myPosts)) {
        myPosts.forEach((post: any) => {
          const postId = post?._id || post?.id;
          if (!postId) return;

          // 삭제된 게시글 제외
          if (deletedPosts.includes(String(postId))) return;

          // 작성자 식별
          const authorId = extractAuthorId(post);

          // 보안: 정말 내 글인지 확인
          if (meId && authorId && meId !== authorId) return;

          // 카테고리 표시명
          const categoryName = displayCategoryName(post?.category, CATEGORY_ID_TO_NAME);

          // createdAt 폴백(정렬 안정화)
          const created =
            post?.createdAt ??
            post?.updatedAt ??
            post?.meetingDate ??
            "1970-01-01T00:00:00.000Z";

          activities.push({
            id: String(postId),
            title: post?.title ?? "",
            status: post?.status === "active" ? "모집 중" : "완료",
            time: post?.meetingDate
              ? new Date(post.meetingDate as string).toLocaleString("ko-KR")
              : "미정",
            members: Array.isArray(post?.participants)
              ? post.participants.length
              : 0,
            maxMembers: Number(post?.maxParticipants ?? 0),
            category: categoryName,
            role: "주최자",
            createdAt: String(created),
            authorId: authorId,
          });
        });
      }

      // 1) 대기중 참여 요청 → 활동 변환 (requestId 있음)
      const sentPendingRequests = sentPendingResponse?.data?.requests || sentPendingResponse?.requests || [];
      if (Array.isArray(sentPendingRequests)) {
        sentPendingRequests.forEach((request: any) => {
          const post = request?.post;
          const postId = post?._id || post?.id;
          const requestId = request?._id || request?.id;

          if (!postId || !requestId) return;

          // 참여 취소한 게시글 제외
          if (cancelledPosts.includes(String(postId))) return;

          const categoryName = displayCategoryName(post?.category, CATEGORY_ID_TO_NAME);
          const created =
            post?.createdAt ??
            post?.updatedAt ??
            post?.meetingDate ??
            "1970-01-01T00:00:00.000Z";

          activities.push({
            id: String(postId),
            title: post?.title ?? "",
            status: "pending", // 대기중 상태
            time: post?.meetingDate
              ? new Date(post.meetingDate as string).toLocaleString("ko-KR")
              : "미정",
            members: Array.isArray(post?.participants)
              ? post.participants.length
              : 0,
            maxMembers: Number(post?.maxParticipants ?? 0),
            category: categoryName,
            role: "참여자",
            createdAt: String(created),
            authorId: extractAuthorId(post) || "unknown",
            requestId: String(requestId), // 참여 요청 ID 저장
          } as Activity);
        });
      }

      // 2) 참가 확정 글 → 활동 변환 (requestId 없음)
      const joinedPosts = joinedPostsResponse?.posts || joinedPostsResponse || [];
      if (Array.isArray(joinedPosts)) {
        joinedPosts.forEach((post: any) => {
          const postId = post?._id || post?.id;
          if (!postId) return;

          // 참여 취소한 게시글 제외
          if (cancelledPosts.includes(String(postId))) return;

          const categoryName = displayCategoryName(post?.category, CATEGORY_ID_TO_NAME);
          const created =
            post?.createdAt ??
            post?.updatedAt ??
            post?.meetingDate ??
            "1970-01-01T00:00:00.000Z";

          activities.push({
            id: String(postId),
            title: post?.title ?? "",
            status: "approved", // 승인된 상태
            time: post?.meetingDate
              ? new Date(post.meetingDate as string).toLocaleString("ko-KR")
              : "미정",
            members: Array.isArray(post?.participants)
              ? post.participants.length
              : 0,
            maxMembers: Number(post?.maxParticipants ?? 0),
            category: categoryName,
            role: "참여자",
            createdAt: String(created),
            authorId: extractAuthorId(post) || "unknown",
            requestId: undefined, // 승인되면 보통 request가 없어짐
          } as Activity);
        });
      }

      // 최신순 정렬
      activities.sort((a, b) => {
        const at = new Date(a.createdAt).getTime();
        const bt = new Date(b.createdAt).getTime();
        return bt - at;
      });

      setMyActivities(activities);
    } catch (error) {
      console.error("내 활동 로드 실패:", error as Error);
      setMyActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []); // currentUserId 의존성 제거로 불필요한 재호출 방지

  // 내 활동에서 특정 활동 제거
  const removeActivity = useCallback((activityId: string) => {
    setMyActivities((prev) => prev.filter((a) => a.id !== activityId));
  }, []);

  // 사용자명 포함 타이틀 제거 (옵션)
  const removeActivitiesByUserName = useCallback((userName: string) => {
    setMyActivities((prev) => prev.filter((a) => !a.title.includes(userName)));
  }, []);

  // 특정 authorId의 활동 제거 (차단 등)
  const removeActivitiesByAuthorId = useCallback((authorId: string) => {
    setMyActivities((prev) => prev.filter((a) => a.authorId !== authorId));
  }, []);

  // 참여 취소
  const handleCancelParticipation = useCallback(
    async (postId: string) => {
      if (!window.confirm("정말로 참여를 취소하시겠습니까?")) return;

      // Activity에서 requestId 찾기
      const activity = myActivities.find(a => a.id === postId && a.role === "참여자");
      const activityRequestId = activity?.requestId;

      // 인증 토큰 확인
      const token = authStorage.getToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      try {
        // 1) pending 상태: requestId로 취소
        if (activityRequestId) {
          console.log("🎯 [MyActivities] pending 상태 - requestId로 취소:", activityRequestId);
          await api.joinRequests.cancel(activityRequestId);
          joinRequestStorage.recordCancelRequest(postId);
          removeActivity(postId);
          alert("참여 신청이 취소되었습니다.");
          return;
        }

        // 2) approved 상태: leave API로 취소
        if (activity?.status === "approved") {
          console.log("🎯 [MyActivities] approved 상태 - leave API로 취소");
          try {
            await api.posts.leave(postId);
            joinRequestStorage.recordCancelRequest(postId);
            removeActivity(postId);
            alert("참여 취소가 완료되었습니다.");
            return;
          } catch (leaveError: any) {
            const status = leaveError?.response?.status;
            const message = leaveError?.response?.data?.message;

            // leave API가 없거나 미구현인 경우
            if (status === 404 || message?.includes("not found")) {
              alert("승인된 참가 취소는 현재 앱에서 직접 처리할 수 없습니다. 주최자에게 문의해 주세요.");
              return;
            }
            throw leaveError;
          }
        }

        // 3) 혹시 상태 정보가 없거나 이상한 경우의 안전장치
        console.warn("⚠️ [MyActivities] 예상치 못한 상황 - Activity 상태:", {
          activity: activity ? {
            id: activity.id,
            status: activity.status,
            requestId: activity.requestId
          } : null
        });

        alert("참여 취소 처리에 문제가 있습니다. 잠시 후 다시 시도해주세요.");
      } catch (error: any) {
        const errorMessage = handleCancelError(error);

        logDetailedError(error, "MyActivities-Cancel", {
          postId,
          requestId: joinRequestStorage.getRequestId(postId),
          localStorage_상태: {
            requestIds: joinRequestStorage.getAllRequestIds(),
            appliedPosts: joinRequestStorage.getAppliedPosts(),
            cancelledPosts: joinRequestStorage.getCancelledPosts(),
          },
          action: "cancel_from_activities",
        });

        alert(errorMessage);
      }
    },
    [myActivities, removeActivity] // myActivities 의존성 추가
  );

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

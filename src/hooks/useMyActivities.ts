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
import { displayCategoryName } from "../constants/categories";



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

      // 내가 쓴 글과 참여한 모임 병렬 로드
      const [myPostsResponse, joinedPostsResponse] = await Promise.all([
        api.users.getMyPosts(),
        api.users.getJoinedPosts(),
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
          const categoryName = displayCategoryName(post?.category);

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

      // 내가 참여한 글 → 활동 변환
      const joinedPosts =
        joinedPostsResponse?.posts || joinedPostsResponse || [];
      if (Array.isArray(joinedPosts)) {
        joinedPosts.forEach((post: any) => {
          const postId = post?._id || post?.id;
          if (!postId) return;

          // 참여 취소한 게시글 제외
          if (cancelledPosts.includes(String(postId))) return;

          const categoryName = displayCategoryName(post?.category);
          const created =
            post?.createdAt ??
            post?.updatedAt ??
            post?.meetingDate ??
            "1970-01-01T00:00:00.000Z";

          activities.push({
            id: String(postId),
            title: post?.title ?? "",
            status: post?.status === "active" ? "참여 중" : "완료",
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
            // 작성자 ID는 서버 포맷 다양성 대비
            authorId: extractAuthorId(post) || "unknown",
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

      // 인증 토큰 확인
      const token = authStorage.getToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      try {
        // 1) 저장된 requestId 우선
        const savedRequestId = joinRequestStorage.getRequestId(postId);
        console.log("🔍 [MyActivities] 저장된 requestId 확인:", {
          postId,
          requestId: savedRequestId,
        });

        if (savedRequestId) {
          console.log(
            "🔄 [MyActivities] 저장된 requestId로 취소:",
            savedRequestId
          );
          await api.joinRequests.cancel(savedRequestId);
          joinRequestStorage.recordCancelRequest(postId);
          joinRequestStorage.clearRequestId(postId); // 취소 후 정리
        } else {
          console.log("⚠️ 저장된 requestId 없음 → 서버 조회");

          // 현재 유저 ID 확보 (항상 최신 정보 사용)
          let meId;
          try {
            const me = await api.users.getMe();
            meId = me?._id || me?.id;
          } catch (e) {
            console.error("❌ 사용자 정보 조회 실패:", e);
            alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
            return;
          }

          // 2) 1차: pending
          let sent = await api.joinRequests.getSent({ status: "pending" });
          let arr = sent?.requests || sent;
          console.log("📋 pending sent:", Array.isArray(arr) ? arr.length : 0);

          let myRequest = findMyPendingRequest(arr, postId, meId!);

          // 3) 2차: all
          if (!myRequest) {
            console.log("⚠️ pending에서 못찾음 → all 조회");
            sent = await api.joinRequests.getSent(); // 전체
            arr = sent?.requests || sent;

            myRequest = Array.isArray(arr)
              ? arr.find((req: any) => {
                  const reqPostId = req?.post?._id || req?.postId;
                  const reqRequesterId =
                    req?.requester?._id || req?.requesterId;
                  const ok =
                    String(reqPostId) === String(postId) &&
                    String(reqRequesterId) === String(meId);
                  return ok;
                })
              : undefined;
          }

          if (!myRequest) {
            console.error(
              "❌ 참여 요청을 찾을 수 없음(pending, all 모두 실패)"
            );
            alert(
              "참여 요청을 찾을 수 없습니다. 이미 취소되었거나 처리된 요청일 수 있습니다."
            );
            removeActivity(postId);
            return;
          }

          const foundRequestId = myRequest._id || myRequest.id;
          console.log("✅ server에서 requestId 찾음:", foundRequestId);

          // 발견한 id 캐싱(다음번 최적화)
          joinRequestStorage.setRequestId(postId, foundRequestId);

          // 취소 호출
          await api.joinRequests.cancel(foundRequestId);
          joinRequestStorage.recordCancelRequest(postId);
          joinRequestStorage.clearRequestId(postId); // 취소 후 정리
        }

        // 상태 반영
        removeActivity(postId);
        alert("참여 취소가 완료되었습니다.");
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
    [removeActivity] // currentUserId 의존성 제거
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

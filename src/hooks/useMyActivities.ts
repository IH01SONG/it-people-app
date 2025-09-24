import { useState, useCallback } from "react";
import { api } from "../lib/api";
import type { Activity } from "../types/home.types";
import {
  joinRequestStorage,
  postStorage,
  authStorage,
} from "../utils/localStorage";
import { handleCancelError, logDetailedError } from "../utils/errorHandling";
import { getCategoryName } from "../utils/hardcodedCategories";
import { joinRequestApi } from "../lib/joinRequest.api";
import { linkReqMap, unlinkReqMap, findRequestIdByPost } from "../utils/joinRequestMapping";



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

      // 내가 쓴 글과 내가 보낸 모든 신청(pending + approved)을 병렬 로드
      const [myPostsResponse, sentRequestsResponse] = await Promise.all([
        api.users.getMyPosts(),
        joinRequestApi.getSentMany(["pending", "approved"]), // pending과 approved를 함께 조회
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
          const categoryName = getCategoryName(post?.category);

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

      // 보낸 참여 요청(pending + approved) → 활동 변환
      if (Array.isArray(sentRequestsResponse)) {
        sentRequestsResponse.forEach((request: any) => {
          const post = request?.post;
          const postId = post?._id || post?.id;
          const requestId = request?._id || request?.id;

          if (!postId || !requestId) return;

          // 참여 취소한 게시글 제외
          if (cancelledPosts.includes(String(postId))) return;

          const categoryName = getCategoryName(post?.category);
          const created =
            post?.createdAt ??
            post?.updatedAt ??
            post?.meetingDate ??
            "1970-01-01T00:00:00.000Z";

          // 로컬 매핑에 저장
          linkReqMap(String(postId), String(requestId));

          activities.push({
            id: String(postId),
            title: post?.title ?? "",
            status: request.status, // pending 또는 approved
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

  // 경합 상황 방지를 위한 진행 중 상태 관리
  const [cancellingPosts, setCancellingPosts] = useState<Set<string>>(new Set());

  // 참여 취소 (상태별 분기 + 경합 가드)
  const handleCancelParticipation = useCallback(
    async (postId: string) => {
      // 경합 가드: 이미 처리 중인 경우 중복 실행 방지
      if (cancellingPosts.has(postId)) {
        console.warn("⚠️ [MyActivities] 이미 처리 중인 요청:", postId);
        return;
      }

      if (!window.confirm("정말로 참여를 취소하시겠습니까?")) return;

      // 처리 시작 표시
      setCancellingPosts(prev => new Set(prev).add(postId));

      try {
        // Activity에서 정보 찾기
        const activity = myActivities.find(a => a.id === postId && a.role === "참여자");
        const status = activity?.status as "pending"|"approved";
        let requestId = activity?.requestId;

        // 인증 토큰 확인
        const token = authStorage.getToken();
        if (!token) {
          alert("로그인이 필요합니다.");
          return;
        }

        // requestId가 없으면 폴백으로 찾기
        if (!requestId && status === "pending") {
          requestId = await findRequestIdByPost(postId);
        }

        if (status === "pending") {
          // pending 상태: DELETE /join-requests/{requestId}
          if (!requestId) throw new Error("요청 ID를 찾지 못했습니다.");
          console.log("🎯 [MyActivities] pending 상태 - requestId로 취소:", requestId);

          try {
            await api.joinRequests.cancel(requestId);
            console.log("✅ [MyActivities] 참여 신청 취소 성공");
          } catch (error: any) {
            const errorStatus = error?.response?.status;
            if (errorStatus === 500) {
              // DELETE 500 시 상태 재확인 → approved면 leave로 전환
              console.warn("⚠️ DELETE 500 에러 - 상태 재확인 중...");
              await refetchAfter(postId); // 최신 상태 로드
              const updatedActivity = myActivities.find(a => a.id === postId);
              if (updatedActivity?.status === "approved") {
                console.log("🔄 상태가 approved로 변경됨 - leave API로 전환");
                await api.posts.leave(postId);
                console.log("✅ [MyActivities] 모임 탈퇴 성공 (폴백)");
              } else {
                throw error;
              }
            } else if (errorStatus === 404) {
              // 404는 이미 취소된 것으로 간주 (성공 처리)
              console.log("ℹ️ [MyActivities] 이미 취소된 요청 (404) - 성공으로 처리");
            } else {
              throw error; // 다른 에러는 그대로 throw
            }
          }
          alert("참여 신청이 취소되었습니다.");
        } else if (status === "approved") {
          // approved 상태: POST /posts/{postId}/leave
          console.log("🎯 [MyActivities] approved 상태 - leave API로 탈퇴:", postId);

          try {
            await api.posts.leave(postId);
            console.log("✅ [MyActivities] 모임 탈퇴 성공");
          } catch (error: any) {
            const errorStatus = error?.response?.status;
            if (errorStatus === 404) {
              // 404는 이미 탈퇴한 것으로 간주 (성공 처리)
              console.log("ℹ️ [MyActivities] 이미 탈퇴한 모임 (404) - 성공으로 처리");
            } else {
              throw error;
            }
          }
          alert("모임 탈퇴가 완료되었습니다.");
        } else {
          throw new Error("알 수 없는 참여 상태입니다.");
        }

        // 성공 후 정리
        joinRequestStorage.recordCancelRequest(postId);
        unlinkReqMap(postId);
        removeActivity(postId);

        // 내 활동 목록 새로고침을 위한 이벤트 발생
        window.dispatchEvent(new CustomEvent('joinRequestSuccess', {
          detail: { postId, type: 'cancel_from_activities' }
        }));

      } catch (error: any) {
        console.error("❌ [MyActivities] 참여 취소 실패:", error);

        const errorMessage = handleCancelError(error);
        alert(errorMessage);

        logDetailedError(error, "MyActivities-Cancel", {
          postId,
          action: "cancel_from_activities",
        });
      } finally {
        // 상태 새로고침 (성공/실패 무관하게 실행)
        await refetchAfter(postId);

        // 처리 완료 표시
        setCancellingPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    },
    [myActivities, removeActivity, cancellingPosts]
  );

  // 상태 새로고침 함수 (모든 관련 상태 무효화)
  const refetchAfter = useCallback(async (postId: string) => {
    try {
      // 내 활동 목록 새로고침
      await loadMyActivities();

      // 추가적으로 다른 관련 상태들도 새로고침할 수 있도록 확장 가능
      // 예: React Query가 있다면 쿼리 무효화
      // await Promise.all([
      //   qc.invalidateQueries({ queryKey: ["mySent", { status: "pending" }] }),
      //   qc.invalidateQueries({ queryKey: ["mySent", { status: "approved" }] }),
      //   qc.invalidateQueries({ queryKey: ["myJoined"] }),
      //   qc.invalidateQueries({ queryKey: ["joinStatus", postId] }),
      // ]);

      console.log("✅ [MyActivities] 상태 동기화 완료:", postId);
    } catch (error) {
      console.warn("⚠️ [MyActivities] 상태 새로고침 실패:", error);
    }
  }, [loadMyActivities]);

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

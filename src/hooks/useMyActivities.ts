import { useState, useCallback } from "react";
import { api } from "../lib/api";
import type { Activity } from "../types/home.types";

/** 안전 파싱 유틸 */
const toStringSafe = (v: unknown, fallback = ""): string =>
  v == null ? fallback : String(v);

const toNumberSafe = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const getLen = (v: unknown): number =>
  Array.isArray(v) ? v.length : 0;

export function useMyActivities() {
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
      // 응답 형태: { posts: [...] } 또는 그냥 [...]
      const myPosts = (myPostsResponse?.posts ?? myPostsResponse) || [];
      if (Array.isArray(myPosts)) {
        for (const post of myPosts) {
          const p = post as Record<string, unknown>;

          const rawId = p.id ?? p._id; // 백엔드에서 id 또는 _id 가능성
          const id = toStringSafe(rawId, cryptoRandomId());

          activities.push({
            id, // ✅ string 보장
            title: toStringSafe(p.title, "(제목 없음)"),
            status: p.status === "active" ? "모집 중" : "완료",
            time: p.meetingDate
              ? new Date(String(p.meetingDate)).toLocaleString("ko-KR")
              : "미정",
            members: getLen(p.participants),
            maxMembers: toNumberSafe(p.maxParticipants, 0),
            category: toStringSafe(p.category, "기타"),
            role: "주최자",
            createdAt: toStringSafe(p.createdAt, new Date().toISOString()),
            authorId: toStringSafe(p.authorId ?? p._id ?? p.id, "unknown"),
          } as Activity);
        }
      }

      // 참여한 모임을 활동으로 변환
      const joinedPosts =
        (joinedPostsResponse?.posts ?? joinedPostsResponse) || [];
      if (Array.isArray(joinedPosts)) {
        for (const post of joinedPosts) {
          const p = post as Record<string, unknown>;

          const rawId = p.id ?? p._id;
          // 참여 항목은 prefix로 구분(예: "joined-<id>")
          const id = "joined-" + toStringSafe(rawId, cryptoRandomId());

          activities.push({
            id, // ✅ string 보장
            title: toStringSafe(p.title, "(제목 없음)"),
            status: p.status === "active" ? "참여 중" : "완료",
            time: p.meetingDate
              ? new Date(String(p.meetingDate)).toLocaleString("ko-KR")
              : "미정",
            members: getLen(p.participants),
            maxMembers: toNumberSafe(p.maxParticipants, 0),
            category: toStringSafe(p.category, "기타"),
            role: "참여자",
            createdAt: toStringSafe(p.createdAt, new Date().toISOString()),
            authorId: toStringSafe(p.authorId ?? p._id ?? p.id, "unknown"),
          } as Activity);
        }
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

  // 내 활동에서 특정 활동 제거 (id는 string)
  const removeActivity = useCallback((activityId: string) => {
    setMyActivities((prev) =>
      prev.filter((activity) => activity.id !== activityId)
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

  return {
    myActivities,
    activitiesLoading,
    loadMyActivities,
    removeActivity,
    removeActivitiesByUserName,
    removeActivitiesByAuthorId,
  };
}

/** 간단 랜덤 ID (브라우저/노드 호환) */
function cryptoRandomId() {
  try {
    // 브라우저
    return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  } catch {
    // 노드/폴백
    return Math.random().toString(36).slice(2);
  }
}

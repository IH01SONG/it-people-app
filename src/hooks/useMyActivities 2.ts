import { useState, useCallback } from "react";
import { api } from "../lib/api";
import type { Activity } from "../types/home.types";

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

  // 내 활동에서 특정 활동 제거
  const removeActivity = useCallback((activityId: number) => {
    setMyActivities((prevActivities) =>
      prevActivities.filter((activity) => activity.id !== activityId)
    );
  }, []);

  // 내 활동에서 사용자명으로 활동 제거
  const removeActivitiesByUserName = useCallback((userName: string) => {
    setMyActivities((prevActivities) =>
      prevActivities.filter(
        (activity) => !activity.title.includes(userName)
      )
    );
  }, []);

  return {
    myActivities,
    activitiesLoading,
    loadMyActivities,
    removeActivity,
    removeActivitiesByUserName,
  };
}
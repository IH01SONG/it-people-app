import { useState, useCallback } from "react";
import { api } from "../lib/api";
import type { Activity } from "../types/home.types";

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

      // 로컬에서 삭제된 게시글 ID 목록 가져오기
      const deletedPosts = JSON.parse(localStorage.getItem('deletedPosts') || '[]');

      // 내가 쓴 글을 활동으로 변환
      const myPosts = myPostsResponse?.posts || myPostsResponse || [];
      if (Array.isArray(myPosts)) {
        myPosts.forEach((post: unknown) => {
          const postData = post as Record<string, unknown>;

          // _id 또는 id 필드 확인
          const postId = postData._id as string || postData.id as string;

          // authorId가 객체인 경우 처리
          let authorId: string;
          if (typeof postData.authorId === 'object' && postData.authorId) {
            authorId = (postData.authorId as any)?._id || (postData.authorId as any)?.id;
          } else {
            authorId = postData.authorId as string || postData.author?.id || postData.author?._id;
          }

          // 삭제된 게시글 필터링
          if (deletedPosts.includes(postId)) {
            return;
          }

          // 보안 검사: 현재 사용자가 실제 작성자인지 확인
          if (currentUserId && authorId && currentUserId !== authorId) {
            console.warn("⚠️ 작성자 불일치 감지:", { postId, currentUserId, authorId });
            return; // 해당 게시글 건너뛰기
          }

          // 카테고리 처리
          const categoryName = getCategoryName(postData.category);

          activities.push({
            id: Number(String(postData.id || 0)),
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
            authorId: (postData.authorId || postData._id || postData.id) as string, // 작성자 ID 추가
          });
        });
      }

      // 참여한 모임을 활동으로 변환
      const joinedPosts = joinedPostsResponse?.posts || joinedPostsResponse || [];
      if (Array.isArray(joinedPosts)) {
        joinedPosts.forEach((post: unknown, index: number) => {
          const postData = post as Record<string, unknown>;


          // _id 또는 id 필드 확인
          const postId = postData._id as string || postData.id as string;

          // 카테고리 처리
          const categoryName = getCategoryName(postData.category);

          activities.push({
            id: Number(String(postData.id || 0)) + 10000, // 참여한 모임은 10000 이상의 ID
            title: postData.title as string,
            status: postData.status === "active" ? "참여 중" : "완료",
            time: postData.meetingDate 
              ? new Date(postData.meetingDate as string).toLocaleString("ko-KR")
              : "미정",
            members: Number((postData.participants as unknown[])?.length || 0),
            maxMembers: postData.maxParticipants as number,
            category: categoryName,
            role: "참여자",
            createdAt: postData.createdAt as string,
            authorId: (postData.authorId || postData._id || postData.id) as string, // 작성자 ID 추가
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

  // 내 활동에서 사용자명으로 활동 제거
  const removeActivitiesByUserName = useCallback((userName: string) => {
    setMyActivities((prevActivities) =>
      prevActivities.filter(
        (activity) => !activity.title.includes(userName)
      )
    );
  }, []);

  // 차단된 사용자와 관련된 활동 제거 (작성자 ID 기반)
  const removeActivitiesByAuthorId = useCallback((authorId: string) => {
    setMyActivities((prevActivities) =>
      prevActivities.filter(
        (activity) => activity.authorId !== authorId
      )
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
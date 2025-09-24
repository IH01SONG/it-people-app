// 가이드 3번: API 호출 함수 명시적 고정
import axios from './axios'; // 프로젝트 axios 인스턴스
import { api } from './api';

export async function requestJoin(postId: string, payload?: { message?: string }) {
  console.log('[REQ_API] requestJoin 호출:', { postId, payload });
  const body = payload ?? {}; // ✅ 최소 {} 전송
  return axios.post(`/posts/${postId}/request`, body).then(r => r.data);
}

export async function cancelJoinRequest(requestId: string) {
  console.log('[CANCEL_API] cancelJoinRequest 호출:', { requestId });
  return axios.delete(`/join-requests/${requestId}`).then(r => r.data);
}

// 새로운 joinRequest API 구조
export const joinRequestApi = {
  getSent: (status: "pending"|"approved"|"rejected"|"cancelled"|"all") =>
    api.joinRequests.getSent({ status }),

  getSentMany: async (statuses: Array<"pending"|"approved">) => {
    const res = await Promise.all(statuses.map(s => api.joinRequests.getSent({ status: s })));
    const items = res.flatMap(r => r.data?.requests ?? r.requests ?? []);
    // id 기준 중복 제거
    const map = new Map(items.map((i: any) => [i._id || i.id, i]));
    return Array.from(map.values());
  },
};


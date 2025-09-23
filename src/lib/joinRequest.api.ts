// 가이드 3번: API 호출 함수 명시적 고정
import axios from './axios'; // 프로젝트 axios 인스턴스

export async function requestJoin(postId: string, payload?: { message?: string }) {
  console.log('[REQ_API] requestJoin 호출:', { postId, payload });
  const body = payload ?? {}; // ✅ 최소 {} 전송
  return axios.post(`/posts/${postId}/request`, body).then(r => r.data);
}

export async function cancelJoinRequest(requestId: string) {
  console.log('[CANCEL_API] cancelJoinRequest 호출:', { requestId });
  return axios.delete(`/join-requests/${requestId}`).then(r => r.data);
}
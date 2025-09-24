import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { extractRequestId } from '../utils/joinRequestId';
import { requestJoin } from '../lib/joinRequest.api'; // 가이드 3번: 명시적 API 함수

const KEY = (postId: string) => `join_request_id:${postId}`;

export function useJoinCancel(postId: string) {
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const isPending = useMemo(() => !!requestId, [requestId]);

  // 새로고침 후 복원
  useEffect(() => {
    const saved = localStorage.getItem(KEY(postId));
    if (saved) setRequestId(saved);
  }, [postId]);

  /** 참여 신청: 성공 응답에서 requestId를 즉시 확보해 저장 */
  const apply = useCallback(async () => {
    console.log('[APPLY] useJoinCancel.apply called', { postId });

    // 가이드 2번: 가드 분기 로그
    console.log('[GUARD] before guard', { loading, requestId, isPending });
    if (loading) {
      console.log('[BLOCK] guard blocked by loading', { loading });
      return;
    }
    if (requestId) {
      console.log('[BLOCK] guard blocked by existing requestId', { requestId });
      return;
    }
    console.log('[CALL] requestJoin() about to call /posts/:id/request');

    setLoading(true);
    try {
      console.log('[API] requestJoin 호출 직전');
      const res = await requestJoin(postId);
      console.log('[API] requestJoin 응답:', res);
      const id = extractRequestId(res);
      console.log('[ID] extractRequestId 결과:', id);
      if (!id) throw new Error('REQUEST_ID_MISSING');

      setRequestId(id);
      localStorage.setItem(KEY(postId), id);
      return id;
    } finally {
      setLoading(false);
    }
  }, [postId]);

  /** 신청 취소: pending 상태 전용 DELETE API */
  const cancel = useCallback(async () => {
    if (!requestId) throw new Error('NO_REQUEST_ID');
    setLoading(true);
    try {
      await api.joinRequests.cancel(requestId); // 순수 DELETE 요청
      // 성공 시 정리
      localStorage.removeItem(KEY(postId));
      setRequestId(null);
    } finally {
      setLoading(false);
    }
  }, [postId, requestId]);

  /** 상태 초기화(필요 시) */
  const reset = useCallback(() => {
    localStorage.removeItem(KEY(postId));
    setRequestId(null);
  }, [postId]);

  return { loading, isPending, requestId, apply, cancel, reset };
}
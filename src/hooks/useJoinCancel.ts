import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { extractRequestId } from '../utils/joinRequestId';

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
    setLoading(true);
    try {
      const res = await api.posts.join(postId);
      const id = extractRequestId(res);
      if (!id) throw new Error('REQUEST_ID_MISSING');

      setRequestId(id);
      localStorage.setItem(KEY(postId), id);
      return id;
    } finally {
      setLoading(false);
    }
  }, [postId]);

  /** 신청 취소: 저장된 requestId만 사용 */
  const cancel = useCallback(async () => {
    if (!requestId) throw new Error('NO_REQUEST_ID');
    setLoading(true);
    try {
      await api.joinRequests.cancel(requestId);
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
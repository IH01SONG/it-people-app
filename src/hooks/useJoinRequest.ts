import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
// import { useAuthContext } from '../contexts/AuthContext'; // 있으면 사용하세요

type JoinRequest = {
  _id: string;
  post?: { _id: string };
  requester?: { _id: string };
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
};

export function useJoinRequest(postId?: string) {
  const [loading, setLoading] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [myPendingRequest, setMyPendingRequest] = useState<JoinRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  // const { user } = useAuthContext(); // 전역 컨텍스트가 있다면 사용
  // useEffect(() => { if (user?._id) setMyId(user._id); }, [user]);

  /** 현재 로그인 사용자 ID 확보 (컨텍스트 없을 때 안전장치) */
  const ensureMyId = useCallback(async () => {
    if (myId) return myId;

    // 1) 이미 세팅돼 있으면 반환
    // if (user?._id) { setMyId(user._id); return user._id; }

    // 2) 서버에서 강제 조회 (fallback)
    try {
      console.log('👤 [JoinRequest] 현재 사용자 ID 조회 시도: /auth/me');
      const me = await api.getMe(); // == api.users.getMe()도 동일하게 가능
      const id = me?._id || me?.data?._id || me?.id || null;
      console.log('👤 [JoinRequest] 현재 사용자 ID:', id);
      if (!id) throw new Error('NO_ME_ID');
      setMyId(id);
      return id;
    } catch (e) {
      console.warn('❌ [JoinRequest] 현재 사용자 ID를 가져오지 못했습니다. 로그인/토큰을 확인하세요.');
      throw e;
    }
  }, [myId]);

  /** 보낸 요청(sent) 중에서 내 요청 + 해당 게시글 + pending을 찾아오기 */
  const refreshMyPendingForPost = useCallback(async (_postId?: string) => {
    if (!_postId && !postId) return null;
    const pid = _postId ?? postId!;
    setLoading(true);
    setError(null);
    try {
      const uid = await ensureMyId();

      console.log('🔍 [JoinRequest] 내가 보낸 참여 요청 목록 조회 중...');
      const res = await api.joinRequests.getSent({ status: 'pending', page: 1, limit: 50 });

      // 스키마 유연 처리: data.requests 또는 requests
      const list: JoinRequest[] = res?.data?.requests ?? res?.requests ?? [];
      console.log('📋 [JoinRequest] 보낸 요청 개수:', list.length);

      const mine = list.find(r =>
        (r.post?._id === pid || r.post === pid) &&
        (r.requester?._id === uid || r.requester === uid) &&
        (r.status === 'pending')
      ) ?? null;

      setMyPendingRequest(mine);
      if (mine) {
        console.log('✅ [JoinRequest] 이 게시글에 대한 내 pending 요청 발견:', mine._id);
      } else {
        console.log('ℹ️ [JoinRequest] 이 게시글에 대한 내 pending 요청이 없습니다.');
      }
      return mine;
    } catch (e) {
      console.error('❌ [JoinRequest] 요청 조회 실패:', e);
      setError('요청 상태를 확인할 수 없습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [postId, ensureMyId]);

  /** 신청 */
  const join = useCallback(async (_postId?: string) => {
    const targetPostId = _postId || postId;
    if (!targetPostId) {
      setError('게시글 ID가 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await ensureMyId();

      console.log('📝 [JoinRequest] 참여 신청 시도: POST /posts/{postId}/join', targetPostId);
      const res = await api.posts.join(targetPostId);

      // 서버가 requestId를 응답에 줄 수도, 안 줄 수도 있음 → 우선 받은 값 시도
      const createdId = res?.data?._id ?? res?._id ?? res?.requestId ?? null;
      if (createdId) {
        console.log('✅ [JoinRequest] 신청 생성됨. requestId:', createdId);
        setMyPendingRequest({ _id: createdId, post: { _id: targetPostId }, status: 'pending' } as any);
      } else {
        console.log('ℹ️ [JoinRequest] 신청 응답에 requestId 없음 → sent 목록에서 재탐색');
        await refreshMyPendingForPost(targetPostId);
      }
    } catch (e: any) {
      console.error('❌ [JoinRequest] 참여 신청 실패:', e);

      const statusCode = e?.response?.status;
      if (statusCode === 409) {
        setError('이미 참여 신청한 모임입니다.');
      } else if (statusCode === 400) {
        setError(e?.response?.data?.message || '참여 신청에 실패했습니다.');
      } else if (statusCode === 401) {
        setError('로그인이 필요합니다.');
      } else if (statusCode === 403) {
        setError('참여 신청 권한이 없습니다.');
      } else if (statusCode === 404) {
        setError('게시글을 찾을 수 없습니다.');
      } else {
        setError(e?.response?.data?.message || '참여 신청에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [postId, ensureMyId, refreshMyPendingForPost]);

  /** 취소 */
  const cancel = useCallback(async (_postId?: string) => {
    const targetPostId = _postId || postId;
    if (!targetPostId) {
      setError('게시글 ID가 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await ensureMyId();

      // 1) 로컬 상태에서 우선 requestId 확보
      let targetId = myPendingRequest?._id ?? null;

      // 2) 없으면 sent에서 다시 찾아오기
      if (!targetId) {
        const found = await refreshMyPendingForPost(targetPostId);
        targetId = found?._id ?? null;
      }

      if (!targetId) {
        console.warn('❌ [JoinRequest] 취소할 pending 요청을 찾지 못했습니다.');
        setError('취소할 요청을 찾을 수 없습니다.');
        return;
      }

      console.log('🗑️ [JoinRequest] 취소 시도: DELETE /join-requests/{requestId}', targetId);
      await api.joinRequests.cancel(targetId);

      // 낙관적 업데이트
      setMyPendingRequest(prev => (prev && prev._id === targetId)
        ? { ...prev, status: 'cancelled' } as any
        : null
      );

      console.log('✅ [JoinRequest] 취소 완료:', targetId);
    } catch (e: any) {
      console.error('❌ [JoinRequest] 참여 취소 실패:', e);

      const statusCode = e?.response?.status;
      if (statusCode === 400) {
        setError('이미 처리된 요청은 취소할 수 없습니다.');
      } else if (statusCode === 403) {
        setError('참여 취소 권한이 없습니다.');
      } else if (statusCode === 404) {
        setError('참여 요청을 찾을 수 없습니다.');
      } else {
        setError(e?.response?.data?.message || '참여 취소에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [postId, ensureMyId, myPendingRequest, refreshMyPendingForPost]);

  /** 마운트 시 초기 동기화 (postId가 있다면 해당 글 기준으로) */
  useEffect(() => {
    if (postId) refreshMyPendingForPost(postId);
  }, [postId, refreshMyPendingForPost]);

  const requestId = useMemo(() => myPendingRequest?._id ?? null, [myPendingRequest]);
  const isApplied = useMemo(() => myPendingRequest?.status === 'pending', [myPendingRequest]);

  return {
    loading,
    error,
    myId,
    requestId,
    isApplied,
    myPendingRequest,
    refreshMyPendingForPost,
    join,
    cancel,
  };
}
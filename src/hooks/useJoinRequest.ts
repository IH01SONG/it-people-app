import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { extractRequestId, getPostId, getRequesterId, findMyPendingRequest } from '../utils/joinRequestId';
import { handleJoinError, handleCancelError, logDetailedError } from '../utils/errorHandling';
import { joinRequestStorage } from '../utils/localStorage';
import { requestJoin } from '../lib/joinRequest.api';
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
      console.log('👤 [JoinRequest] 현재 사용자 ID 조회 시도: /users/me');
      const me = await api.users.getMe();
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

      // 백엔드 개발자를 위한 상세 응답 로깅
      console.log('🔍 [JoinRequest] getSent API 응답 전체:', res);
      console.log('🔍 [JoinRequest] getSent 응답 구조 분석:', {
        "res": res,
        "res.data": res?.data,
        "res.requests": res?.requests,
        "res.data?.requests": res?.data?.requests,
        "typeof_res": typeof res,
        "Object.keys(res)": res ? Object.keys(res) : null
      });

      // 스키마 유연 처리: data.requests 또는 requests
      const list: JoinRequest[] = res?.data?.requests ?? res?.requests ?? [];
      console.log('📋 [JoinRequest] 보낸 요청 개수:', list.length);
      console.log('🔍 [JoinRequest] 보낸 요청 목록 상세:', list);

<<<<<<< HEAD
      // 요청 검색 로직 상세 로깅
      console.log('🔍 [JoinRequest] 요청 검색 조건:', {
        "찾는_postId": pid,
        "현재_userId": uid,
        "찾는_status": 'pending'
      });

      // 새로운 통합 매칭 함수 사용
      const mine = findMyPendingRequest(list, pid, uid);
=======
      const mine = list.find(r =>
        (r.post?._id === pid || (r.post as any) === pid) &&
        (r.requester?._id === uid || r.requester === uid) &&
        (r.status === 'pending')
      ) ?? null;
>>>>>>> feature/mypage

      setMyPendingRequest(mine);
      if (mine) {
        console.log('✅ [JoinRequest] 이 게시글에 대한 내 pending 요청 발견:', mine._id);
      } else {
        console.log('❌ [JoinRequest] 이 게시글에 대한 내 pending 요청이 없습니다.');
        console.log('🚨 [JoinRequest] 백엔드 확인 필요:', {
          "문제": "참여 신청했지만 getSent에서 찾을 수 없음",
          "확인사항": [
            "POST /posts/:postId/request가 JoinRequest를 정상 생성하는지",
            "GET /join-requests/sent의 응답 구조가 올바른지",
            "post/requester 필드 populate 여부",
            "사용자별 권한 필터링 로직"
          ]
        });
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

      console.log('📝 [JoinRequest] 참여 요청 시도: POST /posts/{postId}/request', targetPostId);
      const res = await requestJoin(targetPostId);

      // 백엔드 개발자를 위한 상세 응답 로깅
      console.log('🔍 [JoinRequest] 참여 신청 API 응답 전체:', res);
      console.log('🔍 [JoinRequest] 응답 구조 분석:', {
        "res": res,
        "res.data": res?.data,
        "res._id": res?._id,
        "res.requestId": res?.requestId,
        "res.id": res?.id,
        "typeof_res": typeof res,
        "Object.keys(res)": res ? Object.keys(res) : null
      });

      // 서버가 requestId를 응답에 줄 수도, 안 줄 수도 있음 → 유틸리티로 추출
      const createdId = extractRequestId(res);
      console.log('🔍 [JoinRequest] requestId 추출 과정:', {
        "res?.data?._id": res?.data?._id,
        "res?._id": res?._id,
        "res?.requestId": res?.requestId,
        "res?.id": res?.id,
        "최종_createdId": createdId
      });

      if (createdId) {
        console.log('✅ [JoinRequest] 신청 생성됨. requestId:', createdId);

        // 표준화된 localStorage 관리
        joinRequestStorage.recordJoinRequest(targetPostId, createdId);
        console.log('💾 [JoinRequest] 저장소에 참여 신청 기록:', { postId: targetPostId, requestId: createdId });

        setMyPendingRequest({ _id: createdId, post: { _id: targetPostId }, status: 'pending' } as any);
      } else {
        console.log('⚠️ [JoinRequest] 신청 응답에 requestId 없음 → sent 목록에서 재탐색');
        console.log('🚨 [JoinRequest] 백엔드 확인 필요: POST /posts/:postId/request 응답에 requestId 포함 여부');
        await refreshMyPendingForPost(targetPostId);
      }
    } catch (e: any) {
      // 표준화된 에러 처리
      const errorMessage = handleJoinError(e);
      setError(errorMessage);

      // 상세 에러 로깅 (백엔드 개발자용)
      logDetailedError(e, 'JoinRequest', {
        targetPostId,
        userId: myId,
        action: 'join',
      });
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

      // 표준화된 저장소 관리
      joinRequestStorage.recordCancelRequest(targetPostId);
      console.log('✅ [JoinRequest] 취소 완료:', targetId);
    } catch (e: any) {
      // 표준화된 에러 처리
      const errorMessage = handleCancelError(e);
      setError(errorMessage);

      // 상세 에러 로깅 (백엔드 개발자용)
      logDetailedError(e, 'CancelRequest', {
        targetPostId,
        targetId,
        userId: myId,
        action: 'cancel',
      });
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
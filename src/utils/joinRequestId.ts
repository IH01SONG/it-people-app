/**
 * 백엔드 응답에서 requestId를 추출하는 함수
 * 백엔드 요청 문서에서 제안한 응답 구조들을 모두 처리:
 * - { success: true, data: { _id: "requestId", ... } }
 * - { success: true, requestId: "requestId" }
 * - { requestId: "requestId" } (직접)
 * - { _id: "requestId" } (직접)
 */
export function extractRequestId(res: any): string | null {
  if (!res) return null;

  // 상세 로깅으로 백엔드 응답 구조 파악
  console.log('🔍 [extractRequestId] 응답 구조 분석:', {
    'res': res,
    'res.data': res?.data,
    'res.requestId': res?.requestId,
    'res._id': res?._id,
    'res.data.requestId': res?.data?.requestId,
    'res.data._id': res?.data?._id,
    'res.data.data': res?.data?.data,
    'typeof_res': typeof res
  });

  // axios 응답 구조 처리: res.data가 실제 백엔드 응답
  const backendResponse = res?.data ?? res;

  // 백엔드 요청 문서 기준 응답 구조들 처리
  const requestId = (
    // 1. { success: true, requestId: "..." } - 직접 requestId 필드
    backendResponse?.requestId ||

    // 2. { success: true, data: { _id: "..." } } - data 객체의 _id
    backendResponse?.data?._id ||

    // 3. { success: true, data: { requestId: "..." } } - data 객체의 requestId
    backendResponse?.data?.requestId ||

    // 4. { _id: "..." } - 직접 _id 필드 (간단한 응답)
    backendResponse?._id ||

    // 5. 중첩된 구조 처리 (혹시 모를 경우)
    backendResponse?.data?.data?._id ||
    backendResponse?.data?.data?.requestId ||

    null
  );

  console.log('🔍 [extractRequestId] 추출 결과:', {
    '최종_requestId': requestId,
    '추출_성공': !!requestId
  });

  return requestId;
}

/**
 * 안전한 ID 추출 유틸리티들
 * ObjectId 문자열과 populate된 객체 모두 처리
 * 백엔드 요청 문서의 매칭 로직 기반
 */

export const getPostId = (item: unknown): string | null => {
  const itemObj = item as Record<string, unknown>;
  if (!itemObj?.post) return null;

  const post = itemObj.post;

  // 백엔드 요청 문서 기준: req.post?._id === postId || req.post === postId || req.postId === postId
  if (typeof post === 'string') {
    return post; // ObjectId 문자열
  } else if (post && typeof post === 'object') {
    return (post as Record<string, unknown>)?._id as string || null; // populate된 객체
  }

  // postId 필드가 직접 있는 경우도 처리
  return itemObj.postId as string || null;
};

export const getRequesterId = (item: unknown): string | null => {
  const itemObj = item as Record<string, unknown>;
  if (!itemObj?.requester) return null;

  const requester = itemObj.requester;

  // 백엔드 요청 문서 기준: req.requester?._id === currentUserId || req.requester === currentUserId
  if (typeof requester === 'string') {
    return requester; // ObjectId 문자열
  } else if (requester && typeof requester === 'object') {
    return (requester as Record<string, unknown>)?._id as string || null; // populate된 객체
  }

  return null;
};

export const getAuthorId = (item: unknown): string | null => {
  const itemObj = item as Record<string, unknown>;
  if (!itemObj?.postAuthor && !itemObj?.author) return null;

  const author = itemObj.postAuthor || itemObj.author;

  if (typeof author === 'string') {
    return author; // ObjectId 문자열
  } else if (author && typeof author === 'object') {
    return (author as Record<string, unknown>)?._id as string || null; // populate된 객체
  }

  return null;
};

/**
 * 백엔드 요청 문서의 매칭 로직을 구현한 함수
 * useMyActivities.ts:245의 복잡한 매칭 로직을 표준화
 */
export const findMyPendingRequest = (
  requests: unknown[],
  targetPostId: string,
  currentUserId: string
): unknown | null => {
  if (!Array.isArray(requests)) return null;

  return requests.find((req: unknown) => {
    const postId = getPostId(req);
    const requesterId = getRequesterId(req);
    const status = (req as Record<string, unknown>)?.status;

    const postMatch = postId === targetPostId;
    const requesterMatch = requesterId === currentUserId;
    const statusMatch = status === 'pending';

    console.log('🔍 [findMyPendingRequest] 매칭 분석:', {
      '요청_ID': (req as Record<string, unknown>)?._id,
      '추출된_postId': postId,
      '추출된_requesterId': requesterId,
      '상태': status,
      '타겟_postId': targetPostId,
      '현재_userId': currentUserId,
      'post_일치': postMatch,
      'requester_일치': requesterMatch,
      'status_일치': statusMatch,
      '전체_일치': postMatch && requesterMatch && statusMatch
    });

    return postMatch && requesterMatch && statusMatch;
  }) || null;
};
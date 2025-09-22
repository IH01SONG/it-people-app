/**
 * localStorage 관리 유틸리티
 * 백엔드 요청 문서 기반으로 표준화된 저장소 관리
 */

// localStorage 키 상수 정의
export const STORAGE_KEYS = {
  // 인증 관련
  ACCESS_TOKEN: 'access_token',

  // 참여 관련 (백엔드 요청 문서 기반)
  REQUEST_IDS: 'requestIds', // { postId: requestId } 형태

  // 활동 관리
  DELETED_POSTS: 'deletedPosts', // 삭제된 게시글 ID 목록
  APPLIED_POSTS: 'appliedPosts', // 신청한 게시글 ID 목록
  CANCELLED_POSTS: 'cancelledPosts', // 취소한 게시글 ID 목록
} as const;

/**
 * 안전한 localStorage 접근 함수들
 */

// 문자열 값 저장/조회
export const getStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`localStorage 읽기 실패: ${key}`, error);
    return null;
  }
};

export const setStorageItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`localStorage 저장 실패: ${key}`, error);
  }
};

// JSON 객체 저장/조회
export const getStorageJSON = <T = unknown>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`localStorage JSON 파싱 실패: ${key}`, error);
    return defaultValue;
  }
};

export const setStorageJSON = <T = unknown>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`localStorage JSON 저장 실패: ${key}`, error);
  }
};

/**
 * 참여 관련 저장소 관리 (백엔드 요청 문서 기반)
 */

// requestId 관리
export const getRequestId = (postId: string): string | null => {
  const requestIds = getStorageJSON<Record<string, string>>(STORAGE_KEYS.REQUEST_IDS, {});
  return requestIds[postId] || null;
};

export const setRequestId = (postId: string, requestId: string): void => {
  const requestIds = getStorageJSON<Record<string, string>>(STORAGE_KEYS.REQUEST_IDS, {});
  requestIds[postId] = requestId;
  setStorageJSON(STORAGE_KEYS.REQUEST_IDS, requestIds);
};

export const removeRequestId = (postId: string): void => {
  const requestIds = getStorageJSON<Record<string, string>>(STORAGE_KEYS.REQUEST_IDS, {});
  delete requestIds[postId];
  setStorageJSON(STORAGE_KEYS.REQUEST_IDS, requestIds);
};

// 게시글 상태 관리
export const addToPostList = (key: string, postId: string): void => {
  const list = getStorageJSON<string[]>(key, []);
  if (!list.includes(postId)) {
    list.push(postId);
    setStorageJSON(key, list);
  }
};

export const removeFromPostList = (key: string, postId: string): void => {
  const list = getStorageJSON<string[]>(key, []);
  const filtered = list.filter(id => id !== postId);
  setStorageJSON(key, filtered);
};

export const isInPostList = (key: string, postId: string): boolean => {
  const list = getStorageJSON<string[]>(key, []);
  return list.includes(postId);
};

// 특정 기능별 헬퍼 함수들
export const joinRequestStorage = {
  // 참여 신청 시
  recordJoinRequest: (postId: string, requestId: string) => {
    setRequestId(postId, requestId);
    addToPostList(STORAGE_KEYS.APPLIED_POSTS, postId);
    // 취소 목록에서 제거 (재신청 케이스)
    removeFromPostList(STORAGE_KEYS.CANCELLED_POSTS, postId);
  },

  // 참여 취소 시
  recordCancelRequest: (postId: string) => {
    removeRequestId(postId);
    removeFromPostList(STORAGE_KEYS.APPLIED_POSTS, postId);
    addToPostList(STORAGE_KEYS.CANCELLED_POSTS, postId);
  },

  // 상태 확인
  getRequestId: (postId: string) => getRequestId(postId),
  isApplied: (postId: string) => isInPostList(STORAGE_KEYS.APPLIED_POSTS, postId),
  isCancelled: (postId: string) => isInPostList(STORAGE_KEYS.CANCELLED_POSTS, postId),

  // 디버깅용
  getAllRequestIds: () => getStorageJSON<Record<string, string>>(STORAGE_KEYS.REQUEST_IDS, {}),
  getAppliedPosts: () => getStorageJSON<string[]>(STORAGE_KEYS.APPLIED_POSTS, []),
  getCancelledPosts: () => getStorageJSON<string[]>(STORAGE_KEYS.CANCELLED_POSTS, []),
};

/**
 * 인증 토큰 관리
 */
export const authStorage = {
  getToken: () => getStorageItem(STORAGE_KEYS.ACCESS_TOKEN),
  setToken: (token: string) => setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, token),
  removeToken: () => localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
};

/**
 * 게시글 관리
 */
export const postStorage = {
  markAsDeleted: (postId: string) => addToPostList(STORAGE_KEYS.DELETED_POSTS, postId),
  isDeleted: (postId: string) => isInPostList(STORAGE_KEYS.DELETED_POSTS, postId),
  getDeletedPosts: () => getStorageJSON<string[]>(STORAGE_KEYS.DELETED_POSTS, []),
};
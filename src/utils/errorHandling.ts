/**
 * 에러 처리 유틸리티
 * 백엔드 요청 문서에서 제안한 에러 코드 기반 표준화
 */

// 백엔드 에러 코드 상수 (백엔드 요청 문서 기반)
export const ERROR_CODES = {
  // 참여 신청 관련
  ALREADY_REQUESTED: 'ALREADY_REQUESTED',
  OWN_POST: 'OWN_POST',
  FULL: 'FULL',
  CLOSED: 'CLOSED',
  BANNED: 'BANNED',

  // 참여 취소 관련
  ALREADY_PROCESSED: 'ALREADY_PROCESSED',
  INVALID_STATUS: 'INVALID_STATUS',
  NOT_REQUESTER: 'NOT_REQUESTER',
  NOT_FOUND: 'NOT_FOUND',

  // 권한 관련
  NOT_OWNER: 'NOT_OWNER',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

// 에러 메시지 매핑
export const ERROR_MESSAGES = {
  [ERROR_CODES.ALREADY_REQUESTED]: '이미 참여 신청한 모임입니다.',
  [ERROR_CODES.OWN_POST]: '본인이 작성한 모임에는 신청할 수 없습니다.',
  [ERROR_CODES.FULL]: '모임 정원이 가득 찼습니다.',
  [ERROR_CODES.CLOSED]: '마감된 모임입니다.',
  [ERROR_CODES.BANNED]: '참여가 제한된 모임입니다.',

  [ERROR_CODES.ALREADY_PROCESSED]: '이미 처리된 요청은 취소할 수 없습니다.',
  [ERROR_CODES.INVALID_STATUS]: '잘못된 요청 상태입니다.',
  [ERROR_CODES.NOT_REQUESTER]: '참여 취소 권한이 없습니다.',
  [ERROR_CODES.NOT_FOUND]: '참여 요청을 찾을 수 없습니다.',

  [ERROR_CODES.NOT_OWNER]: '게시글 수정 권한이 없습니다.',
  [ERROR_CODES.UNAUTHORIZED]: '로그인이 필요합니다.',
} as const;

// HTTP 상태 코드별 기본 메시지
const DEFAULT_STATUS_MESSAGES = {
  400: '잘못된 요청입니다.',
  401: '로그인이 필요합니다.',
  403: '권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  409: '요청이 충돌했습니다.',
  500: '서버 오류가 발생했습니다.',
} as const;

/**
 * API 에러 응답 구조
 */
export interface ApiErrorResponse {
  success?: boolean;
  code?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ApiError {
  response?: {
    status: number;
    data: ApiErrorResponse;
    statusText: string;
  };
  request?: unknown;
  message: string;
  name: string;
  isAxiosError?: boolean;
  code?: string;
  config?: {
    url?: string;
    method?: string;
    headers?: Record<string, unknown>;
  };
}

/**
 * 표준화된 에러 처리 함수
 * 백엔드 요청 문서의 에러 구조에 맞춰 처리
 */
export function handleApiError(error: ApiError): {
  message: string;
  statusCode: number | null;
  errorCode: string | null;
  shouldLog: boolean;
} {
  const statusCode = error?.response?.status || null;
  const errorData = error?.response?.data;
  const errorCode = errorData?.code || null;

  // 백엔드에서 제공하는 code 기반 메시지 우선 사용
  let message: string;

  if (errorCode && ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES]) {
    message = ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES];
  } else if (errorData?.message) {
    // 백엔드에서 제공하는 커스텀 메시지
    message = errorData.message;
  } else if (statusCode && DEFAULT_STATUS_MESSAGES[statusCode as keyof typeof DEFAULT_STATUS_MESSAGES]) {
    // HTTP 상태 코드 기반 기본 메시지
    message = DEFAULT_STATUS_MESSAGES[statusCode as keyof typeof DEFAULT_STATUS_MESSAGES];
  } else {
    // 최종 fallback
    message = error.message || '알 수 없는 오류가 발생했습니다.';
  }

  // 개발 환경에서는 모든 에러를 로깅
  const shouldLog = import.meta.env.MODE === 'development' || statusCode === 500;

  return {
    message,
    statusCode,
    errorCode,
    shouldLog,
  };
}

/**
 * 참여 신청 에러 처리 (특화)
 */
export function handleJoinError(error: ApiError): string {
  const { message, statusCode, errorCode } = handleApiError(error);

  // 참여 신청 관련 추가 로깅
  if (statusCode === 400 && errorCode) {
    console.warn(`🚨 [JoinError] 참여 신청 실패:`, {
      errorCode,
      message,
      '해결방안': {
        [ERROR_CODES.ALREADY_REQUESTED]: '이미 신청한 모임인지 확인',
        [ERROR_CODES.OWN_POST]: '본인 작성 게시글인지 확인',
        [ERROR_CODES.FULL]: '모임 정원 확인',
        [ERROR_CODES.CLOSED]: '모임 마감 상태 확인',
        [ERROR_CODES.BANNED]: '사용자 차단 상태 확인',
      }[errorCode] || '백엔드 로그 확인 필요'
    });
  }

  return message;
}

/**
 * 참여 취소 에러 처리 (특화)
 */
export function handleCancelError(error: ApiError): string {
  const { message, statusCode, errorCode } = handleApiError(error);

  // 참여 취소 관련 추가 로깅
  if (statusCode === 400 && errorCode) {
    console.warn(`🚨 [CancelError] 참여 취소 실패:`, {
      errorCode,
      message,
      '해결방안': {
        [ERROR_CODES.ALREADY_PROCESSED]: 'JoinRequest 상태가 pending인지 확인',
        [ERROR_CODES.NOT_REQUESTER]: 'JWT userId와 JoinRequest.requester 일치 여부 확인',
        [ERROR_CODES.NOT_FOUND]: '해당 requestId가 DB에 존재하는지 확인',
      }[errorCode] || '백엔드 로그 확인 필요'
    });
  }

  return message;
}

/**
 * 게시글 수정 에러 처리 (특화)
 */
export function handleEditPostError(error: ApiError): string {
  const { message, statusCode, errorCode } = handleApiError(error);

  // 게시글 수정 관련 추가 로깅
  if (statusCode === 403) {
    console.warn(`🚨 [EditPostError] 게시글 수정 실패:`, {
      errorCode,
      message,
      '해결방안': 'JWT userId와 Post.author 일치 여부 확인 필요'
    });
  }

  return message;
}

/**
 * 상세 에러 로깅 (백엔드 개발자용)
 */
export function logDetailedError(
  error: ApiError,
  context: string,
  additionalInfo?: Record<string, unknown>
): void {
  console.group(`🚨 [${context}] 상세 에러 로그`);

  console.error('📋 기본 정보:', {
    message: error.message,
    name: error.name,
    isAxiosError: error.isAxiosError,
    timestamp: new Date().toISOString(),
  });

  if (error.response) {
    console.error('📡 HTTP 응답 정보:', {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
    });
  }

  if (error.config) {
    console.error('🔗 요청 정보:', {
      method: error.config.method?.toUpperCase(),
      url: error.config.url,
      headers: error.config.headers,
    });
  }

  if (error.request && !error.response) {
    console.error('🌐 네트워크 오류:', {
      message: '서버로부터 응답을 받지 못했습니다',
      request: error.request,
    });
  }

  if (additionalInfo) {
    console.error('➕ 추가 정보:', additionalInfo);
  }

  console.groupEnd();
}
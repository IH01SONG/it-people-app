// 카테고리 관련 유틸리티 함수들

interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  usageCount?: number;
}

/**
 * ObjectId 형식인지 확인하는 함수
 */
export const isObjectId = (v: string): boolean => /^[0-9a-fA-F]{24}$/.test(v);

/**
 * 카테고리 데이터에서 표시용 이름을 안전하게 추출하는 함수
 * 서버에서 오는 다양한 형태의 카테고리 데이터를 처리
 */
export const displayCategoryName = (
  category: string | Category | null | undefined,
  idToName?: Record<string, string>
): string => {
  // 1) 객체 형태 (populate된 경우)
  if (category && typeof category === 'object') {
    return category.name ?? '기타';
  }

  // 2) 문자열 형태
  if (typeof category === 'string') {
    // ObjectId 형태인 경우 매핑에서 찾기
    if (isObjectId(category)) {
      return idToName?.[category] ?? '기타';
    }
    // 직접 이름인 경우
    return category || '기타';
  }

  // 3) null/undefined인 경우
  return '기타';
};

/**
 * 카테고리 데이터에서 ID를 추출하는 함수
 * POST/PUT 요청 시 categoryId로 전송하기 위해 사용
 */
export const extractCategoryId = (category: string | Category): string => {
  // 1) 객체 형태인 경우 _id 추출
  if (category && typeof category === 'object') {
    return category._id || '';
  }

  // 2) 문자열이고 ObjectId 형태인 경우 그대로 반환
  if (typeof category === 'string' && isObjectId(category)) {
    return category;
  }

  // 3) 그 외의 경우 빈 문자열
  return '';
};

export type { Category };
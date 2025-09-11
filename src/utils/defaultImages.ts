// 카테고리별 기본 이미지 매핑
export interface DefaultImageMap {
  [key: string]: string[];
}

export const DEFAULT_IMAGES: DefaultImageMap = {
  자기개발: [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop&crop=center", // 스터디 그룹
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop&crop=center", // 스터디 모임
    "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop&crop=center", // 책과 노트북
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=center", // 독서
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop&crop=center", // 공부
  ],
  봉사활동: [
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=250&fit=crop&crop=center", // 봉사활동
    "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=250&fit=crop&crop=center", // 자원봉사
    "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=250&fit=crop&crop=center", // 도움
    "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=250&fit=crop&crop=center", // 나눔
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=250&fit=crop&crop=center", // 공동체
  ],
  "운동/스포츠": [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&crop=center", // 러닝
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop&crop=center", // 헬스장
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop&crop=center", // 요가
    "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400&h=250&fit=crop&crop=center", // 농구
    "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=250&fit=crop&crop=center", // 그룹 운동
  ],
  "문화/예술": [
    "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=250&fit=crop&crop=center", // 미술관
    "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=250&fit=crop&crop=center", // 공연장
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&crop=center", // 콘서트
    "https://images.unsplash.com/photo-1481886756534-97af88ccb438?w=400&h=250&fit=crop&crop=center", // 전시회
    "https://images.unsplash.com/photo-1594736797933-d0d617de1ac6?w=400&h=250&fit=crop&crop=center", // 예술 활동
  ],
  "사교/인맥": [
    "https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=250&fit=crop&crop=center", // 사람들 모임
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=250&fit=crop&crop=center", // 그룹 미팅
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=250&fit=crop&crop=center", // 친구들
    "https://images.unsplash.com/photo-1552581234-26160f608093?w=400&h=250&fit=crop&crop=center", // 네트워킹
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=250&fit=crop&crop=center", // 토론
  ],
  취미: [
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=250&fit=crop&crop=center", // 보드게임
    "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=250&fit=crop&crop=center", // 카드게임
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&crop=center", // 취미 활동
    "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=250&fit=crop&crop=center", // 게임 컨트롤러
    "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=250&fit=crop&crop=center", // 게임 모임
  ],
  외국어: [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop&crop=center", // 어학 공부
    "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=250&fit=crop&crop=center", // 언어 교환
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop&crop=center", // 언어 학습
    "https://images.unsplash.com/photo-1488998427799-e3362cec87c3?w=400&h=250&fit=crop&crop=center", // 글로벌 소통
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop&crop=center", // 문화 교류
  ],
  맛집: [
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=250&fit=crop&crop=center", // 음식점 내부
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=250&fit=crop&crop=center", // 버거
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=250&fit=crop&crop=center", // 피자
    "https://images.unsplash.com/photo-1563379091339-03246784d388?w=400&h=250&fit=crop&crop=center", // 파스타
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop&crop=center", // 레스토랑 음식
  ],
  반려동물: [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=250&fit=crop&crop=center", // 강아지
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=250&fit=crop&crop=center", // 고양이
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=250&fit=crop&crop=center", // 펫샵
    "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=250&fit=crop&crop=center", // 반려동물 산책
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=250&fit=crop&crop=center", // 반려동물과 함께
  ],
};

/**
 * 카테고리에 따른 기본 이미지를 랜덤하게 선택하여 반환
 * @param category - 모임 카테고리
 * @returns 기본 이미지 URL 또는 null (카테고리가 없는 경우)
 */
export function getDefaultImageForCategory(category: string): string | null {
  const categoryImages = DEFAULT_IMAGES[category];
  if (!categoryImages || categoryImages.length === 0) {
    return null;
  }

  // 랜덤하게 이미지 선택
  const randomIndex = Math.floor(Math.random() * categoryImages.length);
  return categoryImages[randomIndex];
}

/**
 * 모든 카테고리 목록 반환
 * @returns 사용 가능한 카테고리 배열
 */
export function getAvailableCategories(): string[] {
  return Object.keys(DEFAULT_IMAGES);
}

/**
 * 특정 카테고리의 모든 이미지 반환
 * @param category - 모임 카테고리
 * @returns 해당 카테고리의 모든 이미지 URL 배열
 */
export function getAllImagesForCategory(category: string): string[] {
  return DEFAULT_IMAGES[category] || [];
}

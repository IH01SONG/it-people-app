// 카테고리별 기본 이미지 매핑
export interface DefaultImageMap {
  [key: string]: string[];
}

export const DEFAULT_IMAGES: DefaultImageMap = {
  "식사": [
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=250&fit=crop&crop=center", // 음식점 내부
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=250&fit=crop&crop=center", // 버거
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=250&fit=crop&crop=center", // 피자
    "https://images.unsplash.com/photo-1563379091339-03246784d388?w=400&h=250&fit=crop&crop=center", // 파스타
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop&crop=center"  // 레스토랑 음식
  ],
  "카페/디저트": [
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=250&fit=crop&crop=center", // 카페 라떼
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=250&fit=crop&crop=center", // 카페 인테리어
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&crop=center", // 디저트
    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=250&fit=crop&crop=center", // 커피와 케이크
    "https://images.unsplash.com/photo-1549297161-14b43247ed5c?w=400&h=250&fit=crop&crop=center"  // 마카롱
  ],
  "스터디/코딩": [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop&crop=center", // 스터디 그룹
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=250&fit=crop&crop=center", // 코딩
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=250&fit=crop&crop=center", // 코딩 화면
    "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop&crop=center", // 책과 노트북
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop&crop=center"  // 스터디 모임
  ],
  "게임": [
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=250&fit=crop&crop=center", // 보드게임
    "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=250&fit=crop&crop=center", // 게임 컨트롤러
    "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=250&fit=crop&crop=center", // 게임 모임
    "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=250&fit=crop&crop=center", // 체스
    "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=250&fit=crop&crop=center"  // 카드게임
  ],
  "쇼핑": [
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=250&fit=crop&crop=center", // 쇼핑몰
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=250&fit=crop&crop=center", // 쇼핑백
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop&crop=center", // 의류 쇼핑
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop&crop=center", // 상점 거리
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop&crop=center"  // 시장
  ],
  "영화/문화": [
    "https://images.unsplash.com/photo-1489185078141-fc3abda6eca7?w=400&h=250&fit=crop&crop=center", // 영화관
    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=250&fit=crop&crop=center", // 영화 포스터
    "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=250&fit=crop&crop=center", // 극장
    "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=250&fit=crop&crop=center", // 미술관
    "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=250&fit=crop&crop=center"  // 공연장
  ],
  "운동": [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&crop=center", // 러닝
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop&crop=center", // 헬스장
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop&crop=center", // 요가
    "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400&h=250&fit=crop&crop=center", // 농구
    "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=250&fit=crop&crop=center"  // 그룹 운동
  ],
  "기타": [
    "https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=250&fit=crop&crop=center", // 사람들 모임
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=250&fit=crop&crop=center", // 그룹 미팅
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=250&fit=crop&crop=center", // 친구들
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=250&fit=crop&crop=center", // 토론
    "https://images.unsplash.com/photo-1552581234-26160f608093?w=400&h=250&fit=crop&crop=center"  // 네트워킹
  ]
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
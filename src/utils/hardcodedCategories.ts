// 하드코딩된 카테고리 매핑 (step1에서 선택한 것들과 일치)
export const HARDCODED_CATEGORIES = {
  '68c3bdd957c06e06e2706f85': { name: '자기계발', icon: '📚' },
  '68c3bdd957c06e06e2706f86': { name: '봉사활동', icon: '🤝' },
  '68c3bdd957c06e06e2706f9a': { name: '운동/스포츠', icon: '🏃‍♂️' },
  '68c3bdd957c06e2706f9d': { name: '문화/예술', icon: '🎨' },
  '68c3bdd957c06e06e2706f9e': { name: '사교/인맥', icon: '👥' },
  '68c3bdd957c06e06e2706f87': { name: '취미', icon: '🎯' },
  '68c3bdd957c06e06e2706f88': { name: '외국어', icon: '🌍' },
  '68c3bdd957c06e06e2706f9c': { name: '맛집', icon: '🍽️' },
  '68c3bdd957c06e06e2706fa1': { name: '반려동물', icon: '🐕' },
  '68c3bdd957c06e06e2706fa0': { name: '기타', icon: '📍' },
} as const;

/**
 * 카테고리를 일관된 형태로 표시하는 함수 (하드코딩)
 * step1에서 선택한 카테고리들과 동일하게 표시됨
 */
export function getCategoryDisplay(category: unknown): string {
  // 1. 객체 형태의 카테고리
  if (category && typeof category === "object") {
    const anyCat = category as Record<string, unknown>;
    const id = anyCat._id || anyCat.id;
    if (id && typeof id === "string" && HARDCODED_CATEGORIES[id as keyof typeof HARDCODED_CATEGORIES]) {
      const cat = HARDCODED_CATEGORIES[id as keyof typeof HARDCODED_CATEGORIES];
      return `${cat.icon} ${cat.name}`;
    }
    // 이름이 직접 있는 경우
    if (anyCat.name && typeof anyCat.name === "string") {
      const found = Object.values(HARDCODED_CATEGORIES).find(c => c.name === anyCat.name);
      if (found) return `${found.icon} ${found.name}`;
    }
  }

  // 2. 문자열 형태의 카테고리 (ID 또는 이름)
  if (typeof category === "string") {
    // ID로 찾기
    if (HARDCODED_CATEGORIES[category as keyof typeof HARDCODED_CATEGORIES]) {
      const cat = HARDCODED_CATEGORIES[category as keyof typeof HARDCODED_CATEGORIES];
      return `${cat.icon} ${cat.name}`;
    }
    // 이름으로 찾기
    const found = Object.values(HARDCODED_CATEGORIES).find(c => c.name === category);
    if (found) return `${found.icon} ${found.name}`;
  }

  // 3. 기본값
  return "📍 기타";
}

/**
 * 카테고리 이름만 반환하는 함수
 */
export function getCategoryName(category: unknown): string {
  const display = getCategoryDisplay(category);
  return display.split(' ').slice(1).join(' '); // 이모지 제거
}

/**
 * 카테고리 아이콘만 반환하는 함수
 */
export function getCategoryIcon(category: unknown): string {
  const display = getCategoryDisplay(category);
  return display.split(' ')[0]; // 첫 번째 부분(이모지)만 반환
}
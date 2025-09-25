// 카테고리 타입 import
import type { Category } from '../utils/category';

// Category 타입을 외부에서 사용할 수 있도록 re-export
export type { Category };

// 앱에서 사용하는 카테고리 정의 (서버 스키마와 일치)
export const CATEGORIES: Category[] = [
  { _id: '68c3bdd957c06e06e2706f85', name: '자기계발', icon: '📚' },
  { _id: '68c3bdd957c06e06e2706f86', name: '봉사활동', icon: '🤝' },
  { _id: '68c3bdd957c06e06e2706f9a', name: '운동/스포츠', icon: '🏃‍♂️' },
  { _id: '68c3bdd957c06e06e2706f9d', name: '문화/예술', icon: '🎨' },
  { _id: '68c3bdd957c06e06e2706f9e', name: '사교/인맥', icon: '👥' },
  { _id: '68c3bdd957c06e06e2706f87', name: '취미', icon: '🎯' },
  { _id: '68c3bdd957c06e06e2706f88', name: '외국어', icon: '🌍' },
  { _id: '68c3bdd957c06e06e2706f9c', name: '맛집', icon: '🍽️' },
  { _id: '68c3bdd957c06e06e2706fa1', name: '반려동물', icon: '🐕' },
  { _id: '68c3bdd957c06e06e2706fa0', name: '기타', icon: '📍' },
];

// ID로 이름을 찾는 매핑
export const CATEGORY_ID_TO_NAME = Object.fromEntries(
  CATEGORIES.map(c => [c._id, c.name])
);

// 이름으로 ID를 찾는 매핑
export const CATEGORY_NAME_TO_ID = Object.fromEntries(
  CATEGORIES.map(c => [c.name, c._id])
);

// 이름으로 아이콘을 찾는 매핑 (하위 호환성)
export const CATEGORY_ICON_BY_NAME = Object.fromEntries(
  CATEGORIES.map(c => [c.name, c.icon || '📍'])
);

// 하위 호환성을 위한 레거시 함수들 (새 코드에서는 utils/category.ts 사용 권장)

/**
 * @deprecated utils/category.ts의 displayCategoryName 사용 권장
 */
export function displayCategoryName(category: unknown): string {
  if (category && typeof category === "object") {
    const anyCat = category as any;
    if (anyCat.name) return String(anyCat.name);
    if (anyCat._id && CATEGORY_ID_TO_NAME[anyCat._id]) return CATEGORY_ID_TO_NAME[anyCat._id];
    if (anyCat.id && CATEGORY_ID_TO_NAME[anyCat.id]) return CATEGORY_ID_TO_NAME[anyCat.id];
  }
  if (typeof category === "string") {
    if (CATEGORY_ID_TO_NAME[category]) return CATEGORY_ID_TO_NAME[category];
    const byName = CATEGORIES.find(c => c.name === category);
    if (byName) return byName.name;
  }
  return "기타";
}

/**
 * @deprecated CATEGORY_ICON_BY_NAME 직접 사용 권장
 */
export function emojiByCategoryName(name: string): string {
  return CATEGORY_ICON_BY_NAME[name] ?? "📍";
}
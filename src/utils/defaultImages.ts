// src/utils/defaultImages.ts
// 카테고리별 기본 이미지 매핑 유틸리티

export const getDefaultImageByCategory = (categoryId: string): string => {
  const defaultImages: { [key: string]: string } = {
    // 자기계발 - 책, 공부, 성장 관련
    '68c3bdd957c06e06e2706f85': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&crop=center',

    // 봉사활동 - 손을 맞잡는 모습, 도움
    '68c3bdd957c06e06e2706f86': 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop&crop=center',

    // 운동/스포츠 - 운동하는 모습
    '68c3bdd957c06e06e2706f9a': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',

    // 문화/예술 - 미술관, 문화활동
    '68c3bdd957c06e06e2706f9d': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop&crop=center',

    // 사교/인맥 - 사람들이 모인 모습
    '68c3bdd957c06e06e2706f9e': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop&crop=center',

    // 취미 - 다양한 취미활동
    '68c3bdd957c06e06e2706f87': 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400&h=300&fit=crop&crop=center',

    // 외국어 - 언어학습, 대화
    '68c3bdd957c06e06e2706f88': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center',

    // 맛집 - 음식, 식당
    '68c3bdd957c06e06e2706f9c': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center',

    // 반려동물 - 강아지, 고양이
    '68c3bdd957c06e06e2706fa1': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop&crop=center',
  };

  return defaultImages[categoryId] || defaultImages['68c3bdd957c06e06e2706fa1']; // 기본값은 '반려동물' 카테고리 이미지
};
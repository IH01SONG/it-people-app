// src/utils/categoryName.ts
export function toCategoryName(cat: string | { name?: string } | null | undefined): string {
  if (!cat) return '';
  if (typeof cat === 'string') return cat;
  return cat.name ?? '';
}
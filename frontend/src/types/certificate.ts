export interface Certificate {
  id: number;
  category: string;
  nameKo: string;
  nameEn: string | null;
  nameJa: string | null;
  nameZh: string | null;
  fee: number | null;
  active: boolean;
}

export type Language = 'ko' | 'en' | 'ja' | 'zh';

export type AccessibilityMode = {
  ttsEnabled: boolean;
  zoomEnabled: boolean;
  highContrast: boolean;
};

// 카테고리 한글 레이블 매핑
export const CATEGORY_LABELS: Record<string, string> = {
  주민등록: '주민등록',
  가족관계: '가족관계',
  부동산: '부동산',
  세금: '세금',
  건강보험: '건강보험',
};

// 자주 찾는 증명서 (메인 페이지 고정 표시)
export const FAVORITE_CERTIFICATE_NAMES = [
  '주민등록등본',
  '가족관계증명서',
  '부동산등기사항증명서',
];

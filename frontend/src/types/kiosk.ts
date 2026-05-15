// ── 기본 타입 ──────────────────────────────────
export type Language  = 'ko' | 'en' | 'ja' | 'zh';
export type KioskStep = 1 | 2 | 3 | 4 | 5;

// ── 증명서 타입 (백엔드 CertificateResponse 와 1:1) ──
export interface Certificate {
  id:       string;
  category: string;
  nameKo:   string;
  nameEn?:  string;
  nameJa?:  string;
  nameZh?:  string;
  category: CertificateCategory;
  fee:      number;
}

/** 현재 언어에 맞는 증명서명 반환 */
export function getCertName(cert: Certificate, lang: Language): string {
  switch (lang) {
    case 'en': return cert.nameEn ?? cert.nameKo;
    case 'ja': return cert.nameJa ?? cert.nameKo;
    case 'zh': return cert.nameZh ?? cert.nameKo;
    default:   return cert.nameKo;
  }
}

// ── 카테고리 타입 ───────────────────────────────
export type CertificateCategory =
  | '주민등록' | '부동산' | '세금' | '복지' | '보험/연금' | '차량'
  | '지적,토지,건축' | '농지대장,농업경영체' | '가족관계등록부'
  | '제적부' | '병적증명서' | '지방세' | '어선원부' | '교육제증명'
  | '국세증명' | '건강보험' | '고용,산재보험' | '여권' | '국민연금';

// ── 앱 상태 ─────────────────────────────────────
export interface KioskState {
  language:             Language;
  currentStep:          KioskStep;
  selectedCertificate:  Certificate | null;
  isAccessibilityMode:  boolean;
  isMagnified:          boolean;
  residentId:           string;
}

// ── UI 상수 (DB에서 오지 않는 값들) ────────────

/** 메인 화면 "자주 찾는 증명서" id 목록 (순서 포함) */
export const QUICK_CERT_IDS: string[] = [
  '1',  // 주민등록등본
  '3',  // 가족관계증명서
  '14',  // 부동산등기사항증명서
];

/** 2-1 전체보기 카테고리 그리드 순서 */
export const ALL_CATEGORIES: CertificateCategory[] = [
  '주민등록', '지적,토지,건축', '차량',
  '복지', '농지대장,농업경영체', '가족관계등록부',
  '제적부', '병적증명서', '지방세',
  '어선원부', '부동산', '교육제증명',
  '국세증명', '건강보험', '고용,산재보험',
  '여권', '국민연금',
];

/** 2-2 카테고리 검색 탭 순서 */
export const CATEGORY_TABS: CertificateCategory[] = [
  '주민등록', '부동산', '세금', '복지', '보험/연금', '차량',
];

/** 카테고리 다국어 레이블 */
export const CATEGORY_LABELS: Record<string, Record<Language, string>> = {
  '주민등록':  { ko: '주민등록',  en: 'Resident',   ja: '住民登録',  zh: '居民登记'  },
  '부동산':    { ko: '부동산',    en: 'Real Estate', ja: '不動産',    zh: '不动产'    },
  '세금':      { ko: '세금',      en: 'Tax',         ja: '税金',      zh: '税务'      },
  '복지':      { ko: '복지',      en: 'Welfare',     ja: '福祉',      zh: '福利'      },
  '보험/연금': { ko: '보험/연금', en: 'Insurance',   ja: '保険/年金', zh: '保险/年金' },
  '차량':      { ko: '차량',      en: 'Vehicle',     ja: '車両',      zh: '车辆'      },
};

/** 단계 표시 레이블 */
export const STEP_LABELS: Record<Language, string[]> = {
  ko: ['메뉴 선택', '증명서 선택', '본인 확인', '발급'],
  en: ['Select Menu', 'Select Document', 'Identity', 'Issue'],
  ja: ['メニュー選択', '証明書選択', '本人確認', '発行'],
  zh: ['选择菜单', '选择证明', '身份确认', '发证'],
};
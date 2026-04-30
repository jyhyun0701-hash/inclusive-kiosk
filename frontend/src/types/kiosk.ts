// ────────────────────────────────────────────────
//  Shared types for the Kiosk application
// ────────────────────────────────────────────────

export type Language = 'ko' | 'en' | 'ja' | 'zh';

export type KioskStep = 1 | 2 | 3 | 4;

export interface Certificate {
  id: string;
  nameKo: string;
  nameEn?: string;
  category: CertificateCategory;
  fee: number; // 원
}

export type CertificateCategory =
  | '주민등록'
  | '부동산'
  | '세금'
  | '복지'
  | '보험/연금'
  | '차량'
  | '지적,토지,건축'
  | '농지대장,농업경영체'
  | '가족관계등록부'
  | '제적부'
  | '병적증명서'
  | '지방세'
  | '어선원부'
  | '교육제증명'
  | '국세증명'
  | '건강보험'
  | '고용,산재보험'
  | '여권'
  | '국민연금';

export interface KioskState {
  language: Language;
  currentStep: KioskStep;
  selectedCertificate: Certificate | null;
  isAccessibilityMode: boolean; // TTS on/off
  isMagnified: boolean;
  residentId: string;
}

export const QUICK_CERTIFICATES: Certificate[] = [
  { id: 'resident-copy', nameKo: '주민등록등본', nameEn: 'Certificate of Residence', category: '주민등록', fee: 400 },
  { id: 'family-register', nameKo: '가족관계등록부', nameEn: 'Family Relation Certificate', category: '가족관계등록부', fee: 1000 },
  { id: 'real-estate', nameKo: '부동산등기사항증명서', nameEn: 'Real Estate Certificate', category: '부동산', fee: 1000 },
];

export const ALL_CATEGORIES: CertificateCategory[] = [
  '주민등록', '지적,토지,건축', '차량',
  '복지', '농지대장,농업경영체', '가족관계등록부',
  '제적부', '병적증명서', '지방세',
  '어선원부', '부동산', '교육제증명',
  '국세증명', '건강보험', '고용,산재보험',
  '여권', '국민연금',
];

export const CATEGORY_TABS: CertificateCategory[] = [
  '주민등록', '부동산', '세금', '복지', '보험/연금', '차량',
];

export const CERTIFICATES_BY_CATEGORY: Record<string, Certificate[]> = {
  '주민등록': [
    { id: 'resident-copy', nameKo: '주민등록등본', category: '주민등록', fee: 400 },
    { id: 'resident-abstract', nameKo: '주민등록초본', category: '주민등록', fee: 400 },
    { id: 'family-cert', nameKo: '가족관계증명서', category: '주민등록', fee: 1000 },
    { id: 'basic-cert', nameKo: '기본증명서', category: '주민등록', fee: 1000 },
    { id: 'marriage-cert', nameKo: '혼인관계증명서', category: '주민등록', fee: 1000 },
    { id: 'register-cert', nameKo: '제적부', category: '주민등록', fee: 1000 },
  ],
  '부동산': [
    { id: 'real-estate', nameKo: '부동산등기사항증명서', category: '부동산', fee: 1000 },
    { id: 'cadastral', nameKo: '지적도', category: '부동산', fee: 700 },
    { id: 'building', nameKo: '건축물대장', category: '부동산', fee: 500 },
  ],
  '세금': [
    { id: 'tax-cert', nameKo: '납세증명서', category: '세금', fee: 600 },
    { id: 'income-cert', nameKo: '소득금액증명', category: '세금', fee: 600 },
  ],
  '복지': [
    { id: 'disability', nameKo: '장애인증명서', category: '복지', fee: 0 },
    { id: 'welfare', nameKo: '의료급여확인서', category: '복지', fee: 0 },
  ],
  '보험/연금': [
    { id: 'health-ins', nameKo: '건강보험료납부확인서', category: '건강보험', fee: 600 },
    { id: 'pension', nameKo: '국민연금가입증명', category: '국민연금', fee: 600 },
  ],
  '차량': [
    { id: 'car-reg', nameKo: '자동차등록원부', category: '차량', fee: 1000 },
  ],
};

export const ALL_CERTIFICATES: Certificate[] = [
  ...CERTIFICATES_BY_CATEGORY['주민등록'],
  ...CERTIFICATES_BY_CATEGORY['부동산'],
  ...CERTIFICATES_BY_CATEGORY['세금'],
  ...CERTIFICATES_BY_CATEGORY['복지'],
  ...CERTIFICATES_BY_CATEGORY['보험/연금'],
  ...CERTIFICATES_BY_CATEGORY['차량'],
];

export const STEP_LABELS: Record<Language, string[]> = {
  ko: ['메뉴 선택', '증명서 선택', '본인 확인', '발급'],
  en: ['Select Menu', 'Select Document', 'Identity', 'Issue'],
  ja: ['メニュー選択', '証明書選択', '本人確認', '発行'],
  zh: ['选择菜单', '选择证明', '身份确认', '发证'],
};

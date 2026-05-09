// ────────────────────────────────────────────────
//  Shared types for the Kiosk application
// ────────────────────────────────────────────────

export type Language = 'ko' | 'en' | 'ja' | 'zh';

export type KioskStep = 1 | 2 | 3 | 4 | 5;

export interface Certificate {
  id: string;
  nameKo: string;
  nameEn?: string;
  nameJa?: string;
  nameZh?: string;
  category: CertificateCategory;
  fee: number; // 원
}

/** 현재 언어에 맞는 증명서명 반환 (번역 없으면 한국어 폴백) */
export function getCertName(cert: Certificate, lang: Language): string {
  switch (lang) {
    case 'en': return cert.nameEn ?? cert.nameKo;
    case 'ja': return cert.nameJa ?? cert.nameKo;
    case 'zh': return cert.nameZh ?? cert.nameKo;
    default:   return cert.nameKo;
  }
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
  {
    id: 'resident-copy',
    nameKo: '주민등록등본', nameEn: 'Certificate of Residence',
    nameJa: '住民票の写し',        nameZh: '住民登记副本',
    category: '주민등록', fee: 400,
  },
  {
    id: 'family-register',
    nameKo: '가족관계등록부', nameEn: 'Family Relation Certificate',
    nameJa: '家族関係登録部',       nameZh: '家族关系证明书',
    category: '가족관계등록부', fee: 1000,
  },
  {
    id: 'real-estate',
    nameKo: '부동산등기사항증명서', nameEn: 'Real Estate Certificate',
    nameJa: '不動産登記事項証明書', nameZh: '不动产登记证明书',
    category: '부동산', fee: 1000,
  },
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

/** CategorySearchPage 카테고리 버튼 표시용 다국어 레이블 */
export const CATEGORY_LABELS: Record<string, Record<Language, string>> = {
  '주민등록': { ko: '주민등록', en: 'Resident',    ja: '住民登録',   zh: '居民登记' },
  '부동산':   { ko: '부동산',   en: 'Real Estate', ja: '不動産',     zh: '不动产'   },
  '세금':     { ko: '세금',     en: 'Tax',         ja: '税金',       zh: '税务'     },
  '복지':     { ko: '복지',     en: 'Welfare',     ja: '福祉',       zh: '福利'     },
  '보험/연금': { ko: '보험/연금', en: 'Insurance',  ja: '保険/年金',  zh: '保险/年金' },
  '차량':     { ko: '차량',     en: 'Vehicle',     ja: '車両',       zh: '车辆'     },
};

export const CERTIFICATES_BY_CATEGORY: Record<string, Certificate[]> = {
  '주민등록': [
    { id: 'resident-copy',     nameKo: '주민등록등본',   nameEn: 'Certificate of Residence',      nameJa: '住民票の写し',        nameZh: '住民登记副本',     category: '주민등록', fee: 400  },
    { id: 'resident-abstract', nameKo: '주민등록초본',   nameEn: 'Resident Registration Abstract', nameJa: '住民票の抄本',        nameZh: '住民登记摘本',     category: '주민등록', fee: 400  },
    { id: 'family-cert',       nameKo: '가족관계증명서', nameEn: 'Family Relation Certificate',    nameJa: '家族関係証明書',      nameZh: '家庭关系证明书',   category: '주민등록', fee: 1000 },
    { id: 'basic-cert',        nameKo: '기본증명서',     nameEn: 'Basic Certificate',              nameJa: '基本証明書',          nameZh: '基本证明书',       category: '주민등록', fee: 1000 },
    { id: 'marriage-cert',     nameKo: '혼인관계증명서', nameEn: 'Marriage Certificate',           nameJa: '婚姻関係証明書',      nameZh: '婚姻关系证明书',   category: '주민등록', fee: 1000 },
    { id: 'register-cert',     nameKo: '제적부',         nameEn: 'Household Register',             nameJa: '除籍部',              nameZh: '户籍注销证明',     category: '주민등록', fee: 1000 },
  ],
  '부동산': [
    { id: 'real-estate', nameKo: '부동산등기사항증명서', nameEn: 'Real Estate Certificate', nameJa: '不動産登記事項証明書', nameZh: '不动产登记证明书', category: '부동산', fee: 1000 },
    { id: 'cadastral',   nameKo: '지적도',               nameEn: 'Cadastral Map',           nameJa: '地籍図',               nameZh: '地籍图',           category: '부동산', fee: 700  },
    { id: 'building',    nameKo: '건축물대장',            nameEn: 'Building Register',       nameJa: '建築物台帳',           nameZh: '建筑物台账',       category: '부동산', fee: 500  },
  ],
  '세금': [
    { id: 'tax-cert',    nameKo: '납세증명서',  nameEn: 'Tax Payment Certificate', nameJa: '納税証明書',    nameZh: '纳税证明书', category: '세금', fee: 600 },
    { id: 'income-cert', nameKo: '소득금액증명', nameEn: 'Income Certificate',      nameJa: '所得金額証明', nameZh: '收入证明',   category: '세금', fee: 600 },
  ],
  '복지': [
    { id: 'disability', nameKo: '장애인증명서',  nameEn: 'Disability Certificate',      nameJa: '障害者証明書',   nameZh: '残疾人证明书',     category: '복지', fee: 0 },
    { id: 'welfare',    nameKo: '의료급여확인서', nameEn: 'Medical Benefit Verification', nameJa: '医療給付確認書', nameZh: '医疗给付确认书',   category: '복지', fee: 0 },
  ],
  '보험/연금': [
    { id: 'health-ins', nameKo: '건강보험료납부확인서', nameEn: 'Health Insurance Certificate',   nameJa: '健康保険料納付確認書', nameZh: '健康保险费缴纳确认书', category: '건강보험', fee: 600 },
    { id: 'pension',    nameKo: '국민연금가입증명',     nameEn: 'National Pension Certificate',   nameJa: '国民年金加入証明',     nameZh: '国民年金参加证明',     category: '국민연금', fee: 600 },
  ],
  '차량': [
    { id: 'car-reg', nameKo: '자동차등록원부', nameEn: 'Vehicle Registration Certificate', nameJa: '自動車登録原簿', nameZh: '汽车登记原簿', category: '차량', fee: 1000 },
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

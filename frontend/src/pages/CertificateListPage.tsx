import React, { useState } from 'react';
import StepIndicator from '../components/common/StepIndicator';
import BottomBar from '../components/common/BottomBar';
import InfoModal from '../components/common/InfoModal';
import { type Language, type Certificate, ALL_CERTIFICATES } from '../types/kiosk';

interface CertificateListPageProps {
  language: Language;
  isTtsOn: boolean;
  isMagnified: boolean;
  onHome: () => void;
  onToggleTts: () => void;
  onToggleMagnify: () => void;
  onCategorySearchClick: () => void;
  onCertificateSelect: (cert: Certificate) => void;
  onSearchClick: () => void;
}

const HEADER: Record<Language, string> = {
  ko: '발급을 원하시는 메뉴를 선택해주십시오.',
  en: 'Please select the document you want.',
  ja: '発行をご希望のメニューをお選びください。',
  zh: '请选择您想要的证明书。',
};
const LABEL_CATEGORY: Record<Language, string> = {
  ko: '카테고리 검색', en: 'Category', ja: 'カテゴリ検索', zh: '分类检索',
};
const LABEL_SEARCH: Record<Language, string> = {
  ko: '증명서 검색', en: 'Document Search', ja: '証明書検索', zh: '证明书检索',
};

const CertificateListPage: React.FC<CertificateListPageProps> = ({
  language, isTtsOn, isMagnified,
  onHome, onToggleTts, onToggleMagnify,
  onCategorySearchClick, onCertificateSelect, onSearchClick,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="kiosk-root">
      <header className="kiosk-header">
        <StepIndicator currentStep={2} language={language} />
        <div className="header-title">{HEADER[language]}</div>
      </header>

      <main className="kiosk-content">
        {/* 상단 검색 타입 2버튼 */}
        <div className="search-type-row">
          <button className="search-type-btn" onClick={onCategorySearchClick}>
            🔍 {LABEL_CATEGORY[language]}
          </button>
          <button className="search-type-btn" onClick={onSearchClick}>
            🔍 {LABEL_SEARCH[language]}
          </button>
        </div>

        {/* 전체 증명서 그리드 */}
        <div className="all-category-grid">
          {ALL_CERTIFICATES.map((cert) => (
            <button
              key={cert.id}
              className="all-category-btn"
              onClick={() => onCertificateSelect(cert)}
              aria-label={cert.nameKo}
            >
              {cert.nameKo}
            </button>
          ))}
        </div>
      </main>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      <BottomBar
        language={language}
        isTtsOn={isTtsOn}
        isMagnified={isMagnified}
        onHome={onHome}
        onInfo={() => setShowInfo(true)}
        onToggleTts={onToggleTts}
        onToggleMagnify={onToggleMagnify}
      />
    </div>
  );
};

export default CertificateListPage;

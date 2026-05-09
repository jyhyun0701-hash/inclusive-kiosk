import React, { useState } from 'react';
import { useMagnify } from '../hooks/useMagnify';
import NavPad from '../components/common/NavPad';
import StepIndicator from '../components/common/StepIndicator';
import BottomBar from '../components/common/BottomBar';
import InfoModal from '../components/common/InfoModal';
import imgSearch from '../assets/images/search.png';
import { type Language, type Certificate, ALL_CERTIFICATES, getCertName } from '../types/kiosk';

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
  const { wrapRef, innerRef, navigate } = useMagnify(isMagnified);

  return (
    <div className="kiosk-root">
      <header className="kiosk-header">
        <StepIndicator currentStep={2} language={language} />
        <div className="header-title">{HEADER[language]}</div>
      </header>

      <main className="kiosk-content">
        {isMagnified && <NavPad onNavigate={navigate} />}
        <div ref={wrapRef} className="content-scroll-wrap">
          <div ref={innerRef} className="content-wrap-list">
          {/* 상단 검색 타입 2버튼 */}
          <div className="search-type-row">
            <button
              className="search-type-btn"
              onClick={onCategorySearchClick}
              data-tabfocus="Y"
              data-tabgroup="cert-list-top"
              data-ttsmsg={LABEL_CATEGORY[language]}
              tabIndex={0}
            >
               <img src={imgSearch} alt="search" />
               {LABEL_CATEGORY[language]}
            </button>
            <button
              className="search-type-btn"
              onClick={onSearchClick}
              data-tabfocus="Y"
              data-tabgroup="cert-list-top"
              data-ttsmsg={LABEL_SEARCH[language]}
              tabIndex={1}
            >
              <img src={imgSearch} alt="search" />
              {LABEL_SEARCH[language]}
            </button>
          </div>

          {/* 전체 증명서 그리드 */}
          <div className="all-category-grid">
            {ALL_CERTIFICATES.map((cert, idx) => (
              <button
                key={cert.id}
                className="all-category-btn"
                onClick={() => onCertificateSelect(cert)}
                aria-label={cert.nameKo}
                data-tabfocus="Y"
                data-tabgroup="cert-list"
                data-ttsmsg={getCertName(cert, language)}
                tabIndex={idx}
              >
                {getCertName(cert, language)}
              </button>
            ))}
          </div>
          </div>
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

import React, { useState } from 'react';
import StepIndicator from '../components/common/StepIndicator';
import BottomBar from '../components/common/BottomBar';
import ConfirmationModal from '../components/common/ConfirmationModal';
import InfoModal from '../components/common/InfoModal';
import {
  type Language, type Certificate, type CertificateCategory,
  CATEGORY_TABS, CERTIFICATES_BY_CATEGORY,
} from '../types/kiosk';

interface CategorySearchPageProps {
  language: Language;
  isTtsOn: boolean;
  isMagnified: boolean;
  initialCategory?: CertificateCategory;
  onHome: () => void;
  onToggleTts: () => void;
  onToggleMagnify: () => void;
  onCertificateConfirmed: (cert: Certificate) => void;
  onSearchClick: () => void;
}

const HEADER: Record<Language, string> = {
  ko: '발급을 원하시는 증명서를 선택하십시오.',
  en: 'Please select the certificate to issue.',
  ja: '発行をご希望の証明書をお選びください。',
  zh: '请选择要发证的证明书。',
};

const CategorySearchPage: React.FC<CategorySearchPageProps> = ({
  language, isTtsOn, isMagnified,
  initialCategory, onHome, onToggleTts, onToggleMagnify,
  onCertificateConfirmed, onSearchClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CertificateCategory | null>(
    initialCategory ?? null
  );
  const [highlightedCertId, setHighlightedCertId] = useState<string | null>(null);
  const [confirmCert, setConfirmCert] = useState<Certificate | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleCategoryClick = (cat: CertificateCategory) => {
    setSelectedCategory(prev => prev === cat ? null : cat);
    setHighlightedCertId(null);
  };

  const handleCertClick = (cert: Certificate) => {
    setHighlightedCertId(cert.id);
    setConfirmCert(cert);
  };

  const subCerts: Certificate[] = selectedCategory
    ? (CERTIFICATES_BY_CATEGORY[selectedCategory] ?? [])
    : [];

  return (
    <div className="kiosk-root">
      <header className="kiosk-header">
        <StepIndicator currentStep={2} language={language} />
        <div className="header-title">{HEADER[language]}</div>
      </header>

      <main className="kiosk-content">
        {/* 섹션 헤더 */}
        <div className="section-label">
          <span>증명서 카테고리</span>
        </div>

        {/* 6개 카테고리 3×2 그리드 */}
        <div className="category-grid-6">
          {CATEGORY_TABS.map((cat, idx) => (
            <button
              key={cat}
              className={`category-btn-6${selectedCategory === cat ? ' selected' : ''}`}
              onClick={() => handleCategoryClick(cat)}
              aria-pressed={selectedCategory === cat}
              aria-label={cat}
              data-tabfocus="Y"
              data-tabgroup="category"
              data-ttsmsg={cat}
              tabIndex={idx}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 선택된 카테고리 하위 목록 */}
        {selectedCategory && subCerts.length > 0 && (
          <>
            <div className="section-label">
              <span>선택한 카테고리 목록</span>
            </div>
            <div className="sub-cert-grid">
              {subCerts.map((cert, idx) => (
                <button
                  key={cert.id}
                  className={`sub-cert-btn${highlightedCertId === cert.id ? ' selected' : ''}`}
                  onClick={() => handleCertClick(cert)}
                  aria-label={cert.nameKo}
                  data-tabfocus="Y"
                  data-tabgroup="category"
                  data-ttsmsg={cert.nameKo}
                  tabIndex={idx}
                >
                  {cert.nameKo}
                </button>
              ))}
            </div>
          </>
        )}

        {/* 증명서 검색 전환 */}
        <button
          className="search-type-btn"
          onClick={onSearchClick}
          style={{ width: '100%', marginTop: 40 }}
        >
          증명서 검색
        </button>
      </main>

      {confirmCert && (
        <ConfirmationModal
          certificate={confirmCert}
          language={language}
          onConfirm={() => { onCertificateConfirmed(confirmCert); setConfirmCert(null); }}
          onCancel={() => { setConfirmCert(null); setHighlightedCertId(null); }}
        />
      )}

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

export default CategorySearchPage;

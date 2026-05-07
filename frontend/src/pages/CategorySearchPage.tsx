import React, { useState, useEffect } from 'react';
import { useMagnify } from '../hooks/useMagnify';
import NavPad from '../components/common/NavPad';
import { useFocusManagerContext } from '../context/FocusManagerContext';
import StepIndicator from '../components/common/StepIndicator';
import BottomBar from '../components/common/BottomBar';
import ConfirmationModal from '../components/common/ConfirmationModal';
import InfoModal from '../components/common/InfoModal';
import imgCategory from '../assets/images/category.png';
import imgSearch from '../assets/images/search.png';
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
  const fm = useFocusManagerContext();
  const { wrapRef, innerRef, navigate } = useMagnify(isMagnified);
  const [selectedCategory, setSelectedCategory] = useState<CertificateCategory | null>(
    initialCategory ?? null
  );
  const [highlightedCertId, setHighlightedCertId] = useState<string | null>(null);
  const [confirmCert, setConfirmCert] = useState<Certificate | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      fm.registerGroupChain('category',   { next: 'sub-cert',   prev: 'bottombar' });
      fm.registerGroupChain('sub-cert',   { next: 'cat-bottom', prev: 'category'  });
      fm.registerGroupChain('cat-bottom', { next: 'bottombar',  prev: 'sub-cert'  });
    } else {
      fm.registerGroupChain('category',   { next: 'cat-bottom', prev: 'bottombar' });
      fm.registerGroupChain('cat-bottom', { next: 'bottombar',  prev: 'category'  });
    }
  }, [selectedCategory]);

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
        {isMagnified && <NavPad onNavigate={navigate} />}
        <div ref={wrapRef} className="content-scroll-wrap">
          <div ref={innerRef} className="content-wrap-category">
          {/* 섹션 헤더 */}
          <div className="section-label">
            <span>증명서 카테고리</span>
            <img src={imgCategory} alt="category" />
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
                <img src={imgCategory} alt="category" />
              </div>
              <div className="sub-cert-grid">
                {subCerts.map((cert, idx) => (
                  <button
                    key={cert.id}
                    className={`sub-cert-btn${highlightedCertId === cert.id ? ' selected' : ''}`}
                    onClick={() => handleCertClick(cert)}
                    aria-label={cert.nameKo}
                    data-tabfocus="Y"
                    data-tabgroup="sub-cert"
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
            data-tabfocus="Y"
            data-tabgroup="cat-bottom"
            data-ttsmsg="증명서 검색"
            tabIndex={0}
          >
            <img src={imgSearch} alt="search" />
            증명서 검색
          </button>
          </div>
        </div>
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

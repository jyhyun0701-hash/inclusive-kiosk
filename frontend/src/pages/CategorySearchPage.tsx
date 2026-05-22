import React, { useState, useEffect } from 'react';
import { useMagnify } from '../hooks/useMagnify';
import NavPad from '../components/common/NavPad';
import { useFocusManagerContext } from '../context/FocusManagerContext';
import StepIndicator from '../components/common/StepIndicator';
import BottomBar from '../components/common/BottomBar';
import { speakAndThen } from '../utils/speakSafe';
import ConfirmationModal from '../components/common/ConfirmationModal';
import InfoModal from '../components/common/InfoModal';
import imgCategory from '../assets/images/category.png';
import imgSearch from '../assets/images/search.png';
import {
  type Language, type Certificate, type CertificateCategory,
  CATEGORY_TABS, CATEGORY_LABELS, getCertName,
} from '../types/kiosk';

interface CategorySearchPageProps {
  language: Language;
  isTtsOn: boolean;
  isMagnified: boolean;
  initialCategory?: CertificateCategory;
  byCategory: Record<string, Certificate[]>;
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

const SECTION: Record<Language, { category: string; selected: string; search: string }> = {
  ko: { category: '증명서 카테고리', selected: '선택한 카테고리 목록', search: '증명서 검색' },
  en: { category: 'Certificate Category', selected: 'Selected Category', search: 'Search' },
  ja: { category: '証明書カテゴリー', selected: '選択したカテゴリー一覧', search: '証明書検索' },
  zh: { category: '证明书类别', selected: '已选类别列表', search: '证明书检索' },
};

const CategorySearchPage: React.FC<CategorySearchPageProps> = ({
  language, isTtsOn, isMagnified,
  initialCategory, byCategory,
  onHome, onToggleTts, onToggleMagnify,
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

  // TTS 활성화 시에만 초기 포커스 설정
  useEffect(() => {
    if (!isTtsOn) return;
    fm.registerGroupChain('search',    { next: 'category',  prev: 'bottombar' });
    fm.registerGroupChain('category',  { next: 'bottombar', prev: 'search'    });
    fm.registerGroupChain('bottombar', { next: 'search',    prev: 'category'  });
    fm.activateFocusMode('category', 0); // isTtsOn 변경 시에만 초기 포커스
  }, [isTtsOn]);

  // 카테고리 선택 시 체인만 업데이트 (포커스는 handleCategoryClick이 처리)
  useEffect(() => {
    fm.registerGroupChain('search', { next: 'category', prev: 'bottombar' });
    if (selectedCategory) {
      fm.registerGroupChain('category',  { next: 'sub-cert',  prev: 'search'   });
      fm.registerGroupChain('sub-cert',  { next: 'bottombar', prev: 'category' });
      fm.registerGroupChain('bottombar', { next: 'search',    prev: 'sub-cert' });
    } else {
      fm.registerGroupChain('category',  { next: 'bottombar', prev: 'search'   });
      fm.registerGroupChain('bottombar', { next: 'search',    prev: 'category' });
    }
  }, [selectedCategory]); // ← activateFocusMode 없음

  const handleCategoryClick = (cat: CertificateCategory) => {
    const newCat = selectedCategory === cat ? null: cat;
    setSelectedCategory(newCat);
    setHighlightedCertId(null);

    if (isTtsOn && newCat !== null) {
      const catLabel = CATEGORY_LABELS[cat]?.[language] ?? cat;
      speakAndThen(
        `${catLabel} 카테고리가 선택되었습니다.`,
        () => fm.activateFocusMode('sub-cert', 0)
      );
    }
  };

  const handleCertClick = (cert: Certificate) => {
    setHighlightedCertId(cert.id);
    setConfirmCert(cert);
  };

  const subCerts: Certificate[] = selectedCategory
    ? (byCategory[selectedCategory] ?? [])
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
          <button
            className="search-type-btn"
            onClick={onSearchClick}
            style={{ marginLeft: 'auto', marginBottom: '35px' }}
            aria-label={SECTION[language].search}
            data-tabfocus="Y"
            data-tabgroup="search"
            data-ttsmsg={SECTION[language].search}
            tabIndex={0}
          >
            <img src={imgSearch} alt="search" />
            {SECTION[language].search}
          </button>

          {/* 섹션 헤더 */}
          <div className="section-label">
            <span>{SECTION[language].category}</span>
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
                aria-label={CATEGORY_LABELS[cat]?.[language] ?? cat}
                data-tabfocus="Y"
                data-tabgroup="category"
                data-ttsmsg={CATEGORY_LABELS[cat]?.[language] ?? cat}
                tabIndex={idx}
              >
                {CATEGORY_LABELS[cat]?.[language] ?? cat}
              </button>
            ))}
          </div>

          {/* 선택된 카테고리 하위 목록 */}
          {selectedCategory && subCerts.length > 0 && (
            <>
              <div className="section-label">
                <span>{SECTION[language].selected}</span>
                <img src={imgCategory} alt="category" />
              </div>
              <div className="sub-cert-grid">
                {subCerts.map((cert, idx) => (
                  <button
                    key={cert.id}
                    className={`sub-cert-btn${highlightedCertId === cert.id ? ' selected' : ''}`}
                    onClick={() => handleCertClick(cert)}
                    aria-label={getCertName(cert, language)}
                    data-tabfocus="Y"
                    data-tabgroup="sub-cert"
                    data-ttsmsg={getCertName(cert, language)}
                    tabIndex={idx}
                  >
                    {getCertName(cert, language)}
                  </button>
                ))}
              </div>
            </>
          )}
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

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} language={language} />}

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

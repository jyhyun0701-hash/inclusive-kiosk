import React, { useState, useMemo } from 'react';
import { useMagnify } from '../hooks/useMagnify';
import NavPad from '../components/common/NavPad';
import StepIndicator from '../components/common/StepIndicator';
import BottomBar from '../components/common/BottomBar';
import ConfirmationModal from '../components/common/ConfirmationModal';
import InfoModal from '../components/common/InfoModal';
import imgSearch from '../assets/images/search.png';
import imgDelete from '../assets/images/delete.png';
import { type Language, type Certificate, ALL_CERTIFICATES } from '../types/kiosk';

const KO_ROWS = [
  ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ'],
  ['ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'],
  ['ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ'],
  ['ㅠ','ㅡ','ㅣ','ㅐ','ㅔ','ㅒ','ㅖ'],
];
const EN_ROWS = [
  ['A','B','C','D','E','F','G'],
  ['H','I','J','K','L','M','N'],
  ['O','P','Q','R','S','T','U'],
  ['V','W','X','Y','Z'],
];

interface DocumentSearchPageProps {
  language: Language;
  isTtsOn: boolean;
  isMagnified: boolean;
  onHome: () => void;
  onToggleTts: () => void;
  onToggleMagnify: () => void;
  onCertificateConfirmed: (cert: Certificate) => void;
  onCategorySearch: () => void;
}

const HEADER: Record<Language, string> = {
  ko: '발급을 원하시는 메뉴를 검색해주십시오.',
  en: 'Search for the document you need.',
  ja: '発行をご希望のメニューを検索してください。',
  zh: '请搜索您需要的证明书。',
};
const PLACEHOLDER: Record<Language, string> = {
  ko: '발급을 원하시는 증명서를 검색하십시오.',
  en: 'Search',
  ja: '証明書を検索してください。',
  zh: '请输入证明书名称',
};
const NO_RESULT: Record<Language, string> = {
  ko: '검색된 결과가 없습니다.',
  en: 'No search results found.',
  ja: '検索結果がありません。',
  zh: '没有搜索结果。',
};

const DocumentSearchPage: React.FC<DocumentSearchPageProps> = ({
  language, isTtsOn, isMagnified,
  onHome, onToggleTts, onToggleMagnify,
  onCertificateConfirmed, onCategorySearch,
}) => {
  const [query, setQuery] = useState('');
  const [confirmCert, setConfirmCert] = useState<Certificate | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [kbMode, setKbMode] = useState<'ko' | 'en'>('ko');

  const kbRows = kbMode === 'ko' ? KO_ROWS : EN_ROWS;
  const append = (ch: string) => setQuery(q => q + ch);
  const backspace = () => setQuery(q => q.slice(0, -1));
  const { wrapRef, innerRef, navigate } = useMagnify(isMagnified);

  const results = useMemo<Certificate[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_CERTIFICATES.filter(c =>
      c.nameKo.includes(q) || c.nameEn?.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="kiosk-root">
      <header className="kiosk-header">
        <StepIndicator currentStep={2} language={language} />
        <div className="header-title">{HEADER[language]}</div>
      </header>

      <main className="kiosk-content">
        {isMagnified && <NavPad onNavigate={navigate} />}
        <div ref={wrapRef} className="content-scroll-wrap">
          <div ref={innerRef} className="content-wrap-search">
          {/* 검색창 */}
          <div className="search-bar">
            <span className="search-icon">
              <img src={imgSearch} alt="search"/>
            </span>
            <input
              type="text"
              value={query}
              readOnly
              placeholder={PLACEHOLDER[language]}
              aria-label="증명서 검색"
            />
          </div>

          {/* 키보드 */}
          <div className="keyboard-wrap">
            {kbRows.map((row, ri) => (
              <div className="keyboard-row" key={ri}>
                {row.map((ch) => (
                  <button
                    key={ch}
                    className="key-btn"
                    onClick={() => append(ch)}
                    aria-label={ch}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            ))}
            <div className="keyboard-actions">
              <button className="kb-action-btn category" style={{ flex: 1 }} onClick={onCategorySearch}>
                <img src={imgSearch} alt="search" />
                카테고리 검색
              </button>
              <button className="kb-action-btn" style={{ flex: 1, background: 'var(--navy)', color: 'var(--white)' }} onClick={() => setKbMode(m => m === 'ko' ? 'en' : 'ko')}>
                {kbMode === 'ko' ? 'English' : '한국어'}
              </button>
              <button className="kb-action-btn delete" style={{ flex: 1 }} onClick={backspace}>
                <img src={imgDelete} alt="delete" />
                지우기
              </button>
            </div>
          </div>

          {/* 검색 결과 */}
          {query && results.length > 0 && (
            <div className="search-results">
              {results.map((cert, idx) => (
                <button
                  key={cert.id}
                  className="search-result-btn"
                  onClick={() => setConfirmCert(cert)}
                  aria-label={cert.nameKo}
                  data-tabfocus="Y"
                  data-tabgroup="doc-search"
                  data-ttsmsg={cert.nameKo}
                  tabIndex={idx}
                >
                  {cert.nameKo}
                </button>
              ))}
            </div>
          )}
          {query && results.length === 0 && (
            <div className="no-results">{NO_RESULT[language]}</div>
          )}
          </div>
        </div>
      </main>

      {confirmCert && (
        <ConfirmationModal
          certificate={confirmCert}
          language={language}
          onConfirm={() => { onCertificateConfirmed(confirmCert); setConfirmCert(null); }}
          onCancel={() => setConfirmCert(null)}
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

export default DocumentSearchPage;
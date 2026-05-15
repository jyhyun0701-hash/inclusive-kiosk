import React, { useState, useMemo, useEffect } from 'react';
import { useFocusManagerContext } from '../context/FocusManagerContext';
import { useMagnify } from '../hooks/useMagnify';
import NavPad from '../components/common/NavPad';
import StepIndicator from '../components/common/StepIndicator';
import BottomBar from '../components/common/BottomBar';
import ConfirmationModal from '../components/common/ConfirmationModal';
import InfoModal from '../components/common/InfoModal';
import imgSearch from '../assets/images/search.png';
import imgDelete from '../assets/images/delete.png';
import { type Language, type Certificate, type allCertificates, getCertName } from '../types/kiosk';

// ── 한글 IME ────────────────────────────────────────────────
const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const CHO_IDX: Record<string, number> = Object.fromEntries(CHOSUNG.map((c, i) => [c, i]));
const JUNG_IDX: Record<string, number> = Object.fromEntries(
  ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'].map((c, i) => [c, i])
);
const JONG_IDX: Record<string, number> = {
  'ㄱ':1,'ㄲ':2,'ㄴ':4,'ㄷ':7,'ㄹ':8,'ㅁ':16,'ㅂ':17,'ㅅ':19,'ㅆ':20,'ㅇ':21,'ㅈ':22,'ㅊ':23,'ㅋ':24,'ㅌ':25,'ㅍ':26,'ㅎ':27,
};
// 종성 인덱스 → 초성 인덱스 (모음이 올 때 분리)
const JONG_TO_CHO: Record<number, number> = {
  1:0,2:1,4:2,7:3,8:5,16:6,17:7,19:9,20:10,21:11,22:12,23:14,24:15,25:16,26:17,27:18,
};

function makeSyl(cho: number, jung: number, jong = 0) {
  return String.fromCharCode(0xAC00 + (cho * 21 + jung) * 28 + jong);
}

type KoState = { buf: string; cho: number | null; jung: number | null; jong: number | null };
const KO_INIT: KoState = { buf: '', cho: null, jung: null, jong: null };

function koStr({ buf, cho, jung, jong }: KoState): string {
  if (cho === null) return buf;
  if (jung === null) return buf + CHOSUNG[cho];
  return buf + makeSyl(cho, jung, jong ?? 0);
}

function koAdd(s: KoState, ch: string): KoState {
  if (ch in JUNG_IDX) {
    const ji = JUNG_IDX[ch];
    if (s.cho === null)         return { ...s, cho: 11, jung: ji, jong: null };           // 묵음 ㅇ
    if (s.jung === null)        return { ...s, jung: ji };
    if (s.jong === null)        return { buf: s.buf + makeSyl(s.cho, s.jung, 0), cho: 11, jung: ji, jong: null };
    // 종성 분리: 현재 음절에서 종성 제거 → 종성이 다음 음절 초성이 됨
    return { buf: s.buf + makeSyl(s.cho, s.jung, 0), cho: JONG_TO_CHO[s.jong], jung: ji, jong: null };
  }
  if (ch in CHO_IDX) {
    const ci = CHO_IDX[ch];
    const ni = JONG_IDX[ch] ?? 0;
    if (s.cho === null)         return { ...s, cho: ci };
    if (s.jung === null)        return { buf: s.buf + CHOSUNG[s.cho], cho: ci, jung: null, jong: null };
    if (s.jong === null && ni)  return { ...s, jong: ni };
    const fin = s.jong != null ? makeSyl(s.cho, s.jung, s.jong) : makeSyl(s.cho, s.jung, 0);
    return { buf: s.buf + fin, cho: ci, jung: null, jong: null };
  }
  return { buf: koStr(s) + ch, cho: null, jung: null, jong: null };
}

function koDel(s: KoState): KoState {
  if (s.jong !== null) return { ...s, jong: null };
  if (s.jung !== null) return { ...s, jung: null };
  if (s.cho  !== null) return { ...s, cho: null };
  return { ...s, buf: s.buf.slice(0, -1) };
}
// ── end 한글 IME ────────────────────────────────────────────

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
  allCertificates: Certificate[];
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
  allCertificates, onHome, onToggleTts, onToggleMagnify,
  onCertificateConfirmed, onCategorySearch,
}) => {
  const fm = useFocusManagerContext();

  const [koState, setKoState] = useState<KoState>(KO_INIT);
  const [enQuery, setEnQuery] = useState('');
  const [confirmCert, setConfirmCert] = useState<Certificate | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [kbMode, setKbMode] = useState<'ko' | 'en'>('ko');

  const kbRows = kbMode === 'ko' ? KO_ROWS : EN_ROWS;
  const query = kbMode === 'ko' ? koStr(koState) : enQuery;

  const kbChars = useMemo(() => kbRows.flat(), [kbMode]);

  const results = useMemo<Certificate[]>(() => {
      if (!query.trim()) return [];
      const q = query.toLowerCase();
      return allCertificates.filter(c =>
        c.nameKo.includes(q) ||
        c.nameEn?.toLowerCase().includes(q) ||
        c.nameJa?.includes(q) ||
        c.nameZh?.includes(q)
      );
  }, [query, allCertificates]);

    // TTS 켜질 때마다 재실행
    useEffect(() => {
      if (!isTtsOn) return;                // TTS 꺼진 상태면 스킵
      fm.initTabGroup(document, 'keyboard', { tabRotation: false, playTtsOnMoved: true });
      fm.registerGroupChain('keyboard',  { next: 'bottombar', prev: 'bottombar' });
      fm.registerGroupChain('bottombar', { next: 'keyboard',  prev: 'keyboard'  });
      fm.activateFocusMode('keyboard', 0);
    }, [isTtsOn]);

    useEffect(() => {
      if (!isTtsOn) return;
      fm.activateFocusMode('keyboard', 0);
    }, [kbMode]);

    useEffect(() => {
      if (!isTtsOn) return;
      if (results.length > 0) {
        fm.registerGroupChain('keyboard',   { next: 'doc-search', prev: 'bottombar' });
        fm.registerGroupChain('doc-search', { next: 'bottombar',  prev: 'keyboard'  });
        fm.registerGroupChain('bottombar',  { next: 'keyboard',   prev: 'doc-search' });
      } else {
        fm.registerGroupChain('keyboard',  { next: 'bottombar', prev: 'bottombar' });
        fm.registerGroupChain('bottombar', { next: 'keyboard',  prev: 'keyboard'  });
      }
    }, [results.length, isTtsOn]);

  const append = (ch: string) => {
    if (kbMode === 'ko') setKoState(s => koAdd(s, ch));
    else setEnQuery(q => q + ch);
  };
  const backspace = () => {
    if (kbMode === 'ko') setKoState(s => koDel(s));
    else setEnQuery(q => q.slice(0, -1));
  };
  const switchMode = () => {
    setKoState(KO_INIT);
    setEnQuery('');
    setKbMode(m => m === 'ko' ? 'en' : 'ko');
  };

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
                    data-tabfocus="Y"
                    data-tabgroup="keyboard"
                    data-ttsmsg={ch}
                    tabIndex={kbChars.indexOf(ch)}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            ))}
            <div className="keyboard-actions">
              <button
                className="kb-action-btn category"
                style={{ flex: 1 }}
                onClick={onCategorySearch}
                data-tabfocus="Y"
                data-tabgroup="keyboard"
                data-ttsmsg="카테고리 검색"
                tabIndex={kbChars.length}
              >
                <img src={imgSearch} alt="search" />
                카테고리 검색
              </button>
              <button
                className="kb-action-btn"
                style={{ flex: 1, background: 'var(--navy)', color: 'var(--white)' }}
                onClick={switchMode}
                data-tabfocus="Y"
                data-tabgroup="keyboard"
                data-ttsmsg={kbMode === 'ko' ? 'English' : '한국어'}
                tabIndex={kbChars.length + 1}
              >
                {kbMode === 'ko' ? 'English' : '한국어'}
              </button>
              <button
                className="kb-action-btn delete"
                style={{ flex: 1 }}
                onClick={backspace}
                data-tabfocus="Y"
                data-tabgroup="keyboard"
                data-ttsmsg="지우기"
                tabIndex={kbChars.length + 2}
              >
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
                  data-ttsmsg={getCertName(cert, language)}
                  tabIndex={idx}
                >
                  {getCertName(cert, language)}
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

import React, { useState, useCallback, useEffect } from 'react';
import './assets/styles/kiosk.css';

import MainPage from './pages/MainPage';
import CertificateListPage from './pages/CertificateListPage';
import CategorySearchPage from './pages/CategorySearchPage';
import DocumentSearchPage from './pages/DocumentSearchPage';
import IdentityVerificationPage from './pages/IdentityVerificationPage';
import IssuancePage from './pages/IssuancePage';
import VirtualKeypad, { type KeypadKey } from './components/common/VirtualKeypad';
import { useFocusManager } from './hooks/useFocusManager';
import { setGlobalTts} from './utils/speakSafe';

import {
  type Language, type Certificate, type CertificateCategory, QUICK_CERTIFICATES,
} from './types/kiosk';

// ── 화면 타입 ──────────────────────────────────────
type Screen =
  | { id: 'main' }
  | { id: 'cert-list' }
  | { id: 'category-search'; initialCategory?: CertificateCategory }
  | { id: 'doc-search' }
  | { id: 'identity'; certificate: Certificate }
  | { id: 'issuance'; certificate: Certificate };

// ── TTS ────────────────────────────────────────────
const speak = (text: string, lang: Language) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }, 100);
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>({ id: 'main' });
  const [language, setLanguage] = useState<Language>('ko');
  const [isTtsOn, setIsTtsOn] = useState(false);
  const [isMagnified, setIsMagnified] = useState(false);

  const fm = useFocusManager();

  const tts = useCallback((text: string) => {
    if (isTtsOn) speak(text, language);
  }, [isTtsOn, language]);

  const goHome = useCallback(() => {
    window.speechSynthesis?.cancel();
    setScreen({ id: 'main' });
  }, []);

  // 마운트 시 한 번만 그룹/체인 등록
  useEffect(() => {
    fm.initTabGroup(document, 'main',      { tabRotation: false, playTtsOnMoved: true });
    fm.initTabGroup(document, 'lang',      { tabRotation: false, playTtsOnMoved: true });
    fm.initTabGroup(document, 'bottombar', { tabRotation: false, playTtsOnMoved: true });

    fm.registerGroupChain('main',      { next: 'lang' });
    fm.registerGroupChain('lang',      { next: 'bottombar', prev: 'main' });
    fm.registerGroupChain('bottombar', { next: 'main',      prev: 'lang' });
  }, []);  // ← 빈 배열: 마운트 시 1회만

  // handleToggleTts는 activateFocusMode만 남김
  const handleToggleTts = () => {
    const next = !isTtsOn;
    setIsTtsOn(next);
    if (next) {
      speak('접근성 모드가 활성화되었습니다.', language);
      setTimeout(() => fm.activateFocusMode('main', 0), 300);
    } else {
      fm.deactivateFocusMode();
      window.speechSynthesis?.cancel();
    }
  };

  const handleToggleMagnify = () => setIsMagnified(p => !p);

  // ← 키패드 키 입력 처리
  const handleKeypadKey = useCallback((key: KeypadKey) => {
    switch (key) {
      case 'NAVUP':       fm.moveByCurrentGroup('UP');   break;
      case 'NAVDOWN':     fm.moveByCurrentGroup('DOWN'); break;
      case 'NAVENTER':    (document.activeElement as HTMLElement)?.click(); break;
      case 'KEY_CANCEL':  goHome(); break;
      case 'KEY_LISTEN':  fm.readCurrentFocus(); break;
      default: break;
    }
  }, [fm, goHome]);

  const common = {
    language, isTtsOn, isMagnified,
    onToggleTts: handleToggleTts,
    onToggleMagnify: handleToggleMagnify,
  };

  const renderPage = () => {
    switch (screen.id) {
      case 'main':
        return (
          <MainPage
            {...common}
            onLanguageChange={(lang) => { setLanguage(lang); }}
            onCertificateSelect={(certId) => {
              const cert = QUICK_CERTIFICATES.find(c => c.id === certId)!;
              tts(`${cert.nameKo}이 선택되었습니다.`);
              setScreen({ id: 'identity', certificate: cert });
            }}
            onMoreCertificates={() => {
              tts('증명서 전체 목록 화면으로 이동합니다.');
              setScreen({ id: 'cert-list' });
            }}
          />
        );
      case 'cert-list':
        return (
          <CertificateListPage
            {...common}
            onHome={goHome}
            onCategorySearchClick={() => {
              tts('카테고리 검색 화면으로 이동합니다.');
              setScreen({ id: 'category-search' });
            }}
            onCategorySelect={(cat) => {
              tts(`${cat} 카테고리를 선택하셨습니다.`);
              setScreen({ id: 'category-search', initialCategory: cat });
            }}
            onSearchClick={() => setScreen({ id: 'doc-search' })}
          />
        );
      case 'category-search':
        return (
          <CategorySearchPage
            {...common}
            initialCategory={screen.initialCategory}
            onHome={goHome}
            onCertificateConfirmed={(cert) => {
              tts(`${cert.nameKo} 발급을 진행합니다.`);
              setScreen({ id: 'identity', certificate: cert });
            }}
            onSearchClick={() => setScreen({ id: 'doc-search' })}
          />
        );
      case 'doc-search':
        return (
          <DocumentSearchPage
            {...common}
            onHome={goHome}
            onCertificateConfirmed={(cert) => {
              tts(`${cert.nameKo} 발급을 진행합니다.`);
              setScreen({ id: 'identity', certificate: cert });
            }}
            onCategorySearch={() => setScreen({ id: 'category-search' })}
          />
        );
      case 'identity':
        return (
          <IdentityVerificationPage
            {...common}
            certificate={screen.certificate}
            onHome={goHome}
            onVerified={() => {
              tts('본인 확인이 완료되었습니다. 문서를 출력합니다.');
              setScreen({ id: 'issuance', certificate: screen.certificate });
            }}
          />
        );
      case 'issuance':
        return (
          <IssuancePage
            {...common}
            certificate={screen.certificate}
            onHome={goHome}
          />
        );
    }
  };

  return (
    <div className="kiosk-wrap">
      {renderPage()}

      {/* ← 키패드 추가 */}
      <VirtualKeypad
        isOpen={isTtsOn}
        onClose={handleToggleTts}
        onKey={handleKeypadKey}
      />
    </div>
  );
};

export default App;
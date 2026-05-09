import React, { useRef, useState, useCallback, useEffect } from 'react';
import './assets/styles/kiosk.css';

import MainPage from './pages/MainPage';
import CertificateListPage from './pages/CertificateListPage';
import CategorySearchPage from './pages/CategorySearchPage';
import DocumentSearchPage from './pages/DocumentSearchPage';
import IdentityVerificationPage from './pages/IdentityVerificationPage';
import IssuancePage from './pages/IssuancePage';
import VirtualKeypad, { type KeypadKey } from './components/common/VirtualKeypad';
import { useFocusManagerContext } from './context/FocusManagerContext';
import { setGlobalTts} from './utils/speakSafe';

import {
  type Language, type Certificate, type CertificateCategory, QUICK_CERTIFICATES,
} from './types/kiosk';

const CHANNEL_NAME = 'kiosk-keypad';
const KEYPAD_FEATURES = 'width=280,height=520,resizable=no,scrollbars=no,location=no';

// ── 화면별 첫 포커스 그룹 ──────────────────────────
const getFirstGroupForScreen = (screenId: string): string => {
  switch (screenId) {
    case 'main':            return 'main';
    case 'cert-list':       return 'cert-list-top';
    case 'category-search': return 'category';
    case 'doc-search':      return 'bottombar';
    case 'identity':        return 'numpad';
    case 'issuance':        return 'bottombar';
    default:                return 'bottombar';
  }
};

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

  // App 컴포넌트 내부
  const keypadWindowRef = useRef<Window | null>(null);
  const channelRef      = useRef<BroadcastChannel | null>(null);

  const handleKeypadKeyRef = useRef<((key: KeypadKey) => void) | null>(null);
  const handleToggleTtsRef = useRef<(() => void) | null>(null);

  const fm = useFocusManagerContext();

  const setupGroupsForScreen = useCallback((screenId: string) => {
    switch (screenId) {
      case 'main':
        fm.registerGroupChain('main',          { next: 'lang',          prev: 'bottombar' });
        fm.registerGroupChain('lang',          { next: 'bottombar',     prev: 'main' });
        fm.registerGroupChain('bottombar',     { next: 'main',          prev: 'lang' });
        break;
      case 'cert-list':
        fm.registerGroupChain('cert-list-top', { next: 'cert-list',     prev: 'bottombar' });
        fm.registerGroupChain('cert-list',     { next: 'bottombar',     prev: 'cert-list-top' });
        fm.registerGroupChain('bottombar',     { next: 'cert-list-top', prev: 'cert-list' });
        break;
      case 'category-search':
        fm.registerGroupChain('category',      { next: 'cat-bottom',    prev: 'bottombar' });
        fm.registerGroupChain('cat-bottom',    { next: 'bottombar',     prev: 'category' });
        fm.registerGroupChain('bottombar',     { next: 'category',      prev: 'cat-bottom' });
        break;
      case 'doc-search':
        fm.registerGroupChain('doc-search',    { next: 'bottombar',     prev: 'bottombar' });
        fm.registerGroupChain('bottombar',     { next: 'doc-search',    prev: 'doc-search' });
        break;
      case 'identity':
        fm.registerGroupChain('numpad',        { next: 'bottombar',     prev: 'bottombar' });
        fm.registerGroupChain('identity',      { next: 'bottombar',     prev: 'bottombar' });
        fm.registerGroupChain('bottombar',     { next: 'numpad',        prev: 'numpad' });
        break;
      case 'issuance':
        fm.registerGroupChain('issuance',      { next: 'bottombar',     prev: 'bottombar' });
        fm.registerGroupChain('bottombar',     { next: 'issuance',      prev: 'issuance' });
        break;
    }
  }, [fm]);

 // 화면 전환 + TTS + 포커스 진입을 함께 처리하는 헬퍼
 const goTo = useCallback((nextScreen: Screen, ttsMsg?: string, group = 'main', tabindex = 0) => {
   if (ttsMsg) speak(ttsMsg, language);
   setupGroupsForScreen(nextScreen.id);
   setScreen(nextScreen);
   if (isTtsOn) {
     setTimeout(() => fm.activateFocusMode(group, tabindex), 400);
   }
 }, [language, isTtsOn, fm, setupGroupsForScreen]);

  const goHome = useCallback(() => {
    window.speechSynthesis?.cancel();
    setupGroupsForScreen('main');
    setScreen({ id: 'main' });
  }, [setupGroupsForScreen]);

  // 마운트 시 한 번만 그룹 옵션 등록 + 초기 체인(main) 설정
  useEffect(() => {
    const groups = [
      'main', 'lang', 'bottombar',
      'cert-list-top', 'cert-list',
      'category', 'sub-cert', 'cat-bottom',
      'doc-search', 'numpad', 'identity', 'issuance',
    ];
    groups.forEach(g => fm.initTabGroup(document, g, { tabRotation: false, playTtsOnMoved: true }));
    // 모달 그룹: 각 모달이 마운트될 때 자체 등록하지만 여기서 선행 등록으로 options 확보
    fm.initTabGroup(document, 'modal-info',    { tabRotation: false, playTtsOnMoved: true });
    fm.initTabGroup(document, 'modal-confirm', { tabRotation: true,  playTtsOnMoved: true });
    setupGroupsForScreen('main');

    return () => { channelRef.current?.close(); };
  }, []);  // ← 빈 배열: 마운트 시 1회만

const openKeypad = useCallback(() => {
  // 이미 열려있으면 포커스만
  if (keypadWindowRef.current && !keypadWindowRef.current.closed) {
    keypadWindowRef.current.focus();
    return;
  }

  const w = window.open('/keypad', 'kiosk-keypad', KEYPAD_FEATURES);
  keypadWindowRef.current = w;

  const ch = new BroadcastChannel(CHANNEL_NAME);
  channelRef.current = ch;

  ch.onmessage = (e) => {
    const { type, key } = e.data;
    if (type === 'KEY')   handleKeypadKeyRef.current?.(key);   // 직접 호출 대신 ref 사용
    if (type === 'CLOSE') handleToggleTtsRef.current?.();
  };
}, []);

const closeKeypad = useCallback(() => {
  keypadWindowRef.current?.close();
  keypadWindowRef.current = null;
  channelRef.current?.close();
  channelRef.current = null;
  }, []);


  // handleToggleTts는 activateFocusMode만 남김
  const handleToggleTts = useCallback(() => {
    const next = !isTtsOn;
    setIsTtsOn(next);
    setGlobalTts(next);
    if (next) {
      speak('접근성 모드가 활성화되었습니다.', language);
      setupGroupsForScreen(screen.id);
      const firstGroup = getFirstGroupForScreen(screen.id);
      setTimeout(() => fm.activateFocusMode(firstGroup, 0), 300);
      openKeypad();
    } else {
      fm.deactivateFocusMode();
      window.speechSynthesis?.cancel();
      closeKeypad();
    }
  }, [isTtsOn, language, screen, fm, setupGroupsForScreen, openKeypad, closeKeypad]);

  // ref를 항상 최신 함수로 동기화
  useEffect(() => {
    handleKeypadKeyRef.current = handleKeypadKey;
    handleToggleTtsRef.current = handleToggleTts;
  });

  const handleToggleMagnify = () => setIsMagnified(p => !p);

  // ← 키패드 키 입력 처리
  const handleKeypadKey = useCallback((key: KeypadKey) => {
    switch (key) {
      case 'NAVUP':       fm.moveByCurrentGroup('UP');   break;
      case 'NAVDOWN':     fm.moveByCurrentGroup('DOWN'); break;
      case 'NAVENTER':    (document.activeElement as HTMLElement)?.click(); break;
      case 'KEY_CANCEL':  goHome(); break;
      case 'KEY_LISTEN':  fm.readCurrentFocus(); break;
      case 'KEY_CORRECT': {
        // numpad의 del 버튼 (tabIndex=9) 클릭
        const delBtn = document.querySelector<HTMLElement>('[data-tabgroup="numpad"][tabindex="9"]');
        if (delBtn) { delBtn.click(); fm.playTtsFromElement(delBtn); }
        break;
      }
      default:
        // 숫자 키 0-9: numpad가 렌더링된 경우에만 해당 버튼 클릭
        if (/^[0-9]$/.test(key)) {
          const numBtn = document.querySelector<HTMLElement>(`[data-tabgroup="numpad"][data-ttsmsg="${key}"]`);
          if (numBtn) { numBtn.click(); fm.playTtsFromElement(numBtn); }
        }
        break;
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
              goTo({ id: 'identity', certificate: cert }, `${cert.nameKo}이 선택되었습니다.`, 'numpad', 0);
            }}
            onMoreCertificates={() => {
              goTo({ id: 'cert-list' }, '증명서 전체 목록 화면으로 이동합니다.', 'cert-list-top', 0);
            }}
          />
        );

      case 'cert-list':
        return (
          <CertificateListPage
            {...common}
            onHome={goHome}
            onCategorySearchClick={() => {
              goTo({ id: 'category-search' }, '카테고리 검색 화면으로 이동합니다.', 'category', 0);
            }}
            onCertificateSelect={(cert) => {
              goTo({ id: 'identity', certificate: cert }, `${cert.nameKo} 발급을 진행합니다.`, 'numpad', 0);
            }}
            onSearchClick={() => goTo({ id: 'doc-search' }, '문서 검색 화면으로 이동합니다.', 'doc-search', 0)}
          />
        );

      case 'category-search':
        return (
          <CategorySearchPage
            {...common}
            initialCategory={screen.initialCategory}
            onHome={goHome}
            onCertificateConfirmed={(cert) => {
              goTo({ id: 'identity', certificate: cert }, `${cert.nameKo} 발급을 진행합니다.`, 'numpad', 0);
            }}
            onSearchClick={() => goTo({ id: 'doc-search' }, undefined, 'doc-search', 0)}
          />
        );

      case 'doc-search':
        return (
          <DocumentSearchPage
            {...common}
            onHome={goHome}
            onCertificateConfirmed={(cert) => {
              goTo({ id: 'identity', certificate: cert }, `${cert.nameKo} 발급을 진행합니다.`, 'numpad', 0);
            }}
            onCategorySearch={() => goTo({ id: 'category-search' }, undefined, 'category-search', 0)}
          />
        );

      case 'identity':
        return (
          <IdentityVerificationPage
            {...common}
            certificate={screen.certificate}
            onHome={goHome}
            onVerified={() => {
              goTo(
                { id: 'issuance', certificate: screen.certificate },
                '본인 확인이 완료되었습니다. 문서를 출력합니다.',
                'bottombar', 0
              );
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
    </div>
  );
};

export default App;
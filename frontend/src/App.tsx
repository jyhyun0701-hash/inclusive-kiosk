import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createContext, useContext } from 'react';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { FocusManagerProvider } from './context/FocusManagerContext';
import KioskFrame from './components/common/KioskFrame';
import VirtualKeypad from './components/common/VirtualKeypad';
import { useVirtualKeypad } from './hooks/useVirtualKeypad';
import MainPage from './pages/MainPage';
import CertificateSelectPage from './pages/CertificateSelectPage';
import IdentityVerifyPage from './pages/IdentityVerifyPage';
import IssuePage from './pages/IssuePage';
import type { KeypadKey } from './components/common/VirtualKeypad';

/* ──────────────────────────────────────────
   KeypadContext — BottomBar ↔ Layout 연결용
────────────────────────────────────────── */
interface KeypadContextType {
  isKeypadOpen: boolean;
  toggleKeypad: () => void;
}

export const KeypadContext = createContext<KeypadContextType>({
  isKeypadOpen: false,
  toggleKeypad: () => {},
});
export const useKeypadContext = () => useContext(KeypadContext);

/* ──────────────────────────────────────────
   AppInner — FocusManager 사용 가능한 위치
────────────────────────────────────────── */
function AppInner() {
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const { handleKeypadKey } = useVirtualKeypad();

  /**
   * 음성 켜기/끄기 = 키패드 토글
   * BottomBar → AccessibilityContext 에서 ttsEnabled 변경 후 여기로 전달
   */
  const toggleKeypad = () => setIsKeypadOpen((prev) => !prev);

  return (
    <KeypadContext.Provider value={{ isKeypadOpen, toggleKeypad }}>
      <KioskFrame>
        <Routes>
          <Route path="/"            element={<MainPage />} />
          <Route path="/certificate" element={<CertificateSelectPage />} />
          <Route path="/verify"      element={<IdentityVerifyPage />} />
          <Route path="/issue"       element={<IssuePage />} />
        </Routes>
      </KioskFrame>

      {/*
        가상 키패드 — 브라우저 레벨 fixed 위치
        실제 키오스크의 물리 키패드 시뮬레이션
      */}
      <VirtualKeypad
        isOpen={isKeypadOpen}
        onClose={toggleKeypad}
        onKey={(key: KeypadKey) => handleKeypadKey(key)}
      />
    </KeypadContext.Provider>
  );
}

/* ──────────────────────────────────────────
   App 최상위
────────────────────────────────────────── */
function App() {
  return (
    <AccessibilityProvider>
      <FocusManagerProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </FocusManagerProvider>
    </AccessibilityProvider>
  );
}

export default App;

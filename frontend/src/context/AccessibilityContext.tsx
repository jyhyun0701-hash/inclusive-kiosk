import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Language } from '../types/certificate';

interface AccessibilityState {
  ttsEnabled:         boolean;
  zoomEnabled:        boolean;
  highContrast:       boolean;
  language:           Language;
  toggleTTS:          () => void;
  toggleZoom:         () => void;
  toggleHighContrast: () => void;
  setLanguage:        (lang: Language) => void;
}

const AccessibilityContext = createContext<AccessibilityState | null>(null);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [ttsEnabled,   setTtsEnabled]   = useState(false);
  const [zoomEnabled,  setZoomEnabled]  = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [language,     setLanguage]     = useState<Language>('ko');

  const toggleTTS = () => setTtsEnabled(p => !p);
  const toggleZoom = () => setZoomEnabled(p => !p);
  const toggleHighContrast = () => {
    setHighContrast(p => {
      document.body.classList.toggle('high-contrast', !p);
      return !p;
    });
  };

  return (
    <AccessibilityContext.Provider value={{
      ttsEnabled, zoomEnabled, highContrast, language,
      toggleTTS, toggleZoom, toggleHighContrast, setLanguage,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('AccessibilityProvider 안에서 사용하세요');
  return ctx;
};

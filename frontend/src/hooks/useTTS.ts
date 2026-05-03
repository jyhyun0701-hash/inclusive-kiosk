import { useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export const useTTS = () => {
  const { ttsEnabled, language } = useAccessibility();

  const speak = useCallback(
    (text: string) => {
      if (!ttsEnabled) return;
      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      // Chrome 레이스컨디션 방지
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);

        const langMap: Record<string, string> = {
          ko: 'ko-KR',
          en: 'en-US',
          ja: 'ja-JP',
          zh: 'zh-CN',
        };
        utterance.lang = langMap[language] ?? 'ko-KR';
        utterance.rate = 0.9;
        utterance.volume = 1.0;

        window.speechSynthesis.speak(utterance);
      }, 100);
    },
    [ttsEnabled, language]
  );

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  return { speak, stop };
};

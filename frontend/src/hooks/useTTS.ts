import { useRef, useCallback, useEffect } from 'react';

const useTTS = () => {
  const isTTSEnabled = useRef(false);
  const currentUtterance = useRef(null);

  // 앱 시작 시 음성 목록 미리 로드
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // 한국어 음성 찾기
  const getKoreanVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang === 'ko-KR' && v.localService) ||
      voices.find((v) => v.lang === 'ko-KR') ||
      voices.find((v) => v.lang.startsWith('ko')) ||
      null
    );
  }, []);

  // TTS 켜기/끄기 토글
  const toggleTTS = useCallback((enabled) => {
    isTTSEnabled.current = enabled;
    if (!enabled) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // TTS 실행 (핵심 함수)
  const speak = useCallback((text, onEnd) => {
    if (!isTTSEnabled.current || !text) return;

    // 1. 기존 음성 무조건 취소 (Chrome stuck 버그 방지)
    window.speechSynthesis.cancel();

    // 2. cancel() 후 150ms 딜레이 (Chrome 버그 핵심 해결책)
    setTimeout(() => {
      if (!isTTSEnabled.current) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang   = 'ko-KR';
      utterance.volume = 1;      // 명시적으로 볼륨 설정
      utterance.rate   = 0.95;
      utterance.pitch  = 1;

      const voice = getKoreanVoice();
      if (voice) utterance.voice = voice;

      utterance.onend   = () => onEnd && onEnd();
      utterance.onerror = (e) => console.error('TTS 오류:', e.error);

      currentUtterance.current = utterance;
      window.speechSynthesis.speak(utterance);
    }, 150);

  }, [getKoreanVoice]);

  // TTS 즉시 중단
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    currentUtterance.current = null;
  }, []);

  return { speak, stop, toggleTTS };
};

export default useTTS;
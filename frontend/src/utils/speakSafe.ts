let globalTtsEnabled = false;
let lastMsg = '';

export const setGlobalTts = (enabled: boolean) => {
  globalTtsEnabled = enabled;
  if (!enabled) {
    window.speechSynthesis?.cancel();
    lastMsg = '';
  }
};

function getKoVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(v => v.name === '유나') ??
    voices.find(v => v.lang === 'ko-KR' && v.default) ??
    voices.find(v => v.lang === 'ko-KR') ??
    null
  );
}

function makeUtt(msg: string): SpeechSynthesisUtterance {
  const utt = new SpeechSynthesisUtterance(msg);
  utt.lang   = 'ko-KR';
  utt.rate   = 0.9;
  utt.volume = 1.0;
  const voice = getKoVoice();
  if (voice) utt.voice = voice;

  // 수정: cancel() 시 onerror('interrupted')가 발생하므로 여기서도 초기화
  utt.onend   = () => { lastMsg = ''; };
  utt.onerror = (e) => {
    if (e.error !== 'interrupted') {
      console.warn('[TTS] error:', e.error);
    }
    lastMsg = '';  // ← 핵심 추가: cancel 후 같은 메시지 재발화 가능하게
  };
  return utt;
}

/**
 * 우선 발화 — 기존 취소 후 즉시 재생
 * ✅ 수정: globalTtsEnabled 체크 추가 (TTS 꺼진 상태에서 호출 방지)
 */
export const speakPriority = (msg: string) => {
  if (!globalTtsEnabled) return;  // ← 추가
  if (!window.speechSynthesis || !msg.trim()) return;

  window.speechSynthesis.cancel();
  lastMsg = msg;

  setTimeout(() => {
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    window.speechSynthesis.speak(makeUtt(msg));
  }, 50);
};

/**
 * 일반 발화 — TTS 꺼진 상태면 완전 차단
 */
export const speakSafe = (msg: string) => {
  if (!globalTtsEnabled) return;
  if (!window.speechSynthesis || !msg.trim()) return;
  if (lastMsg === msg) return;

  window.speechSynthesis.cancel();
  lastMsg = msg;

  setTimeout(() => {
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    window.speechSynthesis.speak(makeUtt(msg));
  }, 50);
};

export const stopSpeak = () => {
  window.speechSynthesis?.cancel();
  lastMsg = '';
};

export const initSpeech = () => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
};
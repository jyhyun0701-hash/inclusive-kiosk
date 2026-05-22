let globalTtsEnabled = false;
let pendingMsg = '';
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

export const setGlobalTts = (enabled: boolean) => {
  globalTtsEnabled = enabled;
  if (!enabled) {
    if (pendingTimer !== null) { clearTimeout(pendingTimer); pendingTimer = null; }
    pendingMsg = '';
    window.speechSynthesis?.cancel();
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

function doSpeak(msg: string, onEnd?: () => void) {
  if (!window.speechSynthesis) return;
  const utt = new SpeechSynthesisUtterance(msg);
  utt.lang = 'ko-KR'; utt.rate = 0.9; utt.volume = 1.0;
  const voice = getKoVoice();
  if (voice) utt.voice = voice;

  utt.onend = () => {
    if (pendingMsg === msg) pendingMsg = '';
    onEnd?.();
  };
  utt.onerror = (e) => {
    if (e.error !== 'canceled' && e.error !== 'interrupted') console.warn('[TTS]', e.error);
    if (pendingMsg === msg) pendingMsg = '';
    onEnd?.();
  };

  if (window.speechSynthesis.paused) window.speechSynthesis.resume();
  window.speechSynthesis.speak(utt);
}

export const speakSafe = (msg: string) => {
  if (!globalTtsEnabled || !window.speechSynthesis || !msg.trim()) return;
  if (pendingMsg === msg) return;

  if (pendingTimer !== null) { clearTimeout(pendingTimer); pendingTimer = null; }
  pendingMsg = msg;

  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }

  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    if (!globalTtsEnabled || pendingMsg !== msg) return;
    doSpeak(msg);
  }, 100);
};

export const speakPriority = (msg: string) => {
  if (!globalTtsEnabled || !window.speechSynthesis || !msg.trim()) return;
  if (pendingTimer !== null) { clearTimeout(pendingTimer); pendingTimer = null; }
  pendingMsg = msg;
  window.speechSynthesis.cancel();
  setTimeout(() => doSpeak(msg), 50);
};

/** 내용 발화 완료 후 콜백 실행 (모달 오픈 시 사용) */
export const speakAndThen = (msg: string, callback: () => void) => {
  if (!globalTtsEnabled || !window.speechSynthesis || !msg.trim()) {
    callback();
    return;
  }

  if (pendingTimer !== null) { clearTimeout(pendingTimer); pendingTimer = null; }
  pendingMsg = msg;

  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }

  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    if (!globalTtsEnabled || pendingMsg !== msg) { callback(); return; }
    doSpeak(msg, callback);
  }, 100);
};

export const stopSpeak = () => {
  if (pendingTimer !== null) { clearTimeout(pendingTimer); pendingTimer = null; }
  pendingMsg = '';
  window.speechSynthesis?.cancel();
};

export const initSpeech = () => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
};

// 페이지별 도움말 텍스트 (NAVHELP용)
let _pageHelpText = '';
export const setPageHelpText = (text: string) => { _pageHelpText = text; };
export const getPageHelpText = () => _pageHelpText;
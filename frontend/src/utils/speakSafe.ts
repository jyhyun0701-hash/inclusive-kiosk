/**
 * speakSafe v14
 *
 * 수정사항:
 * 1. globalTtsEnabled 플래그로 TTS 꺼진 상태 완전 차단
 * 2. 중복 발화 방지: lastMsg 체크
 * 3. speakPriority: cancel → 50ms → speak (Chrome stuck 방지)
 */

let globalTtsEnabled = false;
let lastMsg = '';

/** BottomBar에서 TTS 상태 변경 시 호출 */
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
  utt.onend = () => { lastMsg = ''; };
  return utt;
}

/**
 * 우선 발화 — 기존 취소 후 즉시 재생
 * 음성 켜기 버튼 클릭 등 클릭 핸들러 안에서만 호출
 */
export const speakPriority = (msg: string) => {
  if (!window.speechSynthesis || !msg.trim()) return;
  // setGlobalTts(true) 직후 호출되므로 globalTtsEnabled 체크 생략

  window.speechSynthesis.cancel();
  lastMsg = msg;

  setTimeout(() => {
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    window.speechSynthesis.speak(makeUtt(msg));
  }, 50);
};

/**
 * 일반 발화 — TTS 꺼진 상태면 완전 차단
 * 중복 메시지 연속 발화 방지
 */
export const speakSafe = (msg: string) => {
  if (!globalTtsEnabled) return;          // ← TTS 꺼진 상태 차단
  if (!window.speechSynthesis || !msg.trim()) return;
  if (lastMsg === msg) return;            // ← 동일 메시지 중복 방지

  lastMsg = msg;
  if (window.speechSynthesis.paused) window.speechSynthesis.resume();
  window.speechSynthesis.speak(makeUtt(msg));
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

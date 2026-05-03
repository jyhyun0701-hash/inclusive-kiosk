import { useEffect, useCallback } from 'react';

export type KeypadKey =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'NAVUP' | 'NAVDOWN' | 'NAVPREVIOUS' | 'NAVNEXT' | 'NAVENTER'
  | 'KEY_CANCEL' | 'KEY_CORRECT' | 'KEY_LISTEN' | 'NAVHELP';

interface VirtualKeypadProps {
  isOpen: boolean;
  onClose: () => void;
  onKey: (key: KeypadKey) => void;
}

const VirtualKeypad = ({ isOpen, onClose, onKey }: VirtualKeypadProps) => {

  const handleKey = useCallback((key: KeypadKey) => {
    onKey(key);
  }, [onKey]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      switch (e.key) {
        case 'ArrowUp':    e.preventDefault(); handleKey('NAVUP');       break;
        case 'ArrowDown':  e.preventDefault(); handleKey('NAVDOWN');     break;
        case 'ArrowLeft':  e.preventDefault(); handleKey('NAVPREVIOUS'); break;
        case 'ArrowRight': e.preventDefault(); handleKey('NAVNEXT');     break;
        case 'Enter':      e.preventDefault(); handleKey('NAVENTER');    break;
        case 'Escape':     e.preventDefault(); handleKey('KEY_CANCEL');  break;
        case 'Backspace':  e.preventDefault(); handleKey('KEY_CORRECT'); break;
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
          handleKey(e.key as KeypadKey);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKey]);

  if (!isOpen) return null;

  return (
    <div className="keypad-overlay" role="dialog" aria-label="가상 키패드 (물리 키패드 시뮬레이션)" aria-modal="false">
      <div className="keypad-pad">

        {/* 헤더 */}
        <div className="keypad-header">
          <div className="keypad-headset-status">
            <div className="keypad-headset-dot" aria-hidden="true" />
            <span className="keypad-headset-label">헤드셋 연결됨</span>
          </div>
          <button className="keypad-close-btn" onClick={onClose} aria-label="키패드 닫기 (음성 끄기)">
            ✕
          </button>
        </div>

        {/* 바디 */}
        <div className="keypad-body">

          {/* 방향키 */}
          <span className="keypad-section-label">방향키</span>
          <div className="keypad-nav-grid" role="group" aria-label="방향키">
            <button
              className="keypad-nav-btn"
              style={{ gridColumn: 2, gridRow: 1 }}
              onClick={() => handleKey('NAVUP')}
              aria-label="위로"
            >▲</button>
            <button
              className="keypad-nav-btn"
              style={{ gridColumn: 1, gridRow: 2 }}
              onClick={() => handleKey('NAVPREVIOUS')}
              aria-label="이전"
            >◀</button>
            <button
              className="keypad-ok-btn"
              style={{ gridColumn: 2, gridRow: 2 }}
              onClick={() => handleKey('NAVENTER')}
              aria-label="확인"
            >확인</button>
            <button
              className="keypad-nav-btn"
              style={{ gridColumn: 3, gridRow: 2 }}
              onClick={() => handleKey('NAVNEXT')}
              aria-label="다음"
            >▶</button>
            <button
              className="keypad-nav-btn"
              style={{ gridColumn: 2, gridRow: 3 }}
              onClick={() => handleKey('NAVDOWN')}
              aria-label="아래로"
            >▼</button>
          </div>

          <hr className="keypad-divider" />

          {/* 숫자 패드 */}
          <span className="keypad-section-label">숫자 입력</span>
          <div className="keypad-number-grid" role="group" aria-label="숫자 패드">
            {['1','2','3','4','5','6','7','8','9'].map((n) => (
              <button
                key={n}
                className="keypad-number-btn"
                onClick={() => handleKey(n as KeypadKey)}
                aria-label={n}
              >{n}</button>
            ))}
            <div />
            <button className="keypad-number-btn" onClick={() => handleKey('0')} aria-label="0">0</button>
            <div />
          </div>

          <hr className="keypad-divider" />

          {/* 보조 버튼 */}
          <div className="keypad-assist-grid" role="group" aria-label="보조 버튼">
            <button className="keypad-assist-btn keypad-assist-cancel"  onClick={() => handleKey('KEY_CANCEL')}>취소</button>
            <button className="keypad-assist-btn keypad-assist-correct" onClick={() => handleKey('KEY_CORRECT')}>정정</button>
            <button className="keypad-assist-btn keypad-assist-listen"  onClick={() => handleKey('KEY_LISTEN')}>듣기</button>
            <button className="keypad-assist-btn keypad-assist-help"    onClick={() => handleKey('NAVHELP')}>?</button>
          </div>

          <p className="keypad-hint" aria-hidden="true">
            키보드 방향키 · Enter · ESC · Backspace 지원
          </p>

        </div>
      </div>
    </div>
  );
};

export default VirtualKeypad;
import { useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTTS } from '../../hooks/useTTS';

export type KeypadKey =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'NAVUP' | 'NAVDOWN' | 'NAVPREVIOUS' | 'NAVNEXT' | 'NAVENTER'
  | 'KEY_CANCEL' | 'KEY_CORRECT' | 'KEY_LISTEN' | 'NAVHELP';

interface VirtualKeypadProps {
  isOpen: boolean;
  onClose: () => void;
  onKey: (key: KeypadKey) => void;
}

/**
 * VirtualKeypad
 *
 * 실제 키오스크 동작 재현:
 * - 실제: 헤드셋 연결 시 물리 키패드 활성화
 * - 포트폴리오: 음성 켜기 클릭 시 가상 키패드 팝업
 *
 * 키 구성 (실무 참고 코드 기반):
 * - 방향키 (상/하/좌/우/확인)
 * - 숫자 패드 (0~9)
 * - 보조 버튼 (취소/정정/듣기/?)
 */
const VirtualKeypad = ({ isOpen, onClose, onKey }: VirtualKeypadProps) => {
  const { speak } = useTTS();

  const handleKey = useCallback(
    (key: KeypadKey) => {
      const ttsMap: Partial<Record<KeypadKey, string>> = {
        NAVUP: '위로',
        NAVDOWN: '아래로',
        NAVPREVIOUS: '이전',
        NAVNEXT: '다음',
        NAVENTER: '확인',
        KEY_CANCEL: '취소',
        KEY_CORRECT: '정정',
        KEY_LISTEN: '듣기',
        NAVHELP: '도움말',
      };
      if (ttsMap[key]) speak(ttsMap[key]!);
      onKey(key);
    },
    [onKey, speak]
  );

  // 컴퓨터 키보드 → 키패드 이벤트 연결
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
    <Overlay
      role="dialog"
      aria-label="가상 키패드 (물리 키패드 시뮬레이션)"
      aria-modal="false"
    >
      <Pad>
        {/* 헤더 — 헤드셋 연결 상태 표시 */}
        <PadHeader>
          <HeadsetStatus>
            <HeadsetDot aria-hidden="true" />
            <HeadsetLabel>헤드셋 연결됨</HeadsetLabel>
          </HeadsetStatus>
          <PadCloseBtn
            onClick={onClose}
            aria-label="키패드 닫기 (음성 끄기)"
          >✕</PadCloseBtn>
        </PadHeader>

        <PadBody>
          {/* 방향키 */}
          <SectionLabel>방향키</SectionLabel>
          <NavGrid role="group" aria-label="방향키">
            <NavBtn
              style={{ gridColumn: 2, gridRow: 1 }}
              onClick={() => handleKey('NAVUP')}
              aria-label="위로"
            >▲</NavBtn>
            <NavBtn
              style={{ gridColumn: 1, gridRow: 2 }}
              onClick={() => handleKey('NAVPREVIOUS')}
              aria-label="이전"
            >◀</NavBtn>
            <OkBtn
              style={{ gridColumn: 2, gridRow: 2 }}
              onClick={() => handleKey('NAVENTER')}
              aria-label="확인"
            >확인</OkBtn>
            <NavBtn
              style={{ gridColumn: 3, gridRow: 2 }}
              onClick={() => handleKey('NAVNEXT')}
              aria-label="다음"
            >▶</NavBtn>
            <NavBtn
              style={{ gridColumn: 2, gridRow: 3 }}
              onClick={() => handleKey('NAVDOWN')}
              aria-label="아래로"
            >▼</NavBtn>
          </NavGrid>

          <Divider />

          {/* 숫자 패드 */}
          <SectionLabel>숫자 입력</SectionLabel>
          <NumberGrid role="group" aria-label="숫자 패드">
            {['1','2','3','4','5','6','7','8','9'].map((n) => (
              <NumberBtn key={n} onClick={() => handleKey(n as KeypadKey)} aria-label={`${n}`}>
                {n}
              </NumberBtn>
            ))}
            <EmptyCell />
            <NumberBtn onClick={() => handleKey('0')} aria-label="0">0</NumberBtn>
            <EmptyCell />
          </NumberGrid>

          <Divider />

          {/* 보조 버튼 */}
          <AssistGrid role="group" aria-label="보조 버튼">
            <AssistBtn $c="var(--accent-red)"    onClick={() => handleKey('KEY_CANCEL')}>취소</AssistBtn>
            <AssistBtn $c="var(--accent-yellow)" onClick={() => handleKey('KEY_CORRECT')}>정정</AssistBtn>
            <AssistBtn $c="var(--accent-green)"  onClick={() => handleKey('KEY_LISTEN')}>듣기</AssistBtn>
            <AssistBtn $c="var(--accent-blue)"   onClick={() => handleKey('NAVHELP')}>?</AssistBtn>
          </AssistGrid>

          <HintText aria-hidden="true">
            키보드 방향키 · Enter · ESC · Backspace 지원
          </HintText>
        </PadBody>
      </Pad>
    </Overlay>
  );
};

export default VirtualKeypad;

/* ===== 애니메이션 ===== */
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
`;

/* ===== Styled Components ===== */

/* KioskFrame 바깥 브라우저 레벨에 고정 */
const Overlay = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 300;
  animation: ${slideIn} 0.22s ease;
`;

const Pad = styled.div`
  width: 240px;
  background-color: #141c34;
  border: 1.5px solid var(--border-active);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(74,144,217,0.15),
    0 12px 40px rgba(0,0,0,0.6);
`;

const PadHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background-color: #0f1428;
  border-bottom: 1px solid var(--border-default);
`;

const HeadsetStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

const HeadsetDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--accent-green);
  animation: ${blink} 2s ease infinite;
`;

const HeadsetLabel = styled.span`
  font-size: 11px;
  color: var(--accent-green);
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const PadCloseBtn = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-muted);
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);

  &:hover { border-color: var(--accent-red); color: var(--accent-red); }
  &:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 2px; }
`;

const PadBody = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionLabel = styled.span`
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 600;
`;

const NavGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 40px);
  gap: 5px;
  width: 136px;
  margin: 0 auto;
`;

const NavBtn = styled.button`
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-default);
  background-color: var(--bg-button);
  color: var(--text-primary);
  font-size: 13px;
  transition: all var(--transition);

  &:hover { background-color: var(--bg-button-hover); border-color: var(--accent-blue); }
  &:active { transform: scale(0.92); }
  &:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 1px; }
`;

const OkBtn = styled(NavBtn)`
  background-color: var(--accent-blue);
  border-color: var(--accent-blue);
  font-size: 11px;
  font-weight: 700;

  &:hover { background-color: #3A7BC8; }
`;

const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
`;

const NumberBtn = styled.button`
  height: 44px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-default);
  background-color: var(--bg-button);
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 600;
  transition: all var(--transition);

  &:hover { background-color: var(--bg-button-hover); border-color: var(--accent-blue); }
  &:active { transform: scale(0.92); }
  &:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 1px; }
`;

const EmptyCell = styled.div``;

const AssistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
`;

const AssistBtn = styled.button<{ $c: string }>`
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1.5px solid ${({ $c }) => $c};
  background-color: transparent;
  color: ${({ $c }) => $c};
  font-size: 11px;
  font-weight: 700;
  transition: all var(--transition);

  &:hover { background-color: ${({ $c }) => $c}22; }
  &:active { transform: scale(0.92); }
  &:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 1px; }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-default);
  margin: 0;
`;

const HintText = styled.p`
  font-size: 10px;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.5;
`;

import { useState } from 'react';
import styled from 'styled-components';
import { useTTS } from '../../hooks/useTTS';

interface ResidentNumberKeypadProps {
  onComplete: (number: string) => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '지우기', '0', '입력'];

const ResidentNumberKeypad = ({ onComplete }: ResidentNumberKeypadProps) => {
  const [input, setInput] = useState('');
  const { speak } = useTTS();

  // 주민번호 표시 형식: 앞 6자리-뒤 7자리, 뒤는 마스킹
  const formatDisplay = (value: string) => {
    if (value.length <= 6) return value;
    const front = value.slice(0, 6);
    const back = '*'.repeat(value.length - 6);
    return `${front}-${back}`;
  };

  const handleKey = (key: string) => {
    if (key === '지우기') {
      const next = input.slice(0, -1);
      setInput(next);
      speak('지웠습니다.');
      return;
    }

    if (key === '입력') {
      if (input.length !== 13) {
        speak('주민번호 13자리를 모두 입력해주세요.');
        return;
      }
      speak('입력되었습니다.');
      onComplete(input);
      return;
    }

    if (input.length >= 13) return;

    const next = input + key;
    setInput(next);

    // 6자리 입력 완료 시 안내
    if (next.length === 6) {
      speak('앞자리 입력 완료. 뒷자리를 입력해주세요.');
    }
  };

  return (
    <Wrapper>
      {/* 입력 표시창 */}
      <DisplayBox
        role="textbox"
        aria-label="주민번호 입력창"
        aria-live="polite"
        aria-readonly="true"
      >
        {input.length === 0 ? (
          <Placeholder>주민번호를 입력하십시오. 예) 901010-1234567</Placeholder>
        ) : (
          <DisplayText>{formatDisplay(input)}</DisplayText>
        )}
        {/* 진행 바 */}
        <ProgressBar>
          <ProgressFill $width={(input.length / 13) * 100} />
        </ProgressBar>
      </DisplayBox>

      {/* 숫자 키패드 */}
      <KeypadGrid role="group" aria-label="숫자 키패드">
        {KEYS.map((key) => (
          <KeyButton
            key={key}
            onClick={() => handleKey(key)}
            aria-label={key === '지우기' ? '한 자리 지우기' : key === '입력' ? '입력 완료' : `${key} 입력`}
            $isAction={key === '지우기' || key === '입력'}
            $isConfirm={key === '입력'}
            disabled={key === '입력' && input.length !== 13}
          >
            {key}
          </KeyButton>
        ))}
      </KeypadGrid>
    </Wrapper>
  );
};

export default ResidentNumberKeypad;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
`;

const DisplayBox = styled.div`
  padding: 18px 20px 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-active);
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Placeholder = styled.span`
  color: var(--text-muted);
  font-size: 14px;
`;

const DisplayText = styled.span`
  color: var(--text-primary);
  font-size: var(--font-size-xl);
  font-weight: 600;
  letter-spacing: 4px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: var(--border-default);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $width: number }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background-color: var(--accent-blue);
  border-radius: 2px;
  transition: width 0.15s ease;
`;

const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const KeyButton = styled.button<{ $isAction?: boolean; $isConfirm?: boolean }>`
  height: 64px;
  border-radius: var(--radius-md);
  font-size: ${({ $isAction }) => ($isAction ? '15px' : 'var(--font-size-xl)')};
  font-weight: ${({ $isConfirm }) => ($isConfirm ? 700 : 500)};
  border: 1.5px solid
    ${({ $isConfirm }) =>
      $isConfirm ? 'var(--accent-blue)' : 'var(--border-default)'};
  background-color: ${({ $isConfirm, $isAction }) =>
    $isConfirm
      ? 'var(--accent-blue)'
      : $isAction
      ? 'var(--bg-card)'
      : 'var(--bg-button)'};
  color: var(--text-primary);
  transition: all var(--transition);

  &:hover:not(:disabled) {
    background-color: ${({ $isConfirm }) =>
      $isConfirm ? '#3A7BC8' : 'var(--bg-button-hover)'};
    border-color: var(--accent-blue);
  }

  &:active:not(:disabled) {
    transform: scale(0.96);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }
`;

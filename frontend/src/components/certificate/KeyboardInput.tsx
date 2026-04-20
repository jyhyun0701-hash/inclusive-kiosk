import { useState } from 'react';
import styled from 'styled-components';
import { HANGUL_INITIAL, addJamo, deleteJamo, stateToString } from '../../utils/hangulComposer';
import type { HangulState } from '../../utils/hangulComposer';

interface KeyboardInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// 표준 한국어 2벌식 키보드 배열
const KO_ROWS = [
  ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'],
  ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
  ['ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'],
];

const KeyboardInput = ({ value, onChange, placeholder = '증명서명을 입력하세요' }: KeyboardInputProps) => {
  // 한글 조합 상태는 내부에서만 관리
  const [hangulState, setHangulState] = useState<HangulState>(HANGUL_INITIAL);

  // 현재 표시 문자열 (부모에게 전달할 값)
  const displayValue = stateToString(hangulState);

  const handleKey = (jamo: string) => {
    setHangulState((prev) => {
      const next = addJamo(prev, jamo);
      onChange(stateToString(next));
      return next;
    });
  };

  const handleDelete = () => {
    setHangulState((prev) => {
      const next = deleteJamo(prev);
      onChange(stateToString(next));
      return next;
    });
  };

  const handleClear = () => {
    setHangulState(HANGUL_INITIAL);
    onChange('');
  };

  return (
    <Wrapper>
      {/* 입력 표시창 */}
      <InputDisplay
        role="textbox"
        aria-label="검색어 입력창"
        aria-live="polite"
      >
        {displayValue
          ? <InputText>{displayValue}</InputText>
          : <Placeholder>{placeholder}</Placeholder>
        }
      </InputDisplay>

      {/* 한글 키보드 */}
      <KeyboardWrapper role="group" aria-label="한글 키보드">
        {KO_ROWS.map((row, ri) => (
          <Row key={ri}>
            {row.map((key) => (
              <Key
                key={key}
                onClick={() => handleKey(key)}
                aria-label={key}
              >
                {key}
              </Key>
            ))}
          </Row>
        ))}

        {/* 마지막 행: 전체삭제 + 한글자지우기 */}
        <Row>
          <ClearKey onClick={handleClear} aria-label="전체 지우기">
            전체삭제
          </ClearKey>
          <DeleteKey onClick={handleDelete} aria-label="한 글자 지우기">
            ⌫ 지우기
          </DeleteKey>
        </Row>
      </KeyboardWrapper>
    </Wrapper>
  );
};

export default KeyboardInput;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputDisplay = styled.div`
  width: 100%;
  min-height: 50px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-active);
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
`;

const InputText = styled.span`
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: 600;
  letter-spacing: 1px;
`;

const Placeholder = styled.span`
  color: var(--text-muted);
  font-size: var(--font-size-base);
`;

const KeyboardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Row = styled.div`
  display: flex;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
`;

const Key = styled.button`
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-default);
  background-color: var(--bg-button);
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
  transition: all var(--transition);

  &:hover {
    background-color: var(--bg-button-hover);
    border-color: var(--accent-blue);
  }
  &:active { transform: scale(0.93); }
  &:focus-visible { outline: 3px solid var(--border-focus); outline-offset: 2px; }
`;

const DeleteKey = styled(Key)`
  width: auto;
  padding: 0 14px;
  font-size: 13px;
  background-color: var(--bg-card);
`;

const ClearKey = styled(Key)`
  width: auto;
  padding: 0 14px;
  font-size: 12px;
  background-color: transparent;
  border-color: var(--accent-red);
  color: var(--accent-red);

  &:hover {
    background-color: rgba(231,76,60,0.1);
    border-color: var(--accent-red);
  }
`;

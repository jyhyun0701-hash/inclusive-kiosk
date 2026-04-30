import React, { useState } from 'react';

interface KoreanKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onCategorySearch: () => void;
}

const KO_ROWS = [
  ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ'],
  ['ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'],
  ['ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ'],
  ['ㅠ','ㅡ','ㅣ','ㅐ','ㅔ','ㅒ','ㅖ'],
];

const EN_ROWS = [
  ['A','B','C','D','E','F','G'],
  ['H','I','J','K','L','M','N'],
  ['O','P','Q','R','S','T','U'],
  ['V','W','X','Y','Z'],
];

type Mode = 'ko' | 'en';

const KoreanKeyboard: React.FC<KoreanKeyboardProps> = ({ value, onChange, onCategorySearch }) => {
  const [mode, setMode] = useState<Mode>('ko');

  const append = (ch: string) => onChange(value + ch);
  const backspace = () => onChange(value.slice(0, -1));

  const rows = mode === 'ko' ? KO_ROWS : EN_ROWS;

  return (
    <div className="keyboard-wrap">
      {/* 모드 전환 */}
      <div className="kb-mode-row">
        <button
          className={`kb-mode-btn${mode === 'en' ? ' active' : ''}`}
          onClick={() => setMode(m => m === 'ko' ? 'en' : 'ko')}
        >
          {mode === 'ko' ? 'English' : '한국어'}
        </button>
      </div>

      {/* 키 행 */}
      {rows.map((row, ri) => (
        <div className="keyboard-row" key={ri}>
          {row.map((ch, ci) => (
            <button
              key={ch}
              className={`key-btn${ri === 0 && ci === 0 ? ' first' : ''}`}
              onClick={() => append(ch)}
              aria-label={ch}
            >
              {ch}
            </button>
          ))}
        </div>
      ))}

      {/* 하단 액션 */}
      <div className="keyboard-actions">
        <button className="kb-action-btn category" onClick={onCategorySearch}>
          카테고리 검색
        </button>
        <button className="kb-action-btn delete" onClick={backspace}>
          ✕ 지우기
        </button>
      </div>
    </div>
  );
};

export default KoreanKeyboard;
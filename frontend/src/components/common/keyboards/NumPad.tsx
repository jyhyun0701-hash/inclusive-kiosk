import React from 'react';
import type { Language } from '../../../types/kiosk';

interface NumPadProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  maxLength?: number;
  language?: Language;
}

const NUMPAD_LABELS: Record<Language, { del: string; confirm: string }> = {
  ko: { del: '지우기', confirm: '입력'  },
  en: { del: 'Delete', confirm: 'Enter' },
  ja: { del: '削除',   confirm: '入力'  },
  zh: { del: '删除',   confirm: '确认'  },
};

const NumPad: React.FC<NumPadProps> = ({ value, onChange, onConfirm, maxLength = 13, language = 'ko' }) => {
  const lbl = NUMPAD_LABELS[language];

  const press = (key: string) => {
    if (key === 'del')     { onChange(value.slice(0, -1)); return; }
    if (key === 'confirm') { onConfirm(); return; }
    if (value.length < maxLength) onChange(value + key);
  };

  const keys = ['1','2','3','4','5','6','7','8','9','del','0','confirm'];

  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['del', '0', 'confirm'],
  ];

  return (
    <div className="numpad-wrap">
      {rows.map((row, ri) =>
        row.map((key) => {
          const label = key === 'del' ? lbl.del : key === 'confirm' ? lbl.confirm : key;
          return (
            <button
              key={`${ri}-${key}`}
              className={`num-key${key === 'del' ? ' del' : ''}${key === 'confirm' ? ' confirm' : ''}`}
              onClick={() => press(key)}
              aria-label={label}
              data-tabfocus="Y"
              data-tabgroup="numpad"
              data-ttsmsg={label}
              tabIndex={keys.indexOf(key)}
            >
              {label}
            </button>
          );
        })
      )}
    </div>
  );
};

export default NumPad;
import React from 'react';

interface NumPadProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  maxLength?: number;
}

const NumPad: React.FC<NumPadProps> = ({ value, onChange, onConfirm, maxLength = 13 }) => {
  const press = (key: string) => {
    if (key === 'del')     { onChange(value.slice(0, -1)); return; }
    if (key === 'confirm') { onConfirm(); return; }
    if (value.length < maxLength) onChange(value + key);
  };

  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['del', '0', 'confirm'],
  ];

  return (
    <div className="numpad-wrap">
      {rows.map((row, ri) =>
        row.map((key) => (
          <button
            key={`${ri}-${key}`}
            className={`num-key${key === 'del' ? ' del' : ''}${key === 'confirm' ? ' confirm' : ''}`}
            onClick={() => press(key)}
            aria-label={key === 'del' ? '지우기' : key === 'confirm' ? '입력' : key}
          >
            {key === 'del' ? '지우기' : key === 'confirm' ? '입력' : key}
          </button>
        ))
      )}
    </div>
  );
};

export default NumPad;
import React, { useEffect } from 'react';

interface InfoModalProps {
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="이용 안내">
      <div className="info-modal">
        <p style={{ fontWeight: 700, marginBottom: 12, fontSize: '1.1rem' }}>
          키패드 사용법 안내입니다.
        </p>
        <p style={{ color: '#555', lineHeight: 1.9 }}>
          상축, 하축 버튼은 항목 이동시에 사용하며,<br />
          원형 버튼은 입력시 사용합니다.
        </p>

        <div className="info-keypad">
          {/* 위 */}
          <div />
          <div className="info-key">∧</div>
          <div />
          {/* 가운데 */}
          <div className="info-key">&#60;</div>
          <div className="info-key" style={{ background: '#aaa' }}>○</div>
          <div className="info-key">&#62;</div>
          {/* 아래 */}
          <div />
          <div className="info-key">∨</div>
          <div />
        </div>

        <button
          className="modal-btn confirm"
          style={{ width: '100%', marginTop: 8 }}
          onClick={onClose}
          autoFocus
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default InfoModal;

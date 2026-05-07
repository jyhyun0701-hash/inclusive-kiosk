import React, { useEffect } from 'react';
import imgKeypadInfo from '../../assets/images/keypad-info.png';
import imgPopupInfo from  '../../assets/images/popup-info.png';

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
      <div className="info-modal content-verify" style={{ justifyContent: 'flex-start' }}>
        <div className="info-title-box" style={{ margin: '-3px -50px', borderRadius: 'var(--r) var(--r) 0 0' }}>
          <img src={imgPopupInfo} alt="imgPopupInfo" />
          <p className="info-title">키패드 사용법 안내 팝업창</p>
        </div>

        <p>
          키오스크 하단에 위치한 음성 켜기 버튼 입력 시, 키패드 기능과 음성 안내 기능이 활성화됩니다.
          키패드의 상측, 하측 버튼은 항목 이동시에 사용하며,
          원형 버튼은 입력시 사용합니다.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={imgKeypadInfo} alt="imgKeypadInfo" style={{ width: '300px', height: '300px', objectFit: 'contain' }} />
        </div>

        <button
          className="modal-btn confirm"
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '350px' }}
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

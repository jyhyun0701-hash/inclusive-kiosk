import React, { useEffect, useRef } from 'react';
import type { Certificate, Language } from '../../types/kiosk';
import imgPopupInfo from  '../../assets/images/popup-info.png';

interface ConfirmationModalProps {
  certificate: Certificate;
  language: Language;
  onConfirm: () => void;
  onCancel: () => void;
}

const LABELS: Record<Language, { title: string; body: (name: string) => string; confirm: string; cancel: string }> = {
  ko: {
    title: '증명서 발급 확인 팝업창',
    body: (name) => `${name}이(가) 선택되었습니다.\n맞으시면 발급 버튼을 눌러주세요.`,
    confirm: '발급',
    cancel: '취소',
  },
  en: {
    title: 'Confirm Certificate Issuance',
    body: (name) => `${name} has been selected.\nPress Issue to proceed.`,
    confirm: 'Issue',
    cancel: 'Cancel',
  },
  ja: {
    title: '証明書発行確認',
    body: (name) => `${name}が選択されました。\nよろしければ発行ボタンを押してください。`,
    confirm: '発行',
    cancel: 'キャンセル',
  },
  zh: {
    title: '确认证明书发证',
    body: (name) => `已选择${name}。\n确认无误请点击发证按钮。`,
    confirm: '发证',
    cancel: '取消',
  },
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  certificate, language, onConfirm, onCancel,
}) => {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const l = LABELS[language];

  // 접근성: 모달 열릴 때 발급 버튼으로 포커스 이동
  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-box">
        <div className="modal-title-box" id="modal-title">
          <img src={imgPopupInfo} alt="imgPopupInfo"/>
          <span>{l.title}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', padding: '48px 60px' }}>
          <div className="modal-body">
            {l.body(certificate.nameKo).split('\n').map((line, i) => (
              <p key={i}>{i === 0 ? <strong>{line}</strong> : line}</p>
            ))}
          </div>
          <div className="modal-actions">
            <button
              ref={confirmRef}
              className="modal-btn confirm"
              onClick={onConfirm}
              aria-label={`${l.confirm} - ${certificate.nameKo}`}
            >
              {l.confirm}
            </button>
            <button
              className="modal-btn cancel"
              onClick={onCancel}
              aria-label={l.cancel}
            >
              {l.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

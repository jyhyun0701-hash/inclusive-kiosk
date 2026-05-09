import React, { useCallback, useEffect, useRef } from 'react';
import type { Certificate, Language } from '../../types/kiosk';
import { getCertName } from '../../types/kiosk';
import imgPopupInfo from  '../../assets/images/popup-info.png';
import { useFocusManagerContext } from '../../context/FocusManagerContext';

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
  const fm = useFocusManagerContext();
  const l = LABELS[language];
  const certName = getCertName(certificate, language);
  const savedFocusRef = useRef<{ group: string; tabindex: number } | null>(null);

  useEffect(() => {
    // StrictMode에서 useEffect가 2번 실행될 때 2차 실행에서 currentGroup이
    // 이미 'modal-confirm'으로 바뀐 상태이므로 savedFocusRef를 덮어쓰지 않도록 1회만 캡처
    if (!savedFocusRef.current) {
      const info = fm.getCurrentFocusInfo();
      if (info) savedFocusRef.current = { group: info.group, tabindex: info.tabindex };
    }

    fm.initTabGroup(document, 'modal-confirm', { tabRotation: true, playTtsOnMoved: true });
    if (fm.isActive()) fm.switchGroup('modal-confirm', 0);
  }, []);

  // 취소: 먼저 상태 변경(onCancel) → double rAF 후 트리거 버튼으로 포커스 복원
  const handleCancel = useCallback(() => {
    onCancel();
    if (fm.isActive() && savedFocusRef.current) {
      const { group, tabindex } = savedFocusRef.current;
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          fm.moveTabFocusManual(document, group, tabindex)
        )
      );
    }
  }, [fm, onCancel]);

  // 확인: 다음 페이지(identity)로 이동하므로 goTo가 포커스를 처리
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleCancel]);

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
            {l.body(certName).split('\n').map((line, i) => (
              <p key={i}>{i === 0 ? <strong>{line}</strong> : line}</p>
            ))}
          </div>
          <div className="modal-actions">
            {/* tabIndex=0: 모달 진입 시 첫 포커스 */}
            <button
              className="modal-btn confirm"
              onClick={handleConfirm}
              aria-label={`${l.confirm} - ${certName}`}
              data-tabfocus="Y"
              data-tabgroup="modal-confirm"
              data-ttsmsg={`${l.confirm} - ${certName}`}
              tabIndex={0}
              autoFocus
            >
              {l.confirm}
            </button>
            <button
              className="modal-btn cancel"
              onClick={handleCancel}
              aria-label={l.cancel}
              data-tabfocus="Y"
              data-tabgroup="modal-confirm"
              data-ttsmsg={l.cancel}
              tabIndex={1}
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

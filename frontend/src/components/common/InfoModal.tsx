import React, { useCallback, useEffect, useRef } from 'react';
import imgKeypadInfo from '../../assets/images/keypad-info.png';
import imgPopupInfo from  '../../assets/images/popup-info.png';
import { useFocusManagerContext } from '../../context/FocusManagerContext';
import { speakAndThen } from '../../utils/speakSafe';

interface InfoModalProps {
  onClose: () => void;
}

const INFO_TTS = '키오스크 하단에 위치한 음성 켜기 버튼 입력 시, 키패드 기능과 음성 안내 기능이 활성화됩니다. 키패드의 상측, 하측 버튼은 항목 이동시에 사용하며, 원형 버튼은 입력시 사용합니다. 확인 버튼을 누르면 팝업창이 닫힙니다.';

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  const fm = useFocusManagerContext();
  // 모달이 열릴 때 트리거 엘리먼트를 직접 저장 (prevGroup에 의존하지 않음)
  const savedFocusRef = useRef<{ group: string; tabindex: number } | null>(null);

  useEffect(() => {
    // StrictMode에서 useEffect가 2번 실행될 때 2차 실행에서 currentGroup이
    // 이미 'modal-info'로 바뀐 상태이므로 savedFocusRef를 덮어쓰지 않도록 1회만 캡처
    if (!savedFocusRef.current) {
      const info = fm.getCurrentFocusInfo();
      if (info) savedFocusRef.current = { group: info.group, tabindex: info.tabindex };
    }

    fm.initTabGroup(document, 'modal-info', { tabRotation: false, playTtsOnMoved: true });

    if (fm.isActive()) {
        // 안내 내용 발화 → 완료 후 확인 버튼 포커스 + 발화
        speakAndThen(INFO_TTS, () => fm.switchGroup('modal-info', 0));
      }
    }, []);

  const handleClose = useCallback(() => {
    onClose(); // 먼저 상태 변경 (React re-render 예약)

    // React DOM 커밋 완료 후 포커스 복원
    // - onClose() 후 상태 변경으로 인한 className 업데이트가 focused 클래스를 덮지 않도록
    //   double rAF로 커밋 완료 시점을 기다린 뒤 moveTabFocusManual 호출
    if (fm.isActive() && savedFocusRef.current) {
      const { group, tabindex } = savedFocusRef.current;
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          fm.moveTabFocusManual(document, group, tabindex)
        )
      );
    }
  }, [fm, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

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
          onClick={handleClose}
          autoFocus
          data-tabfocus="Y"
          data-tabgroup="modal-info"
          data-ttsmsg="확인"
          tabIndex={0}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default InfoModal;

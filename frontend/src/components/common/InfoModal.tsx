import React, { useCallback, useEffect, useRef } from 'react';
import imgKeypadInfo from '../../assets/images/keypad-info.png';
import imgPopupInfo from  '../../assets/images/popup-info.png';
import { useFocusManagerContext } from '../../context/FocusManagerContext';
import { speakAndThen } from '../../utils/speakSafe';
import type { Language } from '../../types/kiosk';

interface InfoModalProps {
  onClose: () => void;
  language: Language;
}

const INFO_CONTENT: Record<Language, { title: string; body: string; confirm: string }> = {
  ko: {
    title: '키패드 사용법 안내 팝업창',
    body: '키오스크 하단에 위치한 음성 켜기 버튼 입력 시, 키패드 기능과 음성 안내 기능이 활성화됩니다. 키패드의 상측, 하측 버튼은 항목 이동시에 사용하며, 원형 버튼은 입력시 사용합니다.',
    confirm: '확인',
  },
  en: {
    title: 'Keypad Usage Guide',
    body: 'Press the voice button at the bottom of the kiosk to activate keypad and voice guidance. Use the upper/lower buttons to navigate items, and the center button to confirm.',
    confirm: 'Confirm',
  },
  ja: {
    title: 'キーパッド使用説明',
    body: 'キオスク下部の音声ボタンを押すと、キーパッドと音声ガイド機能が有効になります。上下ボタンで項目を移動し、中央ボタンで入力します。',
    confirm: '確認',
  },
  zh: {
    title: '键盘使用说明',
    body: '按下信息亭底部的语音按钮，即可激活键盘和语音引导功能。使用上下按钮移动项目，圆形按钮用于输入确认。',
    confirm: '确认',
  },
};

const getInfoTts = (language: Language) => INFO_CONTENT[language].body;

const InfoModal: React.FC<InfoModalProps> = ({ onClose, language }) => {
  const fm = useFocusManagerContext();
  const savedFocusRef = useRef<{ group: string; tabindex: number } | null>(null);
  const c = INFO_CONTENT[language] ?? INFO_CONTENT['ko'];

  useEffect(() => {
      if (!savedFocusRef.current) {
        const info = fm.getCurrentFocusInfo();
        if (info) savedFocusRef.current = { group: info.group, tabindex: info.tabindex };
      }
      fm.initTabGroup(document, 'modal-info', { tabRotation: false, playTtsOnMoved: true });
      if (fm.isActive()) {
        speakAndThen(c.body, () => fm.switchGroup('modal-info', 0));
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
          <p className="info-title">{c.title}</p>
        </div>

        <p>{c.body}</p>

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
          data-ttsmsg={c.confirm}
          tabindex={0}
        >
          {c.confirm}
        </button>
      </div>
    </div>
  );
};

export default InfoModal;

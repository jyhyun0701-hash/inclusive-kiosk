import { useEffect, useCallback, useRef } from 'react';
import VirtualKeypad, { type KeypadKey } from '../components/common/VirtualKeypad';
import '../assets/styles/keypad.css';

const CHANNEL_NAME = 'kiosk-keypad';

const KeypadPage = () => {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);

    // 메인 창 닫히면 자동으로 키패드 창도 닫기
    const timer = setInterval(() => {
      if (window.opener?.closed) window.close();
    }, 1000);

    return () => {
      clearInterval(timer);
      channelRef.current?.close();
    };
  }, []);

  const handleKey = useCallback((key: KeypadKey) => {
    channelRef.current?.postMessage({ type: 'KEY', key });
  }, []);

  const handleClose = useCallback(() => {
    channelRef.current?.postMessage({ type: 'CLOSE' });
    window.close();
  }, []);

  return (
    <div style={{ background: '#0f1428', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <VirtualKeypad isOpen={true} onClose={handleClose} onKey={handleKey} />
    </div>
  );
};

export default KeypadPage;
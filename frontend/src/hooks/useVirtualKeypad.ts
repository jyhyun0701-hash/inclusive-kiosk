import { useCallback } from 'react';
import { useFocusManagerContext } from '../context/FocusManagerContext';
import { numInputRegistry } from '../utils/numInputRegistry';
import { speakSafe } from '../utils/speakSafe';
import type { KeypadKey } from '../components/common/VirtualKeypad';

export const useVirtualKeypad = () => {
  const fm = useFocusManagerContext();

  const handleKeypadKey = useCallback(
    (key: KeypadKey) => {
      switch (key) {
        case 'NAVUP':
        case 'NAVPREVIOUS':
          fm.moveByCurrentGroup('UP');
          break;

        case 'NAVDOWN':
        case 'NAVNEXT':
          fm.moveByCurrentGroup('DOWN');
          break;

        case 'NAVENTER': {
          if (numInputRegistry.hasHandler()) {
            numInputRegistry.input('ENTER');
            break;
          }
          const info = fm.getCurrentFocusInfo();
          if (!info) break;
          fm.playTtsFromElement(info.element);
          setTimeout(() => info.element.click(), 80);
          break;
        }

        case 'KEY_CANCEL':
          document.dispatchEvent(
            // bubbles: false — VirtualKeypad 리스너로 역류 방지
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: false })
          );
          break;

        case 'KEY_CORRECT':
          if (numInputRegistry.hasHandler()) {
            numInputRegistry.input('DEL');
          } else {
            const info = fm.getCurrentFocusInfo();
            if (info) {
              // bubbles: false — 무한루프 방지
              info.element.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Backspace', bubbles: false })
              );
            }
          }
          break;

        case 'KEY_LISTEN':
          fm.readCurrentFocus();
          break;

        case 'NAVHELP':
          speakSafe('이용 안내입니다. 방향키로 항목을 이동하고 확인 버튼으로 선택하세요.');
          break;

        default:
          if (/^[0-9]$/.test(key)) {
            if (numInputRegistry.hasHandler()) {
              numInputRegistry.input(key);
            } else {
              const info = fm.getCurrentFocusInfo();
              if (info) {
                // bubbles: false — 무한루프 방지
                info.element.dispatchEvent(
                  new KeyboardEvent('keydown', { key, bubbles: false })
                );
              }
            }
          }
          break;
      }
    },
    [fm]
  );

  return { handleKeypadKey };
};

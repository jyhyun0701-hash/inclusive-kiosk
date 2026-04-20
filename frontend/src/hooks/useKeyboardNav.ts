import { useEffect } from 'react';

interface UseKeyboardNavOptions {
  selector?: string;
  arrowKeys?: boolean;
}

/**
 * 방향키 네비게이션 훅
 * arrowKeys: true 로 설정하면 ↑↓←→ 키로 포커스 이동
 */
export const useKeyboardNav = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseKeyboardNavOptions = {}
) => {
  const { selector = 'button:not(:disabled), [tabindex="0"]', arrowKeys = false } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !arrowKeys) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(selector)
      ).filter((el) => !el.closest('[aria-hidden="true"]'));

      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
      if (currentIndex === -1) return;

      e.preventDefault();

      let nextIndex = currentIndex;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % focusable.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + focusable.length) % focusable.length;
      }

      focusable[nextIndex]?.focus();
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, selector, arrowKeys]);
};

/**
 * 페이지 진입 시 첫 번째 포커스 가능 요소로 자동 포커스
 */
export const useInitialFocus = (
  containerRef: React.RefObject<HTMLElement>,
  selector = 'button:not(:disabled), [tabindex="0"], input:not(:disabled)'
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const first = container.querySelector<HTMLElement>(selector);
    const timer = setTimeout(() => first?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);
};

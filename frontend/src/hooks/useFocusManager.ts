import { useRef, useCallback } from 'react';
import { speakSafe, stopSpeak } from '../utils/speakSafe';

export interface FocusManager {
  initTabGroup:         (doc: Document, group: string, opts: TabGroupOption) => void;
  registerGroupChain:   (group: string, chain: GroupChain) => void;
  initTabFocus:         (doc: Document, group: string, tabindex: number) => void;
  initTabFocusWhenReady:(doc: Document, group: string, tabindex: number) => void;
  moveTabFocusManual:   (doc: Document, group: string, tabindex: number, onMoved?: OnMovedFn) => void;
  moveByCurrentGroup:   (direction: 'UP' | 'DOWN') => void;
  getCurrentFocusInfo:  () => FocusInfo | null;
  restorePrevGroup:     () => void;
  readCurrentFocus:     () => void;
  activateFocusMode:    (group: string, tabindex?: number, doc?: Document) => void;
  deactivateFocusMode:  (doc?: Document) => void;
  playTtsFromElement:   (el: HTMLElement) => void;
  switchGroup:          (group: string, tabindex?: number) => void;
  isActive:             () => boolean;
}

interface TabGroupOption { tabRotation?: boolean; playTtsOnMoved?: boolean; }
interface GroupChain     { next?: string; prev?: string; }
interface FocusInfo      { group: string; tabindex: number; element: HTMLElement; }
type OnMovedFn = (info: FocusInfo) => void;

export const useFocusManager = (): FocusManager => {
  const tabGroupOptions    = useRef<Record<string, TabGroupOption>>({});
  const lastFocusedByGroup = useRef<Record<string, number>>({});
  const currentGroup       = useRef<{ group: string; doc: Document } | null>(null);
  const prevGroup          = useRef<{ group: string; doc: Document } | null>(null);
  const groupChains        = useRef<Record<string, GroupChain>>({});

  const removeFocusedStyle = useCallback((doc: Document = document) => {
    doc.querySelectorAll<HTMLElement>('[data-tabfocus="Y"]')
      .forEach(el => el.classList.remove('focused'));
  }, []);

  const getSortedElements = useCallback(
    (group: string, doc: Document = document): HTMLElement[] =>
      Array.from(doc.querySelectorAll<HTMLElement>(
        `[data-tabfocus="Y"][data-tabgroup="${group}"][tabindex]`
      )).sort((a, b) =>
        parseInt(a.getAttribute('tabindex') ?? '0', 10) -
        parseInt(b.getAttribute('tabindex') ?? '0', 10)
      ),
    []
  );

  const playTtsFromElement = useCallback((el: HTMLElement) => {
    const msg = el.getAttribute('data-ttsmsg');
    if (msg) speakSafe(msg);
  }, []);

  /**
   * DOM 요소 대기 — MutationObserver + requestAnimationFrame
   * rAF를 사용해 브라우저가 실제로 페인트한 후 요소를 탐색
   */
  const waitForElement = useCallback(
    (selector: string, doc: Document, onFound: (el: HTMLElement) => void, timeout = 3000) => {
      const el = doc.querySelector<HTMLElement>(selector);
      if (el) { requestAnimationFrame(() => onFound(el)); return; }

      const start = Date.now();
      const observer = new MutationObserver(() => {
        const found = doc.querySelector<HTMLElement>(selector);
        if (found) {
          observer.disconnect();
          // 페인트 완료 후 실행
          requestAnimationFrame(() => requestAnimationFrame(() => onFound(found)));
        } else if (Date.now() - start > timeout) {
          observer.disconnect();
          console.warn(`[FM] waitForElement timeout: ${selector}`);
        }
      });
      observer.observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['tabindex', 'data-tabfocus', 'data-tabgroup'] });
    },
    []
  );

  const applyFocus = useCallback(
    (el: HTMLElement, group: string, tabindex: number, doc: Document, ttsEnabled = true) => {
      removeFocusedStyle(doc);
      el.focus();
      el.classList.add('focused');
      lastFocusedByGroup.current[group] = tabindex;
      currentGroup.current = { group, doc };
      const opts = tabGroupOptions.current[group];
      if (ttsEnabled && opts?.playTtsOnMoved !== false) playTtsFromElement(el);
    },
    [removeFocusedStyle, playTtsFromElement]
  );

  const initTabGroup = useCallback(
    (_doc: Document, group: string, opts: TabGroupOption) => {
      tabGroupOptions.current[group] = opts;
    }, []
  );

  const registerGroupChain = useCallback(
    (group: string, chain: GroupChain) => {
      groupChains.current[group] = chain;
    }, []
  );

  const initTabFocus = useCallback(
    (doc: Document = document, group: string, tabindex: number) => {
      const selector = `[data-tabfocus="Y"][data-tabgroup="${group}"][tabindex="${tabindex}"]`;
      const el = doc.querySelector<HTMLElement>(selector);
      if (!el) {
        console.warn(`[FM] initTabFocus: group="${group}" tabindex=${tabindex} not found`);
        return;
      }
      prevGroup.current = null;
      applyFocus(el, group, tabindex, doc);
    },
    [applyFocus]
  );

  const initTabFocusWhenReady = useCallback(
    (doc: Document = document, group: string, tabindex: number) => {
      const selector = `[data-tabfocus="Y"][data-tabgroup="${group}"][tabindex="${tabindex}"]`;
      const el = doc.querySelector<HTMLElement>(selector);
      if (el) {
        requestAnimationFrame(() => {
          prevGroup.current = null;
          applyFocus(el, group, tabindex, doc);
        });
        return;
      }
      waitForElement(selector, doc, (found) => {
        prevGroup.current = null;
        applyFocus(found, group, tabindex, doc);
      });
    },
    [applyFocus, waitForElement]
  );

  const moveTabFocusManual = useCallback(
    (doc: Document = document, group: string, tabindex: number, onMoved?: OnMovedFn) => {
      const selector = `[data-tabfocus="Y"][data-tabgroup="${group}"][tabindex="${tabindex}"]`;
      const el = doc.querySelector<HTMLElement>(selector);
      const apply = (target: HTMLElement) => {
        prevGroup.current = currentGroup.current;
        applyFocus(target, group, tabindex, doc);
        onMoved?.({ group, tabindex, element: target });
      };
      if (el) apply(el);
      else waitForElement(selector, doc, apply);
    },
    [applyFocus, waitForElement]
  );

  const switchGroup = useCallback(
    (group: string, tabindex?: number) => {
      const doc = document;
      let targetIdx = tabindex ?? lastFocusedByGroup.current[group];
      if (targetIdx === undefined) {
        const els = getSortedElements(group, doc);
        if (els.length === 0) return;
        targetIdx = parseInt(els[0].getAttribute('tabindex') ?? '0', 10);
      }
      const selector = `[data-tabfocus="Y"][data-tabgroup="${group}"][tabindex="${targetIdx}"]`;
      const el = doc.querySelector<HTMLElement>(selector);
      const apply = (target: HTMLElement) => {
        prevGroup.current = currentGroup.current;
        applyFocus(target, group, targetIdx!, doc);
      };
      if (el) apply(el);
      else waitForElement(selector, doc, apply);
    },
    [getSortedElements, applyFocus, waitForElement]
  );

  const moveByCurrentGroup = useCallback(
    (direction: 'UP' | 'DOWN') => {
      if (!currentGroup.current) return;
      const { group, doc } = currentGroup.current;
      const elements = getSortedElements(group, doc);
      if (elements.length === 0) return;

      const lastIdx = lastFocusedByGroup.current[group];
      let ci = elements.findIndex(
        el => parseInt(el.getAttribute('tabindex') ?? '0', 10) === lastIdx
      );
      if (ci === -1) ci = elements.indexOf(document.activeElement as HTMLElement);

      const opts      = tabGroupOptions.current[group];
      const rotation  = opts?.tabRotation !== false;
      const chain     = groupChains.current[group];

      if (direction === 'DOWN' && ci === elements.length - 1) {
        if (chain?.next) { switchGroup(chain.next, 0); return; }
        if (!rotation) return;
      }
      if (direction === 'UP' && ci <= 0) {
        if (chain?.prev) {
          const prevEls = getSortedElements(chain.prev, doc);
          if (prevEls.length > 0) {
            const last = prevEls[prevEls.length - 1];
            switchGroup(chain.prev, parseInt(last.getAttribute('tabindex') ?? '0', 10));
            return;
          }
        }
        if (!rotation) return;
      }

      const ni = direction === 'DOWN'
        ? (rotation ? (ci + 1) % elements.length : ci + 1)
        : (rotation ? (ci - 1 + elements.length) % elements.length : Math.max(0, ci - 1));

      const nextEl = elements[ni];
      if (!nextEl) return;

      removeFocusedStyle(doc);
      nextEl.focus();
      nextEl.classList.add('focused');
      lastFocusedByGroup.current[group] = parseInt(nextEl.getAttribute('tabindex') ?? '0', 10);
      playTtsFromElement(nextEl);
    },
    [getSortedElements, removeFocusedStyle, playTtsFromElement, switchGroup]
  );

  const getCurrentFocusInfo = useCallback((): FocusInfo | null => {
    if (currentGroup.current) {
      const { group, doc } = currentGroup.current;
      const tabindex = lastFocusedByGroup.current[group];
      if (tabindex !== undefined) {
        const el = doc.querySelector<HTMLElement>(
          `[data-tabfocus="Y"][data-tabgroup="${group}"][tabindex="${tabindex}"]`
        );
        if (el) return { group, tabindex, element: el };
      }
    }
    const active = document.activeElement as HTMLElement | null;
    if (active?.getAttribute('data-tabfocus') === 'Y' &&
        active.hasAttribute('data-tabgroup') && active.hasAttribute('tabindex')) {
      return {
        group:    active.getAttribute('data-tabgroup')!,
        tabindex: parseInt(active.getAttribute('tabindex')!, 10),
        element:  active,
      };
    }
    return null;
  }, []);

  const restorePrevGroup = useCallback(() => {
    if (!prevGroup.current) return;
    const { group, doc } = prevGroup.current;
    moveTabFocusManual(doc, group, lastFocusedByGroup.current[group] ?? 0);
  }, [moveTabFocusManual]);

  const readCurrentFocus = useCallback(() => {
    const info = getCurrentFocusInfo();
    if (info) playTtsFromElement(info.element);
  }, [getCurrentFocusInfo, playTtsFromElement]);

  const activateFocusMode = useCallback(
    (group: string, tabindex = 0, doc: Document = document) => {
      // rAF으로 React 렌더 완료 후 실행
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          initTabFocusWhenReady(doc, group, tabindex);
        });
      });
    },
    [initTabFocusWhenReady]
  );

  const deactivateFocusMode = useCallback((doc: Document = document) => {
    removeFocusedStyle(doc);
    stopSpeak();
    currentGroup.current = null;
    prevGroup.current = null;
  }, [removeFocusedStyle]);

  const isActive = useCallback(() => currentGroup.current !== null, []);

  return {
    initTabGroup, registerGroupChain,
    initTabFocus, initTabFocusWhenReady,
    moveTabFocusManual, moveByCurrentGroup,
    getCurrentFocusInfo, restorePrevGroup,
    readCurrentFocus, activateFocusMode,
    deactivateFocusMode, playTtsFromElement,
    switchGroup, isActive,
  };
};

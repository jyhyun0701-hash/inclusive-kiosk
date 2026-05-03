import { useRef, useCallback } from 'react';
import { speakSafe, stopSpeak } from '../utils/speakSafe';

export interface FocusManager {
  initTabGroup:          (doc: Document, group: string, opts: TabGroupOption) => void;
  registerGroupChain:    (group: string, chain: GroupChain) => void;
  initTabFocus:          (doc: Document, group: string, tabindex: number) => void;
  initTabFocusWhenReady: (doc: Document, group: string, tabindex: number) => void;
  moveTabFocusManual:    (doc: Document, group: string, tabindex: number, onMoved?: OnMovedFn) => void;
  moveByCurrentGroup:    (direction: 'UP' | 'DOWN', onMoved?: OnMovedFn) => void;
  getCurrentFocusInfo:   () => FocusInfo | null;
  restorePrevGroup:      () => void;
  readCurrentFocus:      () => void;
  activateFocusMode:     (group: string, tabindex?: number, doc?: Document) => void;
  deactivateFocusMode:   (doc?: Document) => void;
  playTtsFromElement:    (el: HTMLElement) => void;
  switchGroup:           (group: string, tabindex?: number) => void;
  isActive:              () => boolean;
}

interface TabGroupOption { tabRotation?: boolean; playTtsOnMoved?: boolean; }
interface GroupChain     { next?: string; prev?: string; }
interface FocusInfo      { group: string; tabindex: number; element: HTMLElement; }
type OnMovedFn = (info: FocusInfo) => void;

// ── querySelector는 항상 소문자 tabindex 사용 (React DOM 렌더링 기준)
const sel = (group: string, tabindex: number) =>
  `[data-tabfocus="Y"][data-tabgroup="${group}"][tabindex="${tabindex}"]`;

const selGroup = (group: string) =>
  `[data-tabfocus="Y"][data-tabgroup="${group}"][tabindex]`;

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

  // tabindex 소문자로 읽기
  const getTabindex = (el: HTMLElement) =>
    parseInt(el.getAttribute('tabindex') ?? '0', 10);

  const getSortedElements = useCallback(
    (group: string, doc: Document = document): HTMLElement[] =>
      Array.from(doc.querySelectorAll<HTMLElement>(selGroup(group)))
        .sort((a, b) => getTabindex(a) - getTabindex(b)),
    []
  );

  const playTtsFromElement = useCallback((el: HTMLElement) => {
    const msg = el.getAttribute('data-ttsmsg');
    if (msg) speakSafe(msg);
  }, []);

  const waitForElement = useCallback(
    (selector: string, doc: Document, onFound: (el: HTMLElement) => void, timeout = 3000) => {
      const el = doc.querySelector<HTMLElement>(selector);
      if (el) { requestAnimationFrame(() => onFound(el)); return; }

      const start = Date.now();
      const observer = new MutationObserver(() => {
        const found = doc.querySelector<HTMLElement>(selector);
        if (found) {
          observer.disconnect();
          requestAnimationFrame(() => requestAnimationFrame(() => onFound(found)));
        } else if (Date.now() - start > timeout) {
          observer.disconnect();
          console.warn(`[FM] waitForElement timeout: ${selector}`);
        }
      });
      observer.observe(doc.body, {
        childList: true, subtree: true, attributes: true,
        attributeFilter: ['tabindex', 'data-tabfocus', 'data-tabgroup'],
      });
    },
    []
  );

  const applyFocus = useCallback(
    (el: HTMLElement, group: string, tabindex: number, doc: Document) => {
      removeFocusedStyle(doc);
      el.focus();
      el.classList.add('focused');
      lastFocusedByGroup.current[group] = tabindex;
      currentGroup.current = { group, doc };
      const opts = tabGroupOptions.current[group];
      if (opts?.playTtsOnMoved !== false) playTtsFromElement(el);
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
      const el = doc.querySelector<HTMLElement>(sel(group, tabindex));
      if (!el) {
        console.error(`[FM] initTabFocus: group="${group}" tabindex=${tabindex} not found`);
        return;
      }
      prevGroup.current = null;
      applyFocus(el, group, tabindex, doc);
    },
    [applyFocus]
  );

  const initTabFocusWhenReady = useCallback(
    (doc: Document = document, group: string, tabindex: number) => {
      const selector = sel(group, tabindex);
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
      const selector = sel(group, tabindex);
      const apply = (target: HTMLElement) => {
        prevGroup.current = currentGroup.current;
        applyFocus(target, group, tabindex, doc);
        onMoved?.({ group, tabindex, element: target });
      };
      const el = doc.querySelector<HTMLElement>(selector);
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
        targetIdx = getTabindex(els[0]);
      }
      const selector = sel(group, targetIdx);
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
    (direction: 'UP' | 'DOWN', onMoved?: OnMovedFn) => {
      if (!currentGroup.current) {
        console.error('[FM] No active tabgroup.');
        return;
      }
      const { group, doc } = currentGroup.current;
      const elements = getSortedElements(group, doc);
      if (elements.length === 0) return;

      const lastIdx = lastFocusedByGroup.current[group];
      let ci = elements.findIndex(el => getTabindex(el) === lastIdx);
      if (ci === -1) ci = elements.indexOf(document.activeElement as HTMLElement);

      const opts     = tabGroupOptions.current[group];
      const rotation = opts?.tabRotation !== false;
      const chain    = groupChains.current[group];

      // 그룹 경계에서 체인 이동
      if (direction === 'DOWN' && ci === elements.length - 1) {
        if (chain?.next) { switchGroup(chain.next, 0); return; }
        if (!rotation) return;
      }
      if (direction === 'UP' && ci <= 0) {
        if (chain?.prev) {
          const prevEls = getSortedElements(chain.prev, doc);
          if (prevEls.length > 0) {
            switchGroup(chain.prev, getTabindex(prevEls[prevEls.length - 1]));
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

      prevGroup.current = currentGroup.current;
      removeFocusedStyle(doc);
      nextEl.focus();
      nextEl.classList.add('focused');
      lastFocusedByGroup.current[group] = getTabindex(nextEl);
      playTtsFromElement(nextEl);
      onMoved?.({ group, tabindex: getTabindex(nextEl), element: nextEl });
    },
    [getSortedElements, removeFocusedStyle, playTtsFromElement, switchGroup]
  );

  const getCurrentFocusInfo = useCallback((): FocusInfo | null => {
    // 1순위: currentGroup ref
    if (currentGroup.current) {
      const { group, doc } = currentGroup.current;
      const tabindex = lastFocusedByGroup.current[group];
      if (tabindex !== undefined) {
        const el = doc.querySelector<HTMLElement>(sel(group, tabindex));
        if (el) return { group, tabindex, element: el };
      }
    }
    // 2순위: activeElement
    const active = document.activeElement as HTMLElement | null;
    if (
      active?.getAttribute('data-tabfocus') === 'Y' &&
      active.hasAttribute('data-tabgroup') &&
      active.hasAttribute('tabindex')
    ) {
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
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          initTabFocusWhenReady(doc, group, tabindex)
        )
      );
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
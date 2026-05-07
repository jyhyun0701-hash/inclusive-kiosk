import { useRef, useEffect, useCallback } from 'react';

/**
 * useMagnify
 * ─────────────────────────────────────────────────────────────
 * [구조]
 *
 *  <main className="kiosk-content ...">          ← 이 요소에는 ref 없음
 *    {isMagnified && <NavPad onNavigate={navigate} />}  ← kiosk-content 직접 자식 (absolute)
 *    <div ref={wrapRef} className="content-scroll-wrap"> ← scroll 컨테이너
 *      <div ref={innerRef}>                              ← zoom 대상
 *        ...기존 JSX 그대로...
 *      </div>
 *    </div>
 *  </main>
 *
 * [왜 두 단계인가?]
 *  - NavPad(position:absolute)는 kiosk-content 기준으로 고정
 *  - scroll은 content-scroll-wrap 에서만 발생
 *  - NavPad는 scroll되지 않고 항상 같은 위치에 고정됨
 * ─────────────────────────────────────────────────────────────
 */

const MAG_LEVEL  = 2.0;    // 확대 배율
const SCROLL_STEP = 300;   // common.js moveScrollDistance 동일

export type MagnifyDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export function useMagnify(isMagnified: boolean) {
  // wrapRef: content-scroll-wrap div (scroll 컨테이너)
  const wrapRef  = useRef<HTMLDivElement>(null);
  // innerRef: zoom 적용 대상 div
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap  = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    // wheel/touch 스크롤 방지 핸들러
    const preventDefault = (e: Event) => e.preventDefault();

    if (isMagnified) {
      // ── setUiMagnification 동일 로직 ──
      inner.style.zoom      = `${MAG_LEVEL * 100}%`;
      wrap.scrollLeft       = 0;
      wrap.scrollTop        = 0;
      // 좌측 달라붙는 보정 패딩 (기존 paddingFix = (magLevel - 1) * 40)
      wrap.style.paddingLeft = `${(MAG_LEVEL - 1) * 40}px`;
      wrap.style.overflow   = 'scroll';

      // 사용자가 직접 스크롤하는 것을 막음 (nav 버튼으로만 이동)
      wrap.addEventListener('wheel',     preventDefault, { passive: false });
      wrap.addEventListener('touchmove', preventDefault, { passive: false });
    } else {
      // ── 확대 해제 ──
      inner.style.zoom       = '';
      wrap.scrollLeft        = 0;
      wrap.scrollTop         = 0;
      wrap.style.paddingLeft = '';
      wrap.style.overflow    = '';

      wrap.removeEventListener('wheel',     preventDefault);
      wrap.removeEventListener('touchmove', preventDefault);
    }

    return () => {
      // cleanup: 언마운트 시에도 이벤트 제거
      wrap.removeEventListener('wheel',     preventDefault);
      wrap.removeEventListener('touchmove', preventDefault);
    };
  }, [isMagnified]);

  // uiNavigate 동일 로직
  const navigate = useCallback((direction: MagnifyDirection) => {
    const wrap  = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const zoomLevel = parseFloat((inner.style.zoom || '100%').replace('%', '')) / 100;
    const step = SCROLL_STEP * zoomLevel;

    switch (direction) {
      case 'UP':    wrap.scrollTop  = Math.max(0, wrap.scrollTop  - step); break;
      case 'DOWN':  wrap.scrollTop  += step;                                break;
      case 'LEFT':  wrap.scrollLeft = Math.max(0, wrap.scrollLeft - step); break;
      case 'RIGHT': wrap.scrollLeft += step;                                break;
    }
  }, []);

  return { wrapRef, innerRef, navigate };
}
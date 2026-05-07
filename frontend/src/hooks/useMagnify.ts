import { useRef, useEffect, useCallback } from 'react';

/**
 * useMagnify — common.js setUiMagnification / uiNavigate React 포팅
 *
 * 핵심 수정:
 *   zoom: 200% 적용 시 자식 레이아웃 폭이 절반(1000px→500px)으로 줄어드는
 *   CSS zoom 동작을 보상하기 위해 inner.style.width = '200%' 추가.
 *   → 자식이 1000px 폭을 그대로 사용하므로 레이아웃이 유지됨.
 */

const MAG_LEVEL   = 2.0;   // 확대 배율
const SCROLL_STEP = 300;   // common.js moveScrollDistance 동일

export type MagnifyDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export function useMagnify(isMagnified: boolean) {
  const wrapRef  = useRef<HTMLDivElement>(null);   // content-scroll-wrap
  const innerRef = useRef<HTMLDivElement>(null);   // zoom 대상

  useEffect(() => {
    const wrap  = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const preventDefault = (e: Event) => e.preventDefault();

    if (isMagnified) {
      inner.style.zoom = `${MAG_LEVEL * 100}%`;
      // zoom: 200%는 자식 레이아웃 폭을 절반으로 줄임 → 200%로 보상
      inner.style.width = `${MAG_LEVEL * 100}%`;
      wrap.scrollLeft        = 0;
      wrap.scrollTop         = 0;
      // 좌측 달라붙는 보정 (기존 paddingFix = (magLevel - 1) * 40)
      wrap.style.paddingLeft = `${(MAG_LEVEL - 1) * 40}px`;
      wrap.style.overflow    = 'scroll';

      // 사용자 직접 스크롤 방지 (nav 버튼으로만 이동)
      wrap.addEventListener('wheel',     preventDefault, { passive: false });
      wrap.addEventListener('touchmove', preventDefault, { passive: false });
    } else {
      inner.style.zoom       = '';
      inner.style.width      = '';  // 초기화
      wrap.scrollLeft        = 0;
      wrap.scrollTop         = 0;
      wrap.style.paddingLeft = '';
      wrap.style.overflow    = '';

      wrap.removeEventListener('wheel',     preventDefault);
      wrap.removeEventListener('touchmove', preventDefault);
    }

    return () => {
      wrap.removeEventListener('wheel',     preventDefault);
      wrap.removeEventListener('touchmove', preventDefault);
    };
  }, [isMagnified]);

  // uiNavigate 동일 로직 — zoom 배율 반영한 이동 거리
  const navigate = useCallback((direction: MagnifyDirection) => {
    const wrap  = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const zoomLevel = parseFloat((inner.style.zoom || '100%').replace('%', '')) / 100;
    const step      = SCROLL_STEP * zoomLevel;

    switch (direction) {
      case 'UP':    wrap.scrollTop  = Math.max(0, wrap.scrollTop  - step); break;
      case 'DOWN':  wrap.scrollTop  += step;                                break;
      case 'LEFT':  wrap.scrollLeft = Math.max(0, wrap.scrollLeft - step); break;
      case 'RIGHT': wrap.scrollLeft += step;                                break;
    }
  }, []);

  return { wrapRef, innerRef, navigate };
}
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import GuideModal from './GuideModal';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useFocusManagerContext } from '../../context/FocusManagerContext';
import { useKeypadContext } from '../../App';
import { speakPriority, speakSafe, stopSpeak, setGlobalTts } from '../../utils/speakSafe';

/**
 * 키오스크 하단 바
 */

interface BottomBarProps {
  showHomeButton?: boolean;
  onKeypadToggle?: () => void;
  isKeypadOpen?:   boolean;
}

const PAGE_FOCUS: Record<string, { group: string; tabindex: number }> = {
  '/':            { group: 'main',          tabindex: 0 },
  '/certificate': { group: 'certificate',   tabindex: 0 },
  '/verify':      { group: 'verify-keypad', tabindex: 0 },
  '/issue':       { group: 'issue',         tabindex: 0 },
};

const BottomBar = ({ showHomeButton = false }: BottomBarProps) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { ttsEnabled, zoomEnabled, highContrast, toggleTTS, toggleZoom, toggleHighContrast } = useAccessibility();
  const fm        = useFocusManagerContext();
  const { toggleKeypad } = useKeypadContext();

  const [isGuideOpen,         setIsGuideOpen]         = useState(false);
  const [guideOriginGroup,    setGuideOriginGroup]    = useState<string | undefined>();
  const [guideOriginTabindex, setGuideOriginTabindex] = useState(0);

  const handleTTSToggle = () => {
    const next = !ttsEnabled;
    toggleTTS();
    toggleKeypad();

    if (next) {
      // 1. 전역 TTS 활성화 (이후 speakSafe 모두 동작)
      setGlobalTts(true);

      // 2. 고대비 모드 함께 활성화
      if (!highContrast) {
        toggleHighContrast();
      }

      // 3. 음성 안내 (클릭 핸들러 안 — 제스처 컨텍스트 유지)
      speakPriority('음성 안내가 켜졌습니다.');

      // 4. 포커스 활성화 (rAF 안이라 제스처 컨텍스트 밖이지만 speakPriority 이후라 OK)
      const cfg = PAGE_FOCUS[location.pathname] ?? { group: 'main', tabindex: 0 };
      setTimeout(() => fm.activateFocusMode(cfg.group, cfg.tabindex, document), 300);

    } else {
      // 전역 TTS 비활성화 → 이후 speakSafe 모두 차단
      setGlobalTts(false);
      fm.deactivateFocusMode(document);
      stopSpeak();

      // 고대비도 함께 해제
      if (highContrast) {
        toggleHighContrast();
      }
    }
  };

  const handleZoomToggle = () => {
    toggleZoom();
    document.body.classList.toggle('zoom-mode', !zoomEnabled);
    speakSafe(zoomEnabled ? '화면 확대가 해제되었습니다.' : '화면이 확대되었습니다.');
  };

  const handleHome = () => navigate('/');

  const handleGuideOpen = () => {
    const info = fm.getCurrentFocusInfo();
    setGuideOriginGroup(info?.group);
    setGuideOriginTabindex(info?.tabindex ?? 0);
    setIsGuideOpen(true);
  };

  return (
      <>
        <Wrapper role="toolbar" aria-label="접근성 도구 모음">

          {/* 처음으로 — 왼쪽 끝 */}
          {showHomeButton && (
            <HomeButton
              onClick={handleHome}
              data-tabfocus="Y"
              data-tabgroup="bottombar"
              tabIndex={3}
              data-ttsmsg="처음으로."
              aria-label="처음 화면으로"
            >
              <BtnIcon aria-hidden="true">⌂</BtnIcon>
              <BtnLabel>처음으로</BtnLabel>
            </HomeButton>
          )}

          {/* 오른쪽 버튼 그룹 */}
          <RightGroup>
            <BarButton
              onClick={handleGuideOpen}
              data-tabfocus="Y"
              data-tabgroup="bottombar"
              tabIndex={0}
              data-ttsmsg="이용 안내."
              aria-label="이용 안내"
            >
              <IconCircle aria-hidden="true">?</IconCircle>
              <BtnLabel>이용 안내</BtnLabel>
            </BarButton>

            <BarButton
              onClick={handleTTSToggle}
              data-tabfocus="Y"
              data-tabgroup="bottombar"
              tabIndex={1}
              data-ttsmsg={ttsEnabled ? '음성 끄기.' : '음성 켜기.'}
              aria-label={ttsEnabled ? '음성 끄기' : '음성 켜기'}
              aria-pressed={ttsEnabled}
              $isActive={ttsEnabled}
            >
              <BtnIcon aria-hidden="true">{ttsEnabled ? '🔊' : '🔇'}</BtnIcon>
              <BtnLabel>{ttsEnabled ? '음성 끄기' : '음성 켜기'}</BtnLabel>
            </BarButton>

            <ZoomButton
              onClick={handleZoomToggle}
              data-tabfocus="Y"
              data-tabgroup="bottombar"
              tabIndex={2}
              data-ttsmsg={zoomEnabled ? '화면 축소.' : '화면 확대.'}
              aria-label={zoomEnabled ? '화면 축소' : '화면 확대'}
              aria-pressed={zoomEnabled}
              $isActive={zoomEnabled}
            >
              <BtnIcon aria-hidden="true">🔍</BtnIcon>
              <BtnLabel>{zoomEnabled ? '화면 축소' : '화면 확대'}</BtnLabel>
            </ZoomButton>
          </RightGroup>
        </Wrapper>

        <GuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          originGroup={guideOriginGroup}
          originTabindex={guideOriginTabindex}
        />
      </>
    );
  };

  export default BottomBar;

  // ═══════════════════════════════════════════════
  // Styled Components
  // ═══════════════════════════════════════════════

  /** 하단 바 전체 컨테이너 */
  const Wrapper = styled.div`
    width: 100%;
    height: var(--touch-bar);               /* 200px (global.css) */
    background-color: var(--bottom-bar-bg);
    border-top: 1px solid var(--bottom-bar-border);

    display: flex;
    align-items: center;
    justify-content: space-between;         /* 홈버튼(좌) ↔ 버튼그룹(우) */
    padding: 0 var(--spacing-xl);           /* 0 64px */
    flex-shrink: 0;
  `;

  /** 우측 버튼 묶음 */
  const RightGroup = styled.div`
    display: flex;
    align-items: center;
    gap: var(--spacing-md);                 /* 24px */
    margin-left: auto;
  `;

  /** 공통 버튼 베이스 */
  const BarButton = styled.button<{ $isActive?: boolean }>`
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);                 /* 16px */

    /* 터치 영역: 바 높이(200px)에서 위아래 여백 뺀 값 */
    height: calc(var(--touch-bar) - var(--spacing-lg) * 2);  /* 200 - 80 = 120px */
    padding: 0 var(--spacing-lg);           /* 0 40px */

    border-radius: var(--radius-md);        /* 16px */
    border: 2px solid ${({ $isActive }) =>
      $isActive ? 'var(--accent-blue)' : 'var(--border-default)'};
    background-color: ${({ $isActive }) =>
      $isActive ? 'rgba(74,144,217,0.15)' : 'transparent'};

    color: var(--text-secondary);
    font-size: var(--font-size-base);
    font-weight: 1000;
    white-space: nowrap;
    transition: all var(--transition);

    &:hover {
      background-color: var(--bg-button-hover);
      border-color: var(--accent-blue);
    }
    &:focus-visible {
      outline: 3px solid var(--border-focus);
      outline-offset: 2px;
    }
  `;

  /** 화면 확대 버튼 — 노란색 강조 */
  const ZoomButton = styled(BarButton)<{ $isActive?: boolean }>`
    background-color: var(--accent-yellow);
    border-color: var(--accent-yellow);
    color: #1B2B5E;
    font-weight: 700;

    &:hover {
      background-color: #E0D030;
      border-color: #E0D030;
      color: #1B2B5E;
    }
  `;

  /** 처음으로 버튼 — 왼쪽 배치, 구분선 스타일 */
  const HomeButton = styled(BarButton)`
    border: none;
    border-right: 1px solid var(--bottom-bar-border);
    border-radius: var(--radius-md);
    gap: var(--spacing-sm);
    padding-right: var(--spacing-xl);
    color: var(--text-primary);
    background-color: var(--bg-pink);

    &:hover {
      color: var(--text-primary);
      background-color: transparent;
      border-color: var(--bottom-bar-border);
    }
  `;

  /** 아이콘 (이모지 / 특수문자) */
  const BtnIcon = styled.span`
    font-size: var(--font-size-base);       /* 36px */
    line-height: 1;
    flex-shrink: 0;
  `;

  /** 버튼 텍스트 */
  const BtnLabel = styled.span`
    font-size: var(--font-size-xs);         /* 24px */
    font-weight: inherit;
  `;

  /** 이용 안내 물음표 원형 */
  const IconCircle = styled.span`
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-sm);         /* 28px */
    font-weight: 700;
    flex-shrink: 0;
  `;

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import GuideModal from './GuideModal';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useFocusManagerContext } from '../../context/FocusManagerContext';
import { useKeypadContext } from '../../App';
import { speakPriority, speakSafe, stopSpeak, setGlobalTts } from '../../utils/speakSafe';
import imgInfo     from '../../assets/images/info.png';
import imgSoundOn  from '../../assets/images/sound-on.png';
import imgSoundOff from '../../assets/images/sound-off.png';
import imgZoomIn   from '../../assets/images/zoom-in.png';
import imgZoomOut  from '../../assets/images/zoom-out.png';

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

        {/* ── 처음으로 (왼쪽) ── */}
        {showHomeButton && (
          <HomeButton
            onClick={handleHome}
            data-tabfocus="Y"
            data-tabgroup="bottombar"
            tabIndex={3}
            data-ttsmsg="처음으로."
            aria-label="처음 화면으로"
          >
            <BtnLabel>처음으로</BtnLabel>
          </HomeButton>
        )}

        {/* ── 우측 버튼 그룹 ── */}
        <RightGroup>

          {/* 이용 안내 */}
          <BarButton
            onClick={handleGuideOpen}
            data-tabfocus="Y"
            data-tabgroup="bottombar"
            tabIndex={0}
            data-ttsmsg="이용 안내."
            aria-label="이용 안내"
          >
            <BtnImg src={imgInfo} alt="" aria-hidden="true" />
            <BtnLabel>이용 안내</BtnLabel>
          </BarButton>

          {/* 음성 켜기 / 끄기 */}
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
            <BtnImg
              src={ttsEnabled ? imgSoundOn : imgSoundOff}
              alt=""
              aria-hidden="true"
            />
            <BtnLabel>{ttsEnabled ? '음성 끄기' : '음성 켜기'}</BtnLabel>
          </BarButton>

          {/* 화면 확대 / 축소 */}
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
            <BtnImg
              src={zoomEnabled ? imgZoomOut : imgZoomIn}
              alt=""
              aria-hidden="true"
            />
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

// 버튼 높이: 바 전체(200px) - 위아래 여백(40px × 2) = 120px
const BTN_HEIGHT = 'calc(var(--touch-bar) - var(--spacing-lg) * 2)';

/** 하단 바 전체 컨테이너 */
const Wrapper = styled.div`
  width: 100%;
  height: var(--touch-bar);                     /* 200px */
  background-color: var(--bottom-bar-bg);       /* #0f1a3e */
  border-top: 1px solid var(--bottom-bar-border);

  display: flex;
  align-items: center;
  /* 처음으로(좌) + RightGroup(우) 분리 */
  justify-content: space-between;
  padding: 0 var(--spacing-xl);                 /* 0 64px */
  flex-shrink: 0;
`;

/**
 * 우측 버튼 묶음
 * margin-left: auto → showHomeButton=false일 때도 자동으로 오른쪽 정렬
 */
const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);                       /* 버튼 간 24px */
  margin-left: auto;
`;

/** 공통 버튼 베이스 (이용 안내 / 음성) */
const BarButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);                       /* 아이콘 ↔ 텍스트 16px */

  height: ${BTN_HEIGHT};                        /* 120px */
  padding: 0 var(--spacing-lg);                 /* 0 40px */
  border-radius: var(--radius-md);              /* 16px */

  /* 기본: 회색 테두리 / 활성: 파란 테두리 */
  border: 2px solid ${({ $isActive }) =>
    $isActive ? 'var(--accent-blue)' : '#9E9E9E'};
  background-color: ${({ $isActive }) =>
    $isActive ? 'rgba(125, 205, 255, 0.15)' : 'transparent'};

  color: var(--text-secondary);                 /* #FFFFFF */
  font-size: var(--font-size-xs);               /* 24px */
  font-weight: 500;
  white-space: nowrap;
  transition: all var(--transition);

  &:hover {
    border-color: var(--accent-blue);
    background-color: rgba(125, 205, 255, 0.1);
  }
  &:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }
`;

/**
 * 화면 확대 버튼
 * 기본: 노란 배경(#FFF046) / 확대 중: 파란 테두리(비활성 스타일과 반전)
 */
const ZoomButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  height: ${BTN_HEIGHT};
  padding: 0 var(--spacing-lg);
  border-radius: var(--radius-md);

  background-color: ${({ $isActive }) =>
    $isActive ? 'rgba(125, 205, 255, 0.15)' : 'var(--accent-yellow)'};
  border: 2px solid ${({ $isActive }) =>
    $isActive ? 'var(--accent-blue)' : 'var(--accent-yellow)'};
  color: ${({ $isActive }) =>
    $isActive ? 'var(--text-secondary)' : '#1B2B5E'};

  font-size: var(--font-size-xs);               /* 24px */
  font-weight: 700;
  white-space: nowrap;
  transition: all var(--transition);

  &:hover { filter: brightness(0.92); }
  &:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }
`;

/**
 * 처음으로 버튼
 * - Wrapper의 space-between으로 RightGroup과 자동 분리
 * - border 방식(구분선) 제거 → 독립된 버튼으로 디자인
 */
const HomeButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  height: ${BTN_HEIGHT};                        /* 120px */
  padding: 0 var(--spacing-xl);                 /* 0 64px — 넉넉한 터치 영역 */

  border: 2px solid #9E9E9E;                    /* 회색 테두리 */
  border-radius: var(--radius-md);
  background-color: transparent;

  color: var(--text-secondary);                 /* #FFFFFF */
  font-size: var(--font-size-xs);               /* 24px */
  font-weight: 500;
  white-space: nowrap;
  transition: all var(--transition);

  &:hover {
    border-color: var(--accent-blue);
    background-color: rgba(125, 205, 255, 0.1);
  }
  &:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }
`;

/** 버튼 텍스트 */
const BtnLabel = styled.span`
  font-size: var(--font-size-xs);               /* 24px */
  font-weight: inherit;
`;

/** PNG 아이콘 이미지 */
const BtnImg = styled.img`
  width: 48px;
  height: 48px;
  object-fit: contain;
  flex-shrink: 0;
`;
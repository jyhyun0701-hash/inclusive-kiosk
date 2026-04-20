import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import GuideModal from './GuideModal';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useFocusManagerContext } from '../../context/FocusManagerContext';
import { useKeypadContext } from '../../App';
import { speakPriority, speakSafe, stopSpeak, setGlobalTts } from '../../utils/speakSafe';

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
        <BarButton
          onClick={handleGuideOpen}
          data-tabfocus="Y" data-tabgroup="bottombar" tabIndex={0}
          data-ttsmsg="이용 안내."
          aria-label="이용 안내"
        >
          <IconCircle aria-hidden="true">?</IconCircle>
          <span>이용 안내</span>
        </BarButton>

        <BarButton
          onClick={handleTTSToggle}
          data-tabfocus="Y" data-tabgroup="bottombar" tabIndex={1}
          data-ttsmsg={ttsEnabled ? '음성 끄기.' : '음성 켜기.'}
          aria-label={ttsEnabled ? '음성 끄기' : '음성 켜기'}
          aria-pressed={ttsEnabled}
          $isActive={ttsEnabled}
        >
          <span aria-hidden="true">{ttsEnabled ? '🔊' : '🔇'}</span>
          <span>{ttsEnabled ? '음성 끄기' : '음성 켜기'}</span>
        </BarButton>

        <ZoomButton
          onClick={handleZoomToggle}
          data-tabfocus="Y" data-tabgroup="bottombar" tabIndex={2}
          data-ttsmsg={zoomEnabled ? '화면 축소.' : '화면 확대.'}
          aria-label={zoomEnabled ? '화면 축소' : '화면 확대'}
          aria-pressed={zoomEnabled}
        >
          <span aria-hidden="true">🔍</span>
          <span>{zoomEnabled ? '화면 축소' : '화면 확대'}</span>
        </ZoomButton>

        {showHomeButton && (
          <HomeButton
            onClick={handleHome}
            data-tabfocus="Y" data-tabgroup="bottombar" tabIndex={3}
            data-ttsmsg="처음으로."
            aria-label="처음 화면으로"
          >
            <span aria-hidden="true">⌂</span>
            <span>처음으로</span>
          </HomeButton>
        )}
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

const Wrapper = styled.div`
  width:100%;height:56px;
  background-color:var(--bottom-bar-bg);
  border-top:1px solid var(--bottom-bar-border);
  display:flex;align-items:center;justify-content:flex-end;
  gap:8px;padding:0 16px;flex-shrink:0;
`;

const BarButton = styled.button<{ $isActive?: boolean }>`
  display:flex;align-items:center;gap:6px;
  padding:8px 14px;border-radius:var(--radius-md);
  border:1.5px solid ${({ $isActive }) => $isActive ? 'var(--accent-blue)' : 'var(--border-default)'};
  background-color:${({ $isActive }) => $isActive ? 'rgba(74,144,217,0.15)' : 'transparent'};
  color:var(--text-primary);font-size:var(--font-size-xs);font-weight:500;
  transition:all var(--transition);white-space:nowrap;
  &:hover{background-color:var(--bg-button-hover);border-color:var(--accent-blue);}
  &:focus-visible{outline:3px solid var(--border-focus);outline-offset:2px;}
`;

const ZoomButton = styled(BarButton)`
  background-color:var(--accent-yellow);border-color:var(--accent-yellow);
  color:#1B2B5E;font-weight:700;
  &:hover{background-color:#E09520;border-color:#E09520;color:#1B2B5E;}
`;

const HomeButton = styled.button`
  display:flex;align-items:center;gap:6px;
  padding:8px 14px 8px 18px;
  border:none;border-left:1px solid var(--border-default);
  background-color:transparent;color:var(--text-secondary);
  font-size:var(--font-size-xs);font-weight:500;
  transition:color var(--transition);white-space:nowrap;
  &:hover{color:var(--text-primary);}
  &:focus-visible{outline:3px solid var(--border-focus);outline-offset:2px;}
`;

const IconCircle = styled.span`
  width:18px;height:18px;border-radius:50%;
  border:1.5px solid var(--text-secondary);
  display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:700;flex-shrink:0;
`;

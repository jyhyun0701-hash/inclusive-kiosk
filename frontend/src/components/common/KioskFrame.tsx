import type { ReactNode } from 'react';
import styled from 'styled-components';
import { useEffect, useState } from 'react';

/**
 * PROJECT: inclusive kiosk
 * PROGRAM ID:
 * PROGRAM NAME: KioskFrame
 * DESCRIPTION:
 * AUTHOR : hjy
 * CREATED DATE : 2026.04.20.
 * =================================
 */

const KIOSK_WIDTH = 1080;
const KIOSK_HEIGHT = 1920;
const BEZEL_TOP = 40;
const BEZEL_BOTTOM = 28;

// 환경변수로 개발 중 스케일 오버라이드 가능
const DEV_SCALE_OVERRIDE = import.meta.env.VITE_KIOSK_SCALE
  ? Number(import.meta.env.VITE_KIOSK_SCALE)
  : null;

const KioskFrame = ({ children }: { children: ReactNode }) => {
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const TOTAL_HEIGHT = KIOSK_HEIGHT + BEZEL_TOP + BEZEL_BOTTOM;

    const updateScale = () => {
          if (DEV_SCALE_OVERRIDE) {
            setScale(DEV_SCALE_OVERRIDE);
            return;
          }
          const scaleX = (window.innerWidth * 0.95) / KIOSK_WIDTH;
          const scaleY = (window.innerHeight * 0.95) / TOTAL_HEIGHT;
          setScale(Math.min(scaleX, scaleY));  // max 제한 제거 → 화면 꽉 채움
        };

    updateScale();
    window.addEventListener('resize', updateScale);

    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
     <Viewport>
       <ScaledRoot style={{ transform: `scale(${scale})` }}>
         <OuterFrame>
           <TopBezel>
             <Dots><Dot /><Dot /><Dot /></Dots>
             <BezelTitle>무인민원발급기</BezelTitle>
             <Dots><Dot /><Dot /><Dot /></Dots>
           </TopBezel>

           <ScreenContainer>
             <RealScreen>{children}</RealScreen>
           </ScreenContainer>

           <BottomBezel>
             <Speaker />
           </BottomBezel>
         </OuterFrame>
       </ScaledRoot>

       {/* 개발 모드에서만 scale 표시 */}
       {import.meta.env.DEV && (
         <ScaleIndicator>scale: {scale.toFixed(2)}</ScaleIndicator>
       )}
     </Viewport>
   );
};

export default KioskFrame;

const ScaleIndicator = styled.div`
  position: fixed;
  bottom: 8px;
  right: 8px;
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  font-family: monospace;
`;

const ScaledRoot = styled.div`
  transform-origin: center center;
`;

const Viewport = styled.div`
  position: fixed;
  inset: 0;
  background-color: #080c18;
  display: flex;
  align-items: center;
  justify-content: center;

  background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 40px 40px;
`;

const OuterFrame = styled.div`
  width: 1080px;
  height: ${1920 + BEZEL_TOP + BEZEL_BOTTOM}px;
  
  background-color: #141824;
  border-radius: 20px;
  border: 3px solid #252d48;

  display: flex;
  flex-direction: column;
  overflow: hidden;

  box-shadow:
      0 0 0 1px rgba(255,255,255,0.05),
      0 24px 80px rgba(0,0,0,0.8);
`;

const TopBezel = styled.div`
  flex-shrink: 0;
  height: 40px;
  background-color: #0e1220;
  border-bottom: 1px solid #252d48;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`;

const Dots = styled.div`
  display: flex;
  gap: 5px;
`;

const Dot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #252d48;
`;

const BezelTitle = styled.span`
  font-size: 10px;
  color: #303860;
  letter-spacing: 4px;
  font-weight: 600;
`;

const ScreenContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const RealScreen = styled.div`
  width: 1080px;
  height: 1920px;

  display: flex;
  flex-direction: column;
  background: white;
`;

const BottomBezel = styled.div`
  flex-shrink: 0;
  height: 28px;
  background-color: #0e1220;
  border-top: 1px solid #252d48;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Speaker = styled.div`
  width: 56px;
  height: 3px;
  border-radius: 2px;
  background-color: #252d48;
`;
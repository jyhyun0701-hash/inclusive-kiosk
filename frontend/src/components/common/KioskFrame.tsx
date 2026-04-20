import type { ReactNode } from 'react';
import styled from 'styled-components';

const KioskFrame = ({ children }: { children: ReactNode }) => {
  return (
    <Viewport>
      <OuterFrame>
        <TopBezel aria-hidden="true">
          <Dots><Dot /><Dot /><Dot /></Dots>
          <BezelTitle>무인민원발급기</BezelTitle>
          <Dots><Dot /><Dot /><Dot /></Dots>
        </TopBezel>

        {/* Screen: overflow visible — 자식(Layout)이 자체적으로 스크롤 처리 */}
        <Screen>{children}</Screen>

        <BottomBezel aria-hidden="true"><Speaker /></BottomBezel>
      </OuterFrame>
    </Viewport>
  );
};

export default KioskFrame;

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
  /* 9:16 비율, viewport 기준 */
  height: min(94vh, calc(55vw * 16 / 9));
  width:  min(55vw, calc(94vh * 9 / 16));
  min-width:  300px;
  min-height: 530px;
  max-width:  500px;
  max-height: 890px;

  background-color: #141824;
  border-radius: 20px;
  border: 3px solid #252d48;

  /* flex column — Breadcrumb/Main/BottomBar 세로 배치 */
  display: flex;
  flex-direction: column;

  /* overflow hidden: 베젤 밖으로 나가는 것만 차단 */
  overflow: hidden;

  box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 24px 80px rgba(0,0,0,0.8);
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

const Dots = styled.div`display: flex; gap: 5px;`;
const Dot  = styled.div`width:6px;height:6px;border-radius:50%;background-color:#252d48;`;
const BezelTitle = styled.span`font-size:10px;color:#303860;letter-spacing:4px;font-weight:600;`;

const Screen = styled.div`
  /*
   * flex: 1 + min-height: 0
   * → 남은 공간 전부 차지, 자식이 넘쳐도 스크롤 허용
   * overflow는 자식(Layout > Main)이 담당
   */
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  /* Layout 컴포넌트가 100% 채우도록 */
  & > * {
    flex: 1;
    min-height: 0;
  }
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

const Speaker = styled.div`width:56px;height:3px;border-radius:2px;background-color:#252d48;`;

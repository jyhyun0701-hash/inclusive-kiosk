import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Breadcrumb from './Breadcrumb';
import BottomBar from './BottomBar';
import { useKeypadContext } from '../../App';

interface LayoutProps {
  currentStep: 1 | 2 | 3 | 4;
  children: ReactNode;
  modal?: ReactNode;
}

const Layout = ({ currentStep, children, modal }: LayoutProps) => {
  const location = useLocation();
  const { isKeypadOpen, toggleKeypad } = useKeypadContext();
  const showHomeButton = location.pathname !== '/';

  return (
    <Screen>
      {/* Breadcrumb — 고정 높이 */}
      <Breadcrumb currentStep={currentStep} />

      {/*
       * Main — flex:1 + min-height:0 필수
       * overflow-y:auto → 콘텐츠가 넘치면 스크롤
       * overflow-x:hidden → 가로 스크롤 방지
       */}
      <Main role="main">{children}</Main>

      {/* BottomBar — 고정 높이 */}
      <BottomBar
        showHomeButton={showHomeButton}
        onKeypadToggle={toggleKeypad}
        isKeypadOpen={isKeypadOpen}
      />

      {/* 팝업 슬롯 — position:absolute로 Screen 위에 렌더 */}
      {modal}
    </Screen>
  );
};

export default Layout;

const Screen = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  position: relative; /* 팝업(absolute) 기준점 */
  /* overflow:hidden 제거 — 자식 Main이 스크롤 처리 */
`;

const Main = styled.main`
  flex: 1;
  min-height: 0;       /* flex 자식의 overflow 허용을 위해 필수 */
  overflow-y: auto;    /* 콘텐츠 많을 때 스크롤 */
  overflow-x: hidden;
  padding: 16px 20px;

  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

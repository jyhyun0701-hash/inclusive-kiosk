import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Breadcrumb from './Breadcrumb';
import BottomBar from './BottomBar';
import { useKeypadContext } from '../../App';

interface LayoutProps {
  currentStep: 1 | 2 | 3 | 4;
  title: string;
  children: ReactNode;
  modal?: ReactNode;
}

const Layout = ({ currentStep, title, children, modal }: LayoutProps) => {
  const location = useLocation();
  const { isKeypadOpen, toggleKeypad } = useKeypadContext();
  const showHomeButton = location.pathname !== '/';

  return (
    <Screen>
      {/* Breadcrumb — 고정 높이 */}
      <Breadcrumb currentStep={currentStep} title={title}/>

      <Main role="main">{children}</Main>

      <BottomBar
        showHomeButton={showHomeButton}
        onKeypadToggle={toggleKeypad}
        isKeypadOpen={isKeypadOpen}
      />

      {/* 팝업 슬롯 스크린 기준 absolute */}
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
  position: relative;
`;

const Main = styled.main`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-lg) var(--spacing-xl);

  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;
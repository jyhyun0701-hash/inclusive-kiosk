import type { ReactNode } from 'react';
import styled from 'styled-components';
import Breadcrumb from './Breadcrumb';

interface LayoutProps {
  currentStep: 1 | 2 | 3 | 4;
  title: string;
  children: ReactNode;
  modal?: ReactNode;
}

const Layout = ({ currentStep, title, children, modal }: LayoutProps) => {
  return (
    <Screen>
      <Breadcrumb currentStep={currentStep} title={title}/>
      <Main role="main">{children}</Main>
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
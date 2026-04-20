import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useFocusManager } from '../hooks/useFocusManager';
import type { FocusManager } from '../hooks/useFocusManager';

const FocusManagerContext = createContext<FocusManager | null>(null);

export const FocusManagerProvider = ({ children }: { children: ReactNode }) => {
  const fm = useFocusManager();
  return (
    <FocusManagerContext.Provider value={fm}>
      {children}
    </FocusManagerContext.Provider>
  );
};

export const useFocusManagerContext = (): FocusManager => {
  const ctx = useContext(FocusManagerContext);
  if (!ctx) throw new Error('FocusManagerProvider 안에서 사용하세요');
  return ctx;
};

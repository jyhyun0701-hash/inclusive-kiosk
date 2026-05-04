import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import KeypadPage from './pages/KeypadPage';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { FocusManagerProvider } from './context/FocusManagerContext';

const isKeypad = window.location.pathname === '/keypad';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isKeypad
      ? <KeypadPage />
      : <AccessibilityProvider><FocusManagerProvider><App /></FocusManagerProvider></AccessibilityProvider>
    }
  </StrictMode>
);
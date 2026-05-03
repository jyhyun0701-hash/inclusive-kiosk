import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import KeypadPage from './pages/KeypadPage';
import './index.css';

const isKeypad = window.location.pathname === '/keypad';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isKeypad ? <KeypadPage /> : <App />}
  </StrictMode>
);
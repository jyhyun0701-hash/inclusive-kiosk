import styled from 'styled-components';
import { useAccessibility } from '../../context/AccessibilityContext';
import type { Language } from '../../types/certificate';

const LANGS: { code: Language; label: string; flag: string; tabIndex: number }[] = [
  { code: 'ko', label: '한국어', flag: '🇰🇷', tabIndex: 20 },
  { code: 'en', label: 'English', flag: '🇺🇸', tabIndex: 21 },
  { code: 'ja', label: '日本語', flag: '🇯🇵', tabIndex: 22 },
  { code: 'zh', label: '中文',   flag: '🇨🇳', tabIndex: 23 },
];

const LanguageSelector = () => {
  const { language, setLanguage } = useAccessibility();

  const handleSelect = (lang: Language, label: string) => {
    setLanguage(lang);
    const utt = new SpeechSynthesisUtterance(`${label}로 변경되었습니다.`);
    utt.lang = 'ko-KR';
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(utt);
  };

  return (
    <Wrapper role="group" aria-label="언어 선택">
      {LANGS.map(({ code, label, flag, tabIndex }) => (
        <LangBtn
          key={code}
          onClick={() => handleSelect(code, label)}
          $isActive={language === code}
          data-tabfocus="Y"
          data-tabgroup="main"
          tabIndex={tabIndex}
          data-ttsmsg={`${label}. ${label}로 변경합니다.`}
          aria-label={`${label} 선택`}
          aria-pressed={language === code}
        >
          <Flag>{flag}</Flag>
          <span>{label}</span>
        </LangBtn>
      ))}
    </Wrapper>
  );
};

export default LanguageSelector;

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const LangBtn = styled.button<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 50%;
  width: 66px; height: 66px;
  border: 2.5px solid
    ${({ $isActive }) => ($isActive ? 'var(--accent-yellow)' : 'var(--border-default)')};
  background-color: ${({ $isActive }) =>
    $isActive ? 'rgba(245,166,35,0.15)' : 'var(--bg-button)'};
  color: var(--text-primary);
  font-size: 10px;
  font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};
  transition: all var(--transition);

  &:hover { border-color: var(--accent-yellow); }
  &:focus-visible { outline: 3px solid var(--border-focus); outline-offset: 2px; }
`;

const Flag = styled.span`font-size: 20px; line-height: 1;`;

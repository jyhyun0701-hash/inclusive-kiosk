import React, { useState } from 'react';
import StepIndicator from '../components/common/StepIndicator';
import BottomBar from '../components/common/BottomBar';
import InfoModal from '../components/common/InfoModal';
import { type Language, QUICK_CERTIFICATES } from '../types/kiosk';
import imgKr from "../assets/images/kr.png";
import imgEn from "../assets/images/en.png";
import imgJp from "../assets/images/jp.png";
import imgCn from "../assets/images/cn.png";

interface MainPageProps {
  language: Language;
  isTtsOn: boolean;
  isMagnified: boolean;
  onLanguageChange: (lang: Language) => void;
  onCertificateSelect: (certId: string) => void;
  onMoreCertificates: () => void;
  onToggleTts: () => void;
  onToggleMagnify: () => void;
}

const LANG_LIST: { code: Language; label: string; flag: string }[] = [
  { code: "ko", label: "한국어", img: imgKr },
  { code: "en", label: "English", img: imgEn },
  { code: "ja", label: "日本語", img: imgJp },
  { code: "zh", label: "中文",   img: imgCn },
];

const HEADER: Record<Language, string> = {
  ko: '이용하실 언어와 메뉴를 선택해주십시오.',
  en: 'Please select your language and menu.',
  ja: 'ご利用の言語とメニューをお選びください。',
  zh: '请选择使用语言和菜单。',
};
const QUICK_LABEL: Record<Language, string> = {
  ko: '자주 찾는 증명서', en: 'Frequently Used', ja: 'よく使う証明書', zh: '常用证明书',
};
const MORE_LABEL: Record<Language, string> = {
  ko: '증명서 더보기', en: 'More Documents', ja: '証明書一覧', zh: '查看更多',
};

const MainPage: React.FC<MainPageProps> = ({
  language, isTtsOn, isMagnified,
  onLanguageChange, onCertificateSelect, onMoreCertificates,
  onToggleTts, onToggleMagnify,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="kiosk-root">
      <header className="kiosk-header">
        <StepIndicator currentStep={1} language={language} />
        <div className="header-title">{HEADER[language]}</div>
      </header>

      {isMagnified && (
        <>
          <button className="nav-arrow left" aria-label="왼쪽">‹</button>
          <button className="nav-arrow right" aria-label="오른쪽">›</button>
        </>
      )}

      <main className="kiosk-content content-verify">
        <div className="section-title">
          <span className="star">★</span>
          <span>{QUICK_LABEL[language]}</span>
        </div>

        <div className="cert-list">
          {QUICK_CERTIFICATES.map((cert) => (
            <button
              key={cert.id}
              className="cert-btn"
              onClick={() => onCertificateSelect(cert.id)}
              aria-label={cert.nameKo}
            >
              {language === 'ko' ? cert.nameKo : (cert.nameEn ?? cert.nameKo)}
            </button>
          ))}
          <button
            className="cert-btn gray"
            onClick={onMoreCertificates}
            aria-label={MORE_LABEL[language]}
          >
            {MORE_LABEL[language]}
          </button>
        </div>
      </main>

      <div className="lang-selector">
                {LANG_LIST.map((l) => (
                  <button
                    key={l.code}
                    className={`lang-btn${language === l.code ? ' active' : ''}`}
                    onClick={() => onLanguageChange(l.code)}
                    aria-label={l.label}
                    aria-pressed={language === l.code}
                  >
                    <span className="flag">
                     <img src={l.img} alt={`${l.label} flag`} />
                    </span>
                    <span>{l.label}</span>
                  </button>
                ))}
      </div>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      <BottomBar
        language={language}
        isTtsOn={isTtsOn}
        isMagnified={isMagnified}
        onHome={() => {}}
        onInfo={() => setShowInfo(true)}
        onToggleTts={onToggleTts}
        onToggleMagnify={onToggleMagnify}
      />
    </div>
  );
};

export default MainPage;

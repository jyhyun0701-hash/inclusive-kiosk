import React, { useState } from 'react';
import { useMagnify } from '../hooks/useMagnify';
import NavPad from '../components/common/NavPad';
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
  const { wrapRef, innerRef, navigate } = useMagnify(isMagnified);

  return (
    <div className="kiosk-root">
      <header className="kiosk-header">
        <StepIndicator currentStep={1} language={language} />
        <div className="header-title">{HEADER[language]}</div>
      </header>

      <main className="kiosk-content content-verify">
        {isMagnified && <NavPad onNavigate={navigate} />}
        <div ref={wrapRef} className="content-scroll-wrap">
          <div ref={innerRef} className="content-wrap-main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          <div className="main-content-top" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="section-title">
            <span className="star">★</span>
            <span>{QUICK_LABEL[language]}</span>
          </div>

          <div className="cert-list">
            {QUICK_CERTIFICATES.map((cert, idx) => (
              <button
                key={cert.id}
                className="cert-btn"
                onClick={() => onCertificateSelect(cert.id)}
                aria-label={cert.nameKo}
                data-tabfocus="Y"
                data-tabgroup="main"
                data-ttsmsg={cert.nameKo}
                tabIndex={idx}
              >
                {language === 'ko' ? cert.nameKo : (cert.nameEn ?? cert.nameKo)}
              </button>
            ))}
            <button
              className="cert-btn gray"
              onClick={onMoreCertificates}
              aria-label={MORE_LABEL[language]}
              data-tabfocus= "Y"
              data-tabgroup="main"
              data-ttsmsg={MORE_LABEL[language]}
              tabIndex={QUICK_CERTIFICATES.length}
            >
              {MORE_LABEL[language]}
            </button>
          </div>
          </div>
          <div className="lang-selector" style={{ marginTop: 'auto', paddingBottom: '0' }}>
            {LANG_LIST.map((l, idx) => (
              <button
                key={l.code}
                className={`lang-btn${language === l.code ? ' active' : ''}`}
                onClick={() => onLanguageChange(l.code)}
                data-tabfocus="Y"
                data-tabgroup="lang"
                data-ttsmsg={l.label}
                tabIndex={idx}
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
          </div>
        </div>
      </main>

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

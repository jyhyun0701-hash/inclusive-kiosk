import React, { useState, useEffect } from 'react';
import { useMagnify } from '../hooks/useMagnify';
import NavPad from '../components/common/NavPad';
import StepIndicator from '../components/common/StepIndicator';
import BottomBar from '../components/common/BottomBar';
import InfoModal from '../components/common/InfoModal';
import NumPad from './../components/common/keyboards/NumPad';
import type { Language, Certificate } from '../types/kiosk';
import { useFocusManagerContext } from '../context/FocusManagerContext';
import imgFPSuccess from '../assets/images/fingerprint-success.png';
import imgFPFail from '../assets/images/fingerprint-fail.png';
import imgFPScan from '../assets/images/fingerprint-scan.png';

type VerifyStep = 'id-input' | 'fp-wait' | 'fp-fail' | 'fp-ok';

interface Props {
  language: Language;
  certificate: Certificate;
  isTtsOn: boolean;
  isMagnified: boolean;
  onHome: () => void;
  onToggleTts: () => void;
  onToggleMagnify: () => void;
  onVerified: () => void;
}

const HEADER: Record<VerifyStep, Record<Language, string>> = {
  'id-input': {
    ko: '주민번호 13자리를 입력해주십시오.',
    en: 'Please enter your 13-digit ID number.',
    ja: '住民番号13桁を入力してください。',
    zh: '请输入13位居民号码。',
  },
  'fp-wait': {
    ko: '지문 입력기에 엄지 손가락을 올려주십시오.',
    en: 'Please place your thumb on the fingerprint reader.',
    ja: '指紋入力機に親指を置いてください。',
    zh: '请将拇指放在指纹识别器上。',
  },
  'fp-fail': {
    ko: '손가락을 다시 지문 입력기에 올려주십시오.',
    en: 'Please place your thumb again.',
    ja: '再度、指紋入力機に指を置いてください。',
    zh: '请重新将手指放在指纹识别器上。',
  },
  'fp-ok': {
    ko: '문서 출력을 준비하고 있습니다. 잠시만 기다려주십시오.',
    en: 'Preparing to print. Please wait.',
    ja: '書類の印刷を準備しています。少々お待ちください。',
    zh: '正在准备打印文件，请稍候。',
  },
};

const formatId = (v: string) => {
  if (!v) return '';
  const f = v.slice(0, 6);
  const b = v.slice(6);
  if (!b) return f;
  return `${f}-${b[0]}${'*'.repeat(b.length - 1)}`;
};

const IdentityVerificationPage: React.FC<Props> = ({
  language, certificate, isTtsOn, isMagnified,
  onHome, onToggleTts, onToggleMagnify, onVerified,
}) => {
  const fm = useFocusManagerContext();
  const { wrapRef, innerRef, navigate } = useMagnify(isMagnified);
  const [step, setStep] = useState<VerifyStep>('id-input');
  const [id, setId] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (step === 'fp-fail') {
      fm.registerGroupChain('bottombar', { next: 'identity', prev: 'identity' });
      fm.registerGroupChain('identity',  { next: 'bottombar', prev: 'bottombar' });
      if (isTtsOn) setTimeout(() => fm.activateFocusMode('identity', 0), 300);
    } else if (step === 'id-input') {
      fm.registerGroupChain('bottombar', { next: 'numpad', prev: 'numpad' });
      fm.registerGroupChain('numpad',    { next: 'bottombar', prev: 'bottombar' });
    }
  }, [step, isTtsOn]);

  // 지문 시뮬레이션
  useEffect(() => {
    if (step === 'fp-wait') {
      const t = setTimeout(() => setStep(Math.random() > 0.4 ? 'fp-ok' : 'fp-fail'), 3000);
      return () => clearTimeout(t);
    }
    if (step === 'fp-ok') {
      const t = setTimeout(onVerified, 1500);
      return () => clearTimeout(t);
    }
  }, [step, onVerified]);

  return (
    <div className="kiosk-root">
      <header className="kiosk-header">
        <StepIndicator currentStep={3} language={language} />
        <div className="header-title">{HEADER[step][language]}</div>
      </header>

      <main className="kiosk-content content-verify">
        {isMagnified && <NavPad onNavigate={navigate} />}
        <div ref={wrapRef} className="content-scroll-wrap">
          <div ref={innerRef} className="content-wrap-verify">
          {step === 'id-input' && (
            <>
              {/* 입력값 표시 */}
              <div className={`id-display${!id ? ' empty' : ''}`}>
                {id ? (
                    formatId(id)
                  ) : (
                    <>
                      주민번호를 입력하십시오. 예) 901010-1234567
                    </>
                  )}
              </div>
              <NumPad
                value={id}
                onChange={setId}
                onConfirm={() => id.length === 13 && setStep('fp-wait')}
                maxLength={13}
              />
            </>
          )}

          {step === 'fp-wait' && (
            <div className="fingerprint-area">
              <div className="status-card info" style={{ width: '100%' }}>
                지문 입력기에 엄지 손가락을 올려주십시오.
              </div>
              <div className="fingerprint-icon">
                <img src={imgFPScan} alt="scan"/>
              </div>
            </div>
          )}

          {step === 'fp-fail' && (
            <>
              <div className="status-card error">
                지문 인식에 실패했습니다.
                손가락이 건조하거나, 손가락 위치가 맞지 않으면 인식에 실패합니다. 손가락을 다시 올려주세요.
              </div>
              <div className="fingerprint-area">
                <div className="fingerprint-icon">
                 <img src={imgFPFail} alt="fail"/>
                </div>
                <button
                  className="cert-btn gray"
                  style={{ maxWidth: 500 }}
                  onClick={() => setStep('fp-wait')}
                  data-tabfocus="Y"
                  data-tabgroup="identity"
                  data-ttsmsg="다시 시도"
                  tabIndex={0}
                >
                  다시 시도
                </button>
              </div>
            </>
          )}

          {step === 'fp-ok' && (
            <div className="fingerprint-area">
              <div className="status-card success" style={{ width: '100%' }}>
                지문 인식에 성공하였습니다.
              </div>
              <div className="fingerprint-icon">
                <img src={imgFPSuccess} alt="success"/>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
      <BottomBar
        language={language}
        isTtsOn={isTtsOn}
        isMagnified={isMagnified}
        onHome={onHome}
        onInfo={() => setShowInfo(true)}
        onToggleTts={onToggleTts}
        onToggleMagnify={onToggleMagnify}
      />
    </div>
  );
};

export default IdentityVerificationPage;
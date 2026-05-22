import React, { useState, useEffect } from 'react';
import { useMagnify } from '../hooks/useMagnify';
import NavPad from '../components/common/NavPad';
import StepIndicator from '../components/common/StepIndicator';
import BottomBar from '../components/common/BottomBar';
import InfoModal from '../components/common/InfoModal';
import NumPad from './../components/common/keyboards/NumPad';
import type { Language, Certificate } from '../types/kiosk';
import { useFocusManagerContext } from '../context/FocusManagerContext';
import { speakSafe, speakAndThen, setPageHelpText } from '../utils/speakSafe';
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
  onRegisterNumpadCancel: (fn: (() => void) | null) => void;
}

const ID_PLACEHOLDER: Record<Language, string> = {
  ko: '주민번호를 입력하십시오. 예) 901010-1234567',
  en: 'Enter ID number. e.g. 901010-1234567',
  ja: '住民番号を入力してください。例) 901010-1234567',
  zh: '请输入居民号码。例) 901010-1234567',
};

const FP_STATUS: Record<'wait' | 'fail' | 'ok', Record<Language, string>> = {
  wait: {
    ko: '지문 입력기에 엄지 손가락을 올려주십시오.',
    en: 'Please place your thumb on the fingerprint reader.',
    ja: '指紋入力機に親指を置いてください。',
    zh: '请将拇指放在指纹识别器上。',
  },
  fail: {
    ko: '지문 인식에 실패했습니다.\n손가락이 건조하거나, 위치가 맞지 않으면 인식에 실패합니다. 손가락을 다시 올려주세요.',
    en: 'Fingerprint recognition failed.\nPlease ensure your finger is dry and positioned correctly.',
    ja: '指紋認識に失敗しました。\n指が乾燥しているか位置が正しくない場合、認識に失敗します。もう一度置いてください。',
    zh: '指纹识别失败。\n手指干燥或位置不正确时识别会失败，请重新放置手指。',
  },
  ok: {
    ko: '지문 인식에 성공하였습니다.',
    en: 'Fingerprint recognized successfully.',
    ja: '指紋認識に成功しました。',
    zh: '指纹识别成功。',
  },
};

const RETRY_LABEL: Record<Language, string> = {
  ko: '다시 시도',
  en: 'Try Again',
  ja: 'もう一度',
  zh: '重试',
};

const ID_INCOMPLETE: Record<Language, string> = {
  ko: '주민번호 13자리가 모두 입력되지 않았습니다.',
  en: 'Please enter all 13 digits of your ID number.',
  ja: '住民番号13桁が全て入力されていません。',
  zh: '居民号码13位未全部输入。',
};

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
    ko: '문서 출력을 준비하고 있습니다. \n잠시만 기다려주십시오.',
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
  onRegisterNumpadCancel,
}) => {
  const fm = useFocusManagerContext();
  const { wrapRef, innerRef, navigate } = useMagnify(isMagnified);
  const [step, setStep] = useState<VerifyStep>('id-input');
  const [id, setId] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  // 단계 진입 음성 안내 발화 후 초기 포커스 발화
  useEffect(() => {
    if (!isTtsOn) return;
    speakAndThen (
      HEADER['id-input'][language],
      () => fm.activateFocusMode('numpad', 0)
      );
  }, [isTtsOn]);

  // 그룹 체인 등록 (step 변경 시)
  useEffect(() => {
    if (step === 'fp-fail') {
      fm.registerGroupChain('bottombar', { next: 'identity', prev: 'identity'});
      fm.registerGroupChain('identity', { next: 'bottombar', prev: 'bottombar'});
    } else if (step === 'id-input') {
      fm.registerGroupChain('bottombar', { next: 'numpad', prev: 'numpad'});
      fm.registerGroupChain('numpad', { next: 'bottombar', prev: 'bottombar'});
    }
  }, [step]);

  // step별 TTS 안내
  useEffect(() => {
    if (!isTtsOn) return;
    switch (step) {
      case 'fp-wait':
        speakSafe(FP_STATUS.wait[language]);
        break;
      case 'fp-fail':
        speakAndThen(
          FP_STATUS.fail[language],
          () => fm.activateFocusMode('identity', 0)
        );
        break;
    }
  }, [step]);

  // NAVHELP용 페이지 도움말 텍스트 업데이트
  useEffect(() => {
    setPageHelpText(HEADER[step][language]);
  }, [step, language]);

  // 취소 = 전체 지우기 등록 (id-input 단계만)
  useEffect(() => {
    if (step === 'id-input') {
      onRegisterNumpadCancel(() => {
        setId('');
        speakAndThen('입력이 모두 지워졌습니다.', () => fm.activateFocusMode('numpad', 0));
      });
    } else {
      onRegisterNumpadCancel(null);
    }
    return () => onRegisterNumpadCancel(null);
  }, [step]);

  useEffect(() => {
    if (step === 'id-input' && id.length === 13) setStep('fp-wait');
  }, [id, step]);

  // 지문 시뮬레이션
  useEffect(() => {
      if (step === 'fp-wait') {
        const t = setTimeout(() => setStep(Math.random() > 0.4 ? 'fp-ok' : 'fp-fail'), 3000);
        return () => clearTimeout(t);
      }
      if (step === 'fp-ok') {
        if (isTtsOn) {
          speakAndThen(FP_STATUS.ok[language], () => setTimeout(onVerified, 300));
        } else {
          const t = setTimeout(onVerified, 1500);
          return () => clearTimeout(t);
        }
      }
  }, [step, onVerified, isTtsOn, language]);

  return (
    <div className="kiosk-root">
      <header className="kiosk-header">
        <StepIndicator currentStep={3} language={language} />
        <div className="header-title">
          {HEADER[step][language].split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>
              {line}
              {i < arr.length -1 && <br />}
            </React.Fragment>
          ))}
        </div>
      </header>

      <main className="kiosk-content content-verify">
        {isMagnified && <NavPad onNavigate={navigate} />}
        <div ref={wrapRef} className="content-scroll-wrap">
          <div ref={innerRef} className="content-wrap-verify" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          {step === 'id-input' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {/* 입력값 표시 */}
              <div className={`id-display${!id ? ' empty' : ''}`}>
                {id ? formatId(id) : ID_PLACEHOLDER[language]}
              </div>
              <NumPad
                value={id}
                onChange={setId}
                onConfirm={() => { if (id.length < 13) speakSafe(ID_INCOMPLETE[language]); }}
                maxLength={13}
                language={language}
              />
            </div>
          )}

          {step === 'fp-wait' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="fingerprint-area">
                <div className="status-card info" style={{ width: '100%' }}>
                  {FP_STATUS.wait[language]}
                </div>
                <div className="fingerprint-icon">
                  <img src={imgFPScan} alt="scan"/>
                </div>
              </div>
            </div>
          )}

          {step === 'fp-fail' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="status-card error">
                {FP_STATUS.fail[language].split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
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
                  data-ttsmsg={RETRY_LABEL[language]}
                  tabIndex={0}
                >
                  {RETRY_LABEL[language]}
                </button>
              </div>
            </div>
          )}

          {step === 'fp-ok' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="fingerprint-area">
                <div className="status-card success" style={{ width: '100%' }}>
                  {FP_STATUS.ok[language]}
                </div>
                <div className="fingerprint-icon">
                  <img src={imgFPSuccess} alt="success"/>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} language={language} />}

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
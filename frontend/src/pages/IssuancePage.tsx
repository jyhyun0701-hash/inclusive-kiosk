import React, { useState, useEffect } from 'react';
import StepIndicator from '../components/common/StepIndicator';
import BottomBar from '../components/common/BottomBar';
import type { Language, Certificate } from '../types/kiosk';
import imgPrint from '../assets/images/print.png';

type IssueStep = 'preparing' | 'printing' | 'done';

interface Props {
  language: Language;
  certificate: Certificate;
  isTtsOn: boolean;
  isMagnified: boolean;
  onHome: () => void;
  onToggleTts: () => void;
  onToggleMagnify: () => void;
}

const HEADER: Record<IssueStep, Record<Language, string>> = {
  preparing: {
    ko: '문서 출력을 준비하고 있습니다. 잠시만 기다려주십시오.',
    en: 'Preparing your document. Please wait.',
    ja: '書類の印刷を準備しています。しばらくお待ちください。',
    zh: '正在准备打印文件，请稍候。',
  },
  printing: {
    ko: '문서가 출력되고 있습니다. 잠시만 기다려주십시오.',
    en: 'Your document is being printed.',
    ja: '書類を印刷しています。',
    zh: '正在打印文件，请稍候。',
  },
  done: {
    ko: '발급된 문서를 수령해주십시오.',
    en: 'Please collect your document.',
    ja: '発行された書類をお受け取りください。',
    zh: '请取走您的文件。',
  },
};

const IssuancePage: React.FC<Props> = ({
  language, certificate, isTtsOn, isMagnified,
  onHome, onToggleTts, onToggleMagnify,
}) => {
  const [step, setStep] = useState<IssueStep>('preparing');
  const [receiptPrinted, setReceiptPrinted] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStep('printing'), 2000);
    const t2 = setTimeout(() => setStep('done'), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="kiosk-root">
      <header className="kiosk-header">
        <StepIndicator currentStep={4} language={language} />
        <div className="header-title">{HEADER[step][language]}</div>
      </header>

      <main className="kiosk-content content-verify">
        {step !== 'done' ? (
          <div className={`fingerprint-area${step === 'printing' ? ' printing' : ''}`}>
            <div className="status-card printing" style={{ width: '100%' }}>
              {step === 'preparing' ? '문서 출력을 준비하고 있습니다.' : '문서가 출력되고 있습니다.'}
            </div>
            <div className="fingerprint-icon">
              <img src={imgPrint} alt="print" />
            </div>
          </div>
        ) : (
          <>
            <div className="status-card done">발급이 완료되었습니다.</div>
            <table className="issue-table">
              <tbody>
                <tr><td>발급 서류</td><td>{certificate.nameKo}</td></tr>
                <tr><td>수수료</td><td>{certificate.fee.toLocaleString()}원</td></tr>
              </tbody>
            </table>

            {!receiptPrinted ? (
              <button
                className="cert-btn gray"
                style={{ marginTop: 24 }}
                onClick={() => setReceiptPrinted(true)}
                data-tabfocus="Y"
                data-tabgroup="issuance"
                data-ttsmsg="영수증 발급"
                tabIndex={0}
              >
                영수증 발급
              </button>
            ) : (
              <div className="status-card success" style={{ marginTop: 24 }}>
                영수증이 출력되었습니다.
              </div>
            )}

            <button
              className="cert-btn"
              style={{ marginTop: 24 }}
              onClick={onHome}
              data-tabfocus="Y"
              data-tabgroup="issuance"
              data-ttsmsg="처음으로 돌아가기"
              tabIndex={receiptPrinted ? 0 : 1}
            >
              처음으로 돌아가기
            </button>
          </>
        )}
      </main>

      <BottomBar
        language={language}
        isTtsOn={isTtsOn}
        isMagnified={isMagnified}
        onHome={onHome}
        onInfo={() => {}}
        onToggleTts={onToggleTts}
        onToggleMagnify={onToggleMagnify}
      />
    </div>
  );
};

export default IssuancePage;

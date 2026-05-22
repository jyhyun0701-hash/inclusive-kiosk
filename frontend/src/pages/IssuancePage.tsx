import React, { useState, useEffect } from 'react';
import { useMagnify } from '../hooks/useMagnify';
import NavPad from '../components/common/NavPad';
import StepIndicator from '../components/common/StepIndicator';
import BottomBar from '../components/common/BottomBar';
import type { Language, Certificate } from '../types/kiosk';
import { getCertName } from '../types/kiosk';
import { useFocusManagerContext } from '../context/FocusManagerContext';
import { speakSafe, speakAndThen, setPageHelpText } from '../utils/speakSafe';
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

const DONE_LABELS: Record<Language, {
  complete: string; docLabel: string; feeLabel: string; feeUnit: string;
  receipt: string; receiptDone: string; goHome: string;
}> = {
  ko: { complete: '발급이 완료되었습니다.',  docLabel: '발급 서류', feeLabel: '수수료', feeUnit: '원',    receipt: '영수증 발급',  receiptDone: '영수증이 출력되었습니다.', goHome: '처음으로 돌아가기' },
  en: { complete: 'Issuance complete.',       docLabel: 'Document',  feeLabel: 'Fee',    feeUnit: 'KRW',   receipt: 'Print Receipt', receiptDone: 'Receipt printed.',          goHome: 'Back to Home'      },
  ja: { complete: '発行が完了しました。',      docLabel: '発行書類',  feeLabel: '手数料', feeUnit: 'ウォン', receipt: '領収書発行',   receiptDone: '領収書が出力されました。',  goHome: '最初に戻る'        },
  zh: { complete: '发证完成。',               docLabel: '发证文件',  feeLabel: '费用',   feeUnit: '韩元',   receipt: '打印收据',      receiptDone: '收据已打印。',             goHome: '返回首页'          },
};

const HEADER: Record<IssueStep, Record<Language, string>> = {
  preparing: {
    ko: '문서 출력을 준비하고 있습니다. \n잠시만 기다려주십시오.',
    en: 'Preparing your document. Please wait.',
    ja: '書類の印刷を準備しています。しばらくお待ちください。',
    zh: '正在准备打印文件，请稍候。',
  },
  printing: {
    ko: '문서가 출력되고 있습니다. \n잠시만 기다려주십시오.',
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
  const fm = useFocusManagerContext();
  const [step, setStep] = useState<IssueStep>('preparing');
  const [receiptPrinted, setReceiptPrinted] = useState(false);
  const { wrapRef, innerRef, navigate } = useMagnify(isMagnified);

  useEffect(() => {
    const t1 = setTimeout(() => setStep('printing'), 2000);
    const t2 = setTimeout(() => setStep('done'), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // 마운트 시 출력 준비중 안내
  useEffect(() => {
      if (isTtsOn) speakSafe(HEADER.preparing[language]);
    }, []);

  // 발급 완료 단계 진입 시 영수증 발급 버튼으로 초기 포커스 이동
  useEffect(() => {
      if (step !== 'done') return;
      if (isTtsOn) {
        const msg = `${DONE_LABELS[language].complete} ${HEADER.done[language]}`;
        speakAndThen(msg, () => fm.activateFocusMode('issuance', 0));
      }
  }, [step]);

  // 영수증 발급 후 처음으로 버튼(tabindex=0으로 재배치)으로 포커스 이동
  useEffect(() => {
      if (!receiptPrinted || !isTtsOn) return;
      speakAndThen(
        DONE_LABELS[language].receiptDone,
        () => fm.activateFocusMode('issuance', 0)
      );
  }, [receiptPrinted]);

   // NAVHELP용 페이지 도움말 텍스트 업데이트
    useEffect(() => {
      setPageHelpText(HEADER[step][language]);
    }, [step, language]);

  const dl = DONE_LABELS[language];

  return (
    <div className="kiosk-root">
      <header className="kiosk-header">
        <StepIndicator currentStep={step === 'done' ? 5 : 4} language={language} />
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
          <div ref={innerRef} className="content-wrap-issuance">
          {step !== 'done' ? (
            <div className={`fingerprint-area${step === 'printing' ? ' printing' : ''}`}>
              <div className="status-card printing" style={{ width: '100%' }}>
                {HEADER[step][language]}
              </div>
              <div className="fingerprint-icon">
                <img src={imgPrint} alt="print" />
              </div>
            </div>
          ) : (
            <>
              <div className="status-card done">{dl.complete}</div>
              <table className="issue-table">
                <tbody>
                  <tr><td>{dl.docLabel}</td><td>{getCertName(certificate, language)}</td></tr>
                  <tr><td>{dl.feeLabel}</td><td>{certificate.fee.toLocaleString()} {dl.feeUnit}</td></tr>
                </tbody>
              </table>

              {!receiptPrinted ? (
                <button
                  className="cert-btn gray"
                  style={{ width: '600px', maxWidth: '600px', marginTop: '25px'}}
                  onClick={() => setReceiptPrinted(true)}
                  data-tabfocus="Y"
                  data-tabgroup="issuance"
                  data-ttsmsg={dl.receipt}
                  tabindex={0}
                >
                  {dl.receipt}
                </button>
              ) : (
                <div className="status-card success" style={{ marginTop: 24 }}>
                  {dl.receiptDone}
                </div>
              )}

              <button
                className="cert-btn"
                style={{ width: '600px', maxWidth: '600px' }}
                onClick={() => { if (isTtsOn) onToggleTts(); onHome(); }}
                data-tabfocus="Y"
                data-tabgroup="issuance"
                data-ttsmsg={dl.goHome}
                tabindex={receiptPrinted ? 0 : 1}
              >
                {dl.goHome}
              </button>
            </>
          )}
          </div>
        </div>
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

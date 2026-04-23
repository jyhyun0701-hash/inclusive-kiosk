import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Layout from '../components/common/Layout';
import { useFocusManagerContext } from '../context/FocusManagerContext';
import { numInputRegistry } from '../utils/numInputRegistry';
import { speakSafe } from '../utils/speakSafe';
import type { Certificate } from '../types/certificate';

type VerifyStep = 'id-input' | 'fingerprint';
type ScanStatus = 'idle' | 'scanning' | 'success' | 'failed';

const IdentityVerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fm = useFocusManagerContext();

  const [verifyStep, setVerifyStep] = useState<VerifyStep>('id-input');
  const [input,      setInput]      = useState('');
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [failCount,  setFailCount]  = useState(0);

  const selectedCert = location.state?.selectedCertificate as Certificate | undefined;

  const fmt = (v: string) =>
    v.length <= 6 ? v : `${v.slice(0, 6)}-${'*'.repeat(v.length - 6)}`;

  /* ── 주민번호 핸들러 ── */
  const handleNum = (k: string) => {
    setInput((prev) => {
      if (prev.length >= 13) return prev;
      const next = prev + k;
      if (next.length === 6) speakSafe('앞자리 입력 완료. 뒷자리를 입력해주세요.');
      return next;
    });
  };

  const handleDel = () => {
    setInput((prev) => { speakSafe('지웠습니다.'); return prev.slice(0, -1); });
  };

  const handleSubmit = (currentInput?: string) => {
    // currentInput 은 레지스트리에서 호출 시 최신값을 넘기기 위해 사용
    setInput((prev) => {
      const val = currentInput ?? prev;
      if (val.length !== 13) {
        speakSafe('주민번호 13자리를 모두 입력해주세요.');
        return prev;
      }
      setVerifyStep('fingerprint');
      speakSafe('주민번호가 입력되었습니다. 지문 인식을 진행해주십시오.');
      return val;
    });
  };

  useEffect(() => {
    fm.initTabGroup(document, 'verify-keypad', { tabRotation: true,  playTtsOnMoved: true });
    fm.initTabGroup(document, 'verify-fp',     { tabRotation: false, playTtsOnMoved: true });
    fm.initTabGroup(document, 'bottombar',     { tabRotation: true,  playTtsOnMoved: true });
    fm.registerGroupChain('verify-keypad', { next: 'bottombar',     prev: 'bottombar' });
    fm.registerGroupChain('bottombar',     { next: 'verify-keypad', prev: 'verify-keypad' });

    speakSafe('주민번호 13자리를 입력해주십시오.');

    /**
     * numInputRegistry 등록
     * 숫자(0~9) → handleNum
     * DEL       → handleDel
     * ENTER     → handleSubmit  ← 13자리면 자동 제출
     */
    numInputRegistry.register((cmd) => {
      if (cmd === 'DEL')   handleDel();
      else if (cmd === 'ENTER') {
        // 최신 input 값을 직접 읽기 위해 DOM에서 가져오거나 ref 사용
        // 여기서는 setInput의 함수형 업데이트로 최신값 접근
        handleSubmit();
      }
      else handleNum(cmd);
    });

    return () => { numInputRegistry.unregister(); };
  }, []);

  // 지문 단계 진입
  useEffect(() => {
    if (verifyStep === 'fingerprint') {
      fm.registerGroupChain('verify-fp', { next: 'bottombar', prev: 'bottombar' });
      fm.registerGroupChain('bottombar', { next: 'verify-fp', prev: 'verify-fp' });
      numInputRegistry.unregister();
      // DOM 변경 후 포커스 (initTabFocusWhenReady 사용)
      fm.initTabFocusWhenReady(document, 'verify-fp', 0);
    }
  }, [verifyStep]);

  /* ── 지문 시뮬레이션 ── */
  const handleScan = () => {
    if (scanStatus === 'scanning') return;
    setScanStatus('scanning');
    speakSafe('지문을 인식하고 있습니다. 잠시 기다려주십시오.');
    setTimeout(() => {
      const ok = Math.random() > 0.3;
      if (ok) {
        setScanStatus('success');
        speakSafe('지문 인식에 성공하였습니다.');
        setTimeout(() => navigate('/issue', { state: { selectedCertificate: selectedCert } }), 1500);
      } else {
        setScanStatus('failed');
        setFailCount((c) => c + 1);
        speakSafe('지문 인식에 실패하였습니다. 손가락을 다시 올려주십시오.');
        setTimeout(() => fm.initTabFocusWhenReady(document, 'verify-fp', 1), 400);
      }
    }, 2000);
  };

  const handleRetry = () => {
    setScanStatus('idle');
    fm.initTabFocus(document, 'verify-fp', 0);
    speakSafe('지문 입력기에 손가락을 다시 올려주십시오.');
  };

  const ROWS = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['지우기','0','입력'],
  ];

  const getTabIdx = (key: string, ri: number, ci: number) => {
    if (key === '지우기') return 9;
    if (key === '0')      return 10;
    if (key === '입력')   return 11;
    return ri * 3 + ci;
  };

  const getTts = (key: string) => {
    if (key === '지우기') return '지우기. 마지막 숫자를 지웁니다.';
    if (key === '입력')   return '입력 완료. 주민번호 입력을 완료합니다.';
    return `${key}. ${key}를 입력합니다.`;
  };

  return (
    <Layout currentStep={3} title="본인 확인을 진행해주십시오.">
      <PageWrapper>
        {selectedCert && (
          <Badge>선택한 증명서: <strong>{selectedCert.nameKo}</strong></Badge>
        )}

        {/* ── 주민번호 입력 ── */}
        {verifyStep === 'id-input' && (
          <KSection>
            <Display role="textbox" aria-label="주민번호 입력창" aria-live="polite">
              {input.length === 0
                ? <PHint>주민번호를 입력하십시오. 예) 901010-1234567</PHint>
                : <DText>{fmt(input)}</DText>
              }
              <PBar><PFill $w={(input.length / 13) * 100} /></PBar>
            </Display>

            <KGrid role="group" aria-label="숫자 키패드">
              {ROWS.map((row, ri) =>
                row.map((key, ci) => (
                  <KBtn
                    key={key}
                    onClick={() => {
                      if (key === '지우기') handleDel();
                      else if (key === '입력') handleSubmit();
                      else handleNum(key);
                    }}
                    disabled={key === '입력' && input.length !== 13}
                    data-tabfocus="Y" data-tabgroup="verify-keypad"
                    tabIndex={getTabIdx(key, ri, ci)}
                    data-ttsmsg={getTts(key)}
                    $action={key === '지우기' || key === '입력'}
                    $confirm={key === '입력'}
                    aria-label={key}
                  >
                    {key}
                  </KBtn>
                ))
              )}
            </KGrid>

            {input.length > 0 && (
              <InputFeedback aria-hidden="true">{input.length}/13자리 입력됨</InputFeedback>
            )}
          </KSection>
        )}

        {/* ── 지문 인식 ── */}
        {verifyStep === 'fingerprint' && (
          <FPSection>
            <SMsg $s={scanStatus} role="status" aria-live="assertive">
              {scanStatus === 'idle'     && '지문 입력기에 엄지 손가락을 올려주십시오.'}
              {scanStatus === 'scanning' && '지문을 인식하고 있습니다. 잠시 기다려주십시오.'}
              {scanStatus === 'success'  && '지문 인식에 성공하였습니다.'}
              {scanStatus === 'failed'   && '지문 인식에 실패하였습니다. 손가락을 다시 올려주십시오.'}
            </SMsg>

            <ScanArea
              onClick={scanStatus === 'idle' || scanStatus === 'failed' ? handleScan : undefined}
              $s={scanStatus}
              data-tabfocus="Y" data-tabgroup="verify-fp" tabIndex={0}
              data-ttsmsg="지문 인식. 지문 인식을 시작하려면 확인을 누르세요."
              role="button" aria-label="지문 인식 시작"
            >
              {scanStatus === 'success'  && <Ri $c="var(--accent-green)">✓</Ri>}
              {scanStatus === 'failed'   && <Ri $c="var(--accent-red)">✗</Ri>}
              {(scanStatus === 'idle' || scanStatus === 'scanning') && <FPSVG sc={scanStatus === 'scanning'} />}
              {scanStatus === 'scanning' && <><Ring $d="0s"/><Ring $d="0.4s"/><Ring $d="0.8s"/></>}
            </ScanArea>

            {scanStatus === 'failed' && (
              <RetryBtn
                onClick={handleRetry}
                data-tabfocus="Y" data-tabgroup="verify-fp" tabIndex={1}
                data-ttsmsg="다시 시도. 지문 인식을 다시 시도합니다."
              >
                다시 시도하기
                {failCount >= 2 && <RHint> (주민번호로 다시 인증 가능)</RHint>}
              </RetryBtn>
            )}
            <SimNote aria-hidden="true">* 데모: 지문 아이콘 클릭 시 인식 시뮬레이션</SimNote>
          </FPSection>
        )}
      </PageWrapper>
    </Layout>
  );
};

export default IdentityVerifyPage;

const FPSVG = ({ sc }: { sc: boolean }) => (
     <svg width="100" height="100" viewBox="0 0 80 80" fill="none" aria-hidden="true">
         {["M40 10 C25 10 13 22 13 40 C13 52 18 62 26 68",
             "M40 18 C29 18 20 28 20 40 C20 50 25 58 32 63",
             "M40 26 C33 26 28 33 28 40 C28 47 31 53 36 57",
             "M40 34 C37 34 35 37 35 40 C35 44 37 47 40 50",
             "M40 18 C51 18 60 28 60 40 C60 50 55 58 48 63",
             "M40 26 C47 26 52 33 52 40 C52 47 49 53 44 57",
             "M40 10 C55 10 67 22 67 40 C67 52 62 62 54 68",
         ].map((d, i) => (
             <path key={i} d={d} stroke={sc ? 'var(--accent-blue)' : '#B8C4E0'}
                 strokeWidth="3" strokeLinecap="round" fill="none"/>
         ))}
     </svg>
 );

const ripple = keyframes`0%{transform:scale(1);opacity:0.6;}100%{transform:scale(2.2);opacity:0;}`;

const PageWrapper   = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
    height: 100%;
`;

const Badge = styled.div`
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-md);
    background-color: rgba(125, 205, 255, 0.12);
    border: 1px solid var(--accent-blue);
    color: var(--text-primary);
    font-size: var(--font-size-xs);
    align-self: stretch;
    text-align: center;
    strong { font-weight: 700; }
`;

const KSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
    width: 100%;
`;

const Display = styled.div`
    width: min(560px, 100%);
    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-sm);
    border-radius: var(--radius-md);
    border: 2px solid var(--accent-blue);
    background-color: var(--bg-secondary);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
`;

const PHint = styled.span`
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    opacity: 0.6;
`;

const DText = styled.span`
    color: #ffffff;
    font-size: var(--font-size-xl);
    font-weight: 600;
    letter-spacing: 4px;
`;

const PBar  = styled.div`width:100%;height:4px;background-color:var(--border-default);border-radius:2px;overflow:hidden;`;
const PFill = styled.div<{$w:number}>`height:100%;width:${({$w})=>$w}%;background-color:var(--accent-blue);border-radius:2px;transition:width .15s ease;`;

const KGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
    width: min(560px, 100%);
`;

const KBtn = styled.button<{$action?:boolean;$confirm?:boolean}>`
    height: 120px;
    border-radius: var(--radius-md);
    font-size: ${({$action}) => $action ? 'var(--font-size-sm)' : 'var(--font-size-xl)'};
    font-weight: ${({$confirm}) => $confirm ? 700 : 500};
    border: 2px solid ${({$confirm}) => $confirm ? 'var(--accent-blue)' : 'var(--border-default)'};
    background-color: ${({$confirm,$action}) =>
        $confirm ? 'var(--accent-blue)' : $action ? 'var(--bg-secondary)' : 'var(--bg-card)'};
    color: ${({$confirm}) => $confirm ? '#000000' : '#ffffff'};
    transition: all var(--transition);
    &:hover:not(:disabled) { filter: brightness(1.1); border-color: var(--accent-blue); }
    &:active:not(:disabled) { transform: scale(0.96); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
    &:focus-visible { outline: 3px solid var(--border-focus); outline-offset: 2px; }
`;

const InputFeedback = styled.p`
    font-size: var(--font-size-xs);
    color: var(--text-primary);
    text-align: center;
`;

const FPSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
`;

const SMsg = styled.p<{$s:string}>`
    font-size: var(--font-size-base);
    font-weight: 600;
    text-align: center;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-md);
    color: ${({$s}) => $s==='success' ? 'var(--accent-green)' : $s==='failed' ? 'var(--accent-red)' : 'var(--text-primary)'};
    background-color: ${({$s}) =>
        $s==='success' ? 'rgba(39,174,96,0.12)' :
        $s==='failed'  ? 'rgba(231,76,60,0.12)'  :
        $s==='scanning'? 'rgba(125,205,255,0.12)' : 'var(--bg-default)'};
    border: 2px solid ${({$s}) =>
        $s==='success' ? 'var(--accent-green)' :
        $s==='failed'  ? 'var(--accent-red)'   :
        $s==='scanning'? 'var(--accent-blue)'  : 'var(--border-default)'};
`;

const ScanArea = styled.div<{$s:string}>`
    position: relative;
    width: 200px; height: 200px;
    border-radius: 50%;
    border: 3px solid ${({$s}) =>
        $s==='success' ? 'var(--accent-green)' :
        $s==='failed'  ? 'var(--accent-red)'   :
        $s==='scanning'? 'var(--accent-blue)'  : 'var(--border-default)'};
    background-color: ${({$s}) =>
        $s==='success' ? 'rgba(39,174,96,0.1)' :
        $s==='failed'  ? 'rgba(231,76,60,0.1)' : 'var(--bg-secondary)'};
    display: flex; align-items: center; justify-content: center;
    cursor: ${({$s}) => $s==='idle'||$s==='failed' ? 'pointer' : 'default'};
    transition: all var(--transition);
    &:hover { border-color: var(--accent-blue); }
    &:focus-visible { outline: 3px solid var(--border-focus); outline-offset: 4px; }
`;

const Ri    = styled.span<{$c:string}>`font-size: 80px; color:${({$c})=>$c}; line-height:1;`;
const Ring  = styled.div<{$d:string}>`position:absolute;inset:0;border-radius:50%;border:2px solid var(--accent-blue);animation:${ripple} 1.5s ease-out ${({$d})=>$d} infinite;`;

const RetryBtn = styled.button`
    min-height: var(--touch-min);
    padding: 0 var(--spacing-xl);
    border-radius: var(--radius-md);
    border: 2px solid var(--accent-blue);
    background-color: transparent;
    color: var(--text-primary);
    font-size: var(--font-size-base);
    font-weight: 600;
    transition: all var(--transition);
    &:hover { background-color: rgba(125,205,255,0.1); }
    &:focus-visible { outline: 3px solid var(--border-focus); outline-offset: 2px; }
`;

const RHint   = styled.span`font-size: var(--font-size-xs); color: var(--text-primary); opacity: 0.6; font-weight: 400;`;
const SimNote = styled.p`font-size: var(--font-size-xs); color: var(--text-primary); opacity: 0.5; text-align: center;`;

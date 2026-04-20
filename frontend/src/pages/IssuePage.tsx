import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Layout from '../components/common/Layout';
import { useFocusManagerContext } from '../context/FocusManagerContext';
import { speakSafe } from '../utils/speakSafe';
import type { Certificate } from '../types/certificate';

type IssueStep = 'printing' | 'complete';

const IssuePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fm = useFocusManagerContext();

  const [step, setStep] = useState<IssueStep>('printing');
  const cert = location.state?.selectedCertificate as Certificate | undefined;

  useEffect(() => {
    fm.initTabGroup(document, 'issue',    { tabRotation: false, playTtsOnMoved: true });
    fm.initTabGroup(document, 'bottombar',{ tabRotation: true,  playTtsOnMoved: true });
    fm.registerGroupChain('issue',     { next: 'bottombar', prev: 'bottombar' });
    fm.registerGroupChain('bottombar', { next: 'issue',     prev: 'issue' });

    speakSafe('문서를 출력하고 있습니다. 잠시만 기다려주십시오.');

    const t = setTimeout(() => {
      setStep('complete');
      speakSafe('발급이 완료되었습니다. 영수증 발급 또는 처음 화면으로 이동하실 수 있습니다.');
      // 완료 후 첫 번째 버튼(영수증 발급)으로 포커스
      setTimeout(() => fm.initTabFocus(document, 'issue', 0), 400);
    }, 3000);

    return () => clearTimeout(t);
  }, []);

  const handleReceipt = () => {
    speakSafe('영수증을 발급합니다.');
    alert('영수증이 발급되었습니다.');
  };

  /**
   * 처음으로 버튼
   * deactivateFocusMode 호출 X
   * → MainPage 가 ttsEnabled 상태를 보고 스스로 재활성화
   */
  const handleHome = () => navigate('/');

  return (
    <Layout currentStep={4}>
      <PageWrapper>
        {step === 'printing' ? (
          <PrintView>
            <PW aria-hidden="true"><PA>🖨️</PA></PW>
            <Msg $c="var(--accent-blue)" $bg="rgba(74,144,217,0.12)" $b="var(--accent-blue)"
              role="status" aria-live="polite">
              문서를 출력하고 있습니다.
            </Msg>
            <Sub>잠시만 기다려주십시오.</Sub>
          </PrintView>
        ) : (
          <DoneView>
            <CheckIcon aria-hidden="true">✓</CheckIcon>
            <Msg $c="var(--accent-green)" $bg="rgba(39,174,96,0.12)" $b="var(--accent-green)"
              role="status" aria-live="assertive">
              발급이 완료되었습니다.
            </Msg>

            {cert && (
              <CBox>
                <CR><CL>발급 서류</CL><CV>{cert.nameKo}</CV></CR>
                {cert.fee != null && <CR><CL>수수료</CL><CV>{cert.fee.toLocaleString()}원</CV></CR>}
              </CBox>
            )}

            <BG>
              <RBtn
                onClick={handleReceipt}
                data-tabfocus="Y" data-tabgroup="issue" tabIndex={0}
                data-ttsmsg="영수증 발급. 영수증을 발급합니다."
              >
                영수증 발급
              </RBtn>
              <HBtn
                onClick={handleHome}
                data-tabfocus="Y" data-tabgroup="issue" tabIndex={1}
                data-ttsmsg="처음 화면으로. 처음 화면으로 돌아갑니다."
              >
                처음 화면으로
              </HBtn>
            </BG>
          </DoneView>
        )}
      </PageWrapper>
    </Layout>
  );
};

export default IssuePage;

const bounce  = keyframes`0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}`;
const fadeIn  = keyframes`from{opacity:0;transform:scale(0.6);}to{opacity:1;transform:scale(1);}`;

const PageWrapper = styled.div`display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:24px;`;
const PrintView   = styled.div`display:flex;flex-direction:column;align-items:center;gap:18px;`;
const DoneView    = styled.div`display:flex;flex-direction:column;align-items:center;gap:18px;width:100%;max-width:360px;`;
const PW          = styled.div`font-size:60px;`;
const PA          = styled.span`display:block;animation:${bounce} 0.8s ease infinite;`;
const CheckIcon   = styled.div`width:82px;height:82px;border-radius:50%;background-color:rgba(39,174,96,0.15);border:3px solid var(--accent-green);color:var(--accent-green);font-size:44px;display:flex;align-items:center;justify-content:center;animation:${fadeIn} 0.4s ease;`;
const Msg         = styled.p<{$c:string;$bg:string;$b:string}>`font-size:var(--font-size-xl);font-weight:700;text-align:center;padding:12px 24px;border-radius:var(--radius-md);color:${({$c})=>$c};background-color:${({$bg})=>$bg};border:1.5px solid ${({$b})=>$b};`;
const Sub         = styled.p`font-size:var(--font-size-base);color:var(--text-secondary);`;
const CBox        = styled.div`width:100%;background-color:var(--bg-card);border-radius:var(--radius-md);border:1px solid var(--border-default);overflow:hidden;`;
const CR          = styled.div`display:flex;justify-content:space-between;align-items:center;padding:11px 16px;&+&{border-top:1px solid var(--border-default);}`;
const CL          = styled.span`font-size:12px;color:var(--text-muted);`;
const CV          = styled.span`font-size:13px;font-weight:600;color:var(--text-primary);`;
const BG          = styled.div`display:flex;flex-direction:column;gap:8px;width:100%;`;
const BB          = styled.button`width:100%;padding:13px;border-radius:var(--radius-md);font-size:var(--font-size-base);font-weight:600;transition:all var(--transition);&:focus-visible{outline:3px solid var(--border-focus);outline-offset:2px;}`;
const RBtn        = styled(BB)`background-color:transparent;border:1.5px solid var(--border-default);color:var(--text-secondary);&:hover{border-color:var(--accent-blue);color:var(--text-primary);background-color:var(--bg-button-hover);}`;
const HBtn        = styled(BB)`background-color:var(--accent-blue);border:1.5px solid var(--accent-blue);color:var(--text-primary);&:hover{background-color:#3A7BC8;}`;

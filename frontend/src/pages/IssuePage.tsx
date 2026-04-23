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
    const fm       = useFocusManagerContext();

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
            setTimeout(() => fm.initTabFocus(document, 'issue', 0), 400);
        }, 3000);

        return () => clearTimeout(t);
    }, []);

    const handleReceipt = () => { speakSafe('영수증을 발급합니다.'); alert('영수증이 발급되었습니다.'); };
    const handleHome    = () => navigate('/');

    return (
        <Layout currentStep={4} title="증명서를 발급합니다.">
            <PageWrapper>
                {step === 'printing' ? (
                    <PrintView>
                        <PrintIcon aria-hidden="true"><PA>🖨️</PA></PrintIcon>
                        <StatusMsg $c="var(--accent-blue)" $bg="rgba(125,205,255,0.12)" $b="var(--accent-blue)"
                            role="status" aria-live="polite">
                            문서를 출력하고 있습니다.
                        </StatusMsg>
                        <Sub>잠시만 기다려주십시오.</Sub>
                    </PrintView>
                ) : (
                    <DoneView>
                        <CheckIcon aria-hidden="true">✓</CheckIcon>
                        <StatusMsg $c="var(--accent-green)" $bg="rgba(39,174,96,0.12)" $b="var(--accent-green)"
                            role="status" aria-live="assertive">
                            발급이 완료되었습니다.
                        </StatusMsg>

                        {cert && (
                            <CBox>
                                <CRow><CLabel>발급 서류</CLabel><CValue>{cert.nameKo}</CValue></CRow>
                                {cert.fee != null && (
                                    <CRow><CLabel>수수료</CLabel><CValue>{cert.fee.toLocaleString()}원</CValue></CRow>
                                )}
                            </CBox>
                        )}

                        <BtnGroup>
                            <OutlineBtn
                                onClick={handleReceipt}
                                data-tabfocus="Y" data-tabgroup="issue" tabIndex={0}
                                data-ttsmsg="영수증 발급. 영수증을 발급합니다."
                            >
                                영수증 발급
                            </OutlineBtn>
                            <PrimaryBtn
                                onClick={handleHome}
                                data-tabfocus="Y" data-tabgroup="issue" tabIndex={1}
                                data-ttsmsg="처음 화면으로. 처음 화면으로 돌아갑니다."
                            >
                                처음 화면으로
                            </PrimaryBtn>
                        </BtnGroup>
                    </DoneView>
                )}
            </PageWrapper>
        </Layout>
    );
};

export default IssuePage;

const bounce = keyframes`0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}`;
const fadeIn = keyframes`from{opacity:0;transform:scale(0.6);}to{opacity:1;transform:scale(1);}`;

const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: var(--spacing-xl);
`;

const PrintView = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
`;

const DoneView = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
    width: 100%;
    max-width: 700px;
`;

const PrintIcon = styled.div`font-size: 100px;`;
const PA        = styled.span`display: block; animation: ${bounce} 0.8s ease infinite;`;

const CheckIcon = styled.div`
    width: 140px; height: 140px;
    border-radius: 50%;
    background-color: rgba(39, 174, 96, 0.15);
    border: 3px solid var(--accent-green);
    color: var(--accent-green);
    font-size: 72px;
    display: flex; align-items: center; justify-content: center;
    animation: ${fadeIn} 0.4s ease;
`;

const StatusMsg = styled.p<{$c:string;$bg:string;$b:string}>`
    font-size: var(--font-size-xl);
    font-weight: 700;
    text-align: center;
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--radius-md);
    color: ${({$c}) => $c};
    background-color: ${({$bg}) => $bg};
    border: 2px solid ${({$b}) => $b};
`;

const Sub = styled.p`
    font-size: var(--font-size-base);
    color: var(--text-primary);
`;

const CBox = styled.div`
    width: 100%;
    background-color: var(--bg-secondary);          /* #002153 */
    border-radius: var(--radius-md);
    border: 2px solid var(--border-default);
    overflow: hidden;
`;

const CRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    & + & { border-top: 1px solid var(--border-default); }
`;

const CLabel = styled.span`font-size: var(--font-size-xs); color: #ffffff; opacity: 0.6;`;
const CValue = styled.span`font-size: var(--font-size-sm); font-weight: 600; color: #ffffff;`;

const BtnGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    width: 100%;
`;

const BaseBtn = styled.button`
    width: 100%;
    min-height: var(--touch-min);                   /* 88px */
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: 700;
    transition: all var(--transition);
    &:focus-visible { outline: 3px solid var(--border-focus); outline-offset: 2px; }
`;

const OutlineBtn = styled(BaseBtn)`
    background-color: transparent;
    border: 2px solid #9E9E9E;
    color: var(--text-primary);
    &:hover { border-color: var(--accent-blue); background-color: rgba(125,205,255,0.1); }
`;

const PrimaryBtn = styled(BaseBtn)`
    background-color: var(--accent-blue);           /* #7DCDFF */
    border: 2px solid var(--accent-blue);
    color: #000000;
    &:hover { filter: brightness(0.9); }
`;
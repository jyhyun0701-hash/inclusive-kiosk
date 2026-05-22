import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTTS } from '../../hooks/useTTS';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'failed';

interface FingerprintScannerProps {
  onSuccess: () => void;
}

const FingerprintScanner = ({ onSuccess }: FingerprintScannerProps) => {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [failCount, setFailCount] = useState(0);
  const { speak } = useTTS();

  // 페이지 진입 시 TTS 안내
  useEffect(() => {
    speak('지문 입력기에 엄지 손가락을 올려주십시오.');
  }, []);

  // 시뮬레이션: 지문 인식 버튼 클릭 시 동작
  const handleScan = () => {
    if (status === 'scanning') return;

    setStatus('scanning');
    speak('지문을 인식하고 있습니다. 잠시 기다려주십시오.');

    // 2초 후 결과 시뮬레이션 (70% 성공, 30% 실패)
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3;

      if (isSuccess) {
        setStatus('success');
        speak('지문 인식에 성공하였습니다.');
        // 1.5초 후 자동으로 다음 단계
        setTimeout(() => onSuccess(), 1500);
      } else {
        setStatus('failed');
        setFailCount((prev) => prev + 1);
        speak('지문 인식에 실패하였습니다. 손가락을 다시 올려주십시오.');
      }
    }, 2000);
  };

  const handleRetry = () => {
    setStatus('idle');
    speak('지문 입력기에 손가락을 다시 올려주십시오.');
  };

  return (
    <Wrapper>
      {/* 상태 안내 문구 */}
      <StatusMessage
        role="status"
        aria-live="assertive"
        $status={status}
      >
        {status === 'idle' && '지문 입력기에 엄지 손가락을 올려주십시오.'}
        {status === 'scanning' && '지문을 인식하고 있습니다. 잠시 기다려주십시오.'}
        {status === 'success' && '지문 인식에 성공하였습니다.'}
        {status === 'failed' && '지문 인식에 실패하였습니다. 손가락을 다시 올려주십시오.'}
      </StatusMessage>

      {/* 지문 아이콘 영역 */}
      <ScanArea
        onClick={status === 'idle' || status === 'failed' ? handleScan : undefined}
        role="button"
        aria-label={
          status === 'idle' || status === 'failed'
            ? '지문 인식 시작 (클릭 또는 Enter)'
            : '지문 인식 중'
        }
        tabindex={status === 'idle' || status === 'failed' ? 0 : -1}
        $status={status}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (status === 'idle' || status === 'failed') handleScan();
          }
        }}
      >
        <FingerprintIcon $status={status}>
          {status === 'success' ? (
            <SuccessIcon aria-hidden="true">✓</SuccessIcon>
          ) : status === 'failed' ? (
            <FailIcon aria-hidden="true">✗</FailIcon>
          ) : (
            <FingerprintSVG status={status} />
          )}
        </FingerprintIcon>

        {/* 스캔 중 링 애니메이션 */}
        {status === 'scanning' && (
          <>
            <ScanRing $delay="0s" />
            <ScanRing $delay="0.4s" />
            <ScanRing $delay="0.8s" />
          </>
        )}
      </ScanArea>

      {/* 실패 시 재시도 버튼 */}
      {status === 'failed' && (
        <RetryButton onClick={handleRetry} aria-label="지문 인식 재시도">
          다시 시도하기
          {failCount >= 2 && (
            <RetryHint> (주민번호로 다시 인증할 수도 있습니다)</RetryHint>
          )}
        </RetryButton>
      )}

      {/* 포트폴리오용 안내 텍스트 */}
      <SimulationNote aria-hidden="true">
        * 데모: 지문 아이콘을 클릭하면 인식이 시뮬레이션됩니다.
      </SimulationNote>
    </Wrapper>
  );
};

export default FingerprintScanner;

/* ===== SVG 지문 아이콘 ===== */
const FingerprintSVG = ({ status }: { status: ScanStatus }) => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M40 10 C25 10 13 22 13 40 C13 52 18 62 26 68"
      stroke={status === 'scanning' ? '#4A90D9' : '#B8C4E0'}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M40 18 C29 18 20 28 20 40 C20 50 25 58 32 63"
      stroke={status === 'scanning' ? '#4A90D9' : '#B8C4E0'}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M40 26 C33 26 28 33 28 40 C28 47 31 53 36 57"
      stroke={status === 'scanning' ? '#4A90D9' : '#B8C4E0'}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M40 34 C37 34 35 37 35 40 C35 44 37 47 40 50"
      stroke={status === 'scanning' ? '#4A90D9' : '#B8C4E0'}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M40 18 C51 18 60 28 60 40 C60 50 55 58 48 63"
      stroke={status === 'scanning' ? '#4A90D9' : '#B8C4E0'}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M40 26 C47 26 52 33 52 40 C52 47 49 53 44 57"
      stroke={status === 'scanning' ? '#4A90D9' : '#B8C4E0'}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M40 10 C55 10 67 22 67 40 C67 52 62 62 54 68"
      stroke={status === 'scanning' ? '#4A90D9' : '#B8C4E0'}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

/* ===== 애니메이션 ===== */
const ripple = keyframes`
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0;   }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

/* ===== Styled Components ===== */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const StatusMessage = styled.p<{ $status: ScanStatus }>`
  font-size: var(--font-size-lg);
  font-weight: 600;
  text-align: center;
  padding: 16px 28px;
  border-radius: var(--radius-md);
  line-height: 1.5;

  background-color: ${({ $status }) =>
    $status === 'success'
      ? 'rgba(39, 174, 96, 0.15)'
      : $status === 'failed'
      ? 'rgba(231, 76, 60, 0.15)'
      : $status === 'scanning'
      ? 'rgba(74, 144, 217, 0.15)'
      : 'var(--bg-card)'};

  color: ${({ $status }) =>
    $status === 'success'
      ? 'var(--accent-green)'
      : $status === 'failed'
      ? 'var(--accent-red)'
      : 'var(--text-primary)'};

  border: 1.5px solid
    ${({ $status }) =>
      $status === 'success'
        ? 'var(--accent-green)'
        : $status === 'failed'
        ? 'var(--accent-red)'
        : $status === 'scanning'
        ? 'var(--accent-blue)'
        : 'var(--border-default)'};
`;

const ScanArea = styled.div<{ $status: ScanStatus }>`
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background-color: ${({ $status }) =>
    $status === 'success'
      ? 'rgba(39, 174, 96, 0.12)'
      : $status === 'failed'
      ? 'rgba(231, 76, 60, 0.12)'
      : 'var(--bg-card)'};
  border: 2px solid
    ${({ $status }) =>
      $status === 'success'
        ? 'var(--accent-green)'
        : $status === 'failed'
        ? 'var(--accent-red)'
        : $status === 'scanning'
        ? 'var(--accent-blue)'
        : 'var(--border-default)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $status }) =>
    $status === 'idle' || $status === 'failed' ? 'pointer' : 'default'};
  transition: all var(--transition);

  &:hover {
    border-color: ${({ $status }) =>
      $status === 'idle' || $status === 'failed' ? 'var(--accent-blue)' : 'inherit'};
  }

  &:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 4px;
  }
`;

const FingerprintIcon = styled.div<{ $status: ScanStatus }>`
  animation: ${({ $status }) => ($status === 'scanning' ? pulse : 'none')} 1s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuccessIcon = styled.span`
  font-size: 64px;
  color: var(--accent-green);
  line-height: 1;
`;

const FailIcon = styled.span`
  font-size: 64px;
  color: var(--accent-red);
  line-height: 1;
`;

const ScanRing = styled.div<{ $delay: string }>`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--accent-blue);
  animation: ${ripple} 1.5s ease-out ${({ $delay }) => $delay} infinite;
`;

const RetryButton = styled.button`
  padding: 14px 32px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--accent-blue);
  background-color: transparent;
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: all var(--transition);

  &:hover {
    background-color: rgba(74, 144, 217, 0.1);
  }

  &:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }
`;

const RetryHint = styled.span`
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 400;
`;

const SimulationNote = styled.p`
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
`;

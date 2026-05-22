import styled from 'styled-components';
import { useTTS } from '../../hooks/useTTS';
import type { Certificate } from '../../types/certificate';

interface CertificateListProps {
  certificates: Certificate[];
  onSelect: (certificate: Certificate) => void;
}

const CertificateList = ({ certificates, onSelect }: CertificateListProps) => {
  const { speak } = useTTS();

  const handleClick = (cert: Certificate) => {
    speak(`${cert.nameKo} 선택되었습니다.`);
    onSelect(cert);
  };

  if (certificates.length === 0) {
    return (
      <EmptyText role="status" aria-live="polite">
        검색된 결과가 없습니다.
      </EmptyText>
    );
  }

  return (
    <Grid role="list" aria-label="증명서 목록">
      {certificates.map((cert) => (
        <Item
          key={cert.id}
          role="listitem"
          onClick={() => handleClick(cert)}
          tabindex={0}
          aria-label={`${cert.nameKo}, 수수료 ${cert.fee ? cert.fee + '원' : '무료'}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(cert);
            }
          }}
        >
          <ItemName>{cert.nameKo}</ItemName>
          {cert.fee != null && (
            <ItemFee>{cert.fee.toLocaleString()}원</ItemFee>
          )}
        </Item>
      ))}
    </Grid>
  );
};

export default CertificateList;

const Grid = styled.ul`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Item = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-default);
  background-color: var(--bg-card);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  text-align: center;
  transition: all var(--transition);
  cursor: pointer;
  width: 100%;

  &:hover {
    border-color: var(--accent-blue);
    background-color: rgba(74, 144, 217, 0.1);
  }

  &:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }
`;

const ItemName = styled.span`
  font-weight: 600;
  line-height: 1.4;
`;

const ItemFee = styled.span`
  font-size: 13px;
  color: var(--text-muted);
`;

const EmptyText = styled.p`
  text-align: center;
  color: var(--text-muted);
  padding: 40px 0;
  font-size: var(--font-size-base);
`;

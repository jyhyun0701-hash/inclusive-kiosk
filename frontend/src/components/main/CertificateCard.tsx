import styled from 'styled-components';
import type { Certificate } from '../../types/certificate';

interface CertificateCardProps {
  certificate: Certificate;
  onClick: (certificate: Certificate) => void;
  isFavorite?: boolean;
}

const CertificateCard = ({
  certificate,
  onClick,
  isFavorite = false,
}: CertificateCardProps) => {

  const handleClick = () => {
    onClick(certificate);
  };

  return (
    <Card
      onClick={handleClick}
      aria-label={`${certificate.nameKo}${isFavorite ? ', 자주 찾는 증명서' : ''}`}
      tabindex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
       {isFavorite && <FavoriteBadge aria-hidden="true">★</FavoriteBadge>}
            <CardText>{certificate.nameKo}</CardText>
          </Card>
        );
    };

export default CertificateCard;

const Card = styled.button`
  position: relative;
  width: 100%;
  padding: 18px 20px;
  background-color: var(--accent-blue);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-weight: 600;
  text-align: center;
  transition: all var(--transition);
  cursor: pointer;

  &:hover {
    background-color: #3A7BC8;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }
`;

const CardText = styled.span`
  display: block;
`;

const FavoriteBadge = styled.span`
  position: absolute;
  top: 8px;
  left: 10px;
  color: var(--accent-yellow);
  font-size: 14px;
`;

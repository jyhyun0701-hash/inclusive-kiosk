import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/common/Layout';
import LanguageSelector from '../components/main/LanguageSelector';
import { useAccessibility } from '../context/AccessibilityContext';
import { useFocusManagerContext } from '../context/FocusManagerContext';
import { fetchCertificates } from '../api/certificateApi';
import type { Certificate } from '../types/certificate';
import { FAVORITE_CERTIFICATE_NAMES } from '../types/certificate';

const MainPage = () => {
  const navigate = useNavigate();
  const { language } = useAccessibility();
  const fm = useFocusManagerContext();

  const [allCertificates, setAllCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // tabGroup 등록
    fm.initTabGroup(document, 'main', { tabRotation: true, playTtsOnMoved: true });
    fm.initTabGroup(document, 'bottombar', { tabRotation: true, playTtsOnMoved: true });

    // 그룹 체이닝: main 마지막(언어버튼23) → bottombar → main 첫번째(0)
    fm.registerGroupChain('main',      { next: 'bottombar', prev: 'bottombar' });
    fm.registerGroupChain('bottombar', { next: 'main',      prev: 'main' });

    fetchCertificates()
      .then(setAllCertificates)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const favoriteCerts = allCertificates.filter((c) =>
    FAVORITE_CERTIFICATE_NAMES.includes(c.nameKo)
  );

  const TITLES: Record<string, string> = {
    ko: '이용하실 언어와 메뉴를 선택해주십시오.',
    en: 'Please select your language and menu.',
    ja: '言語とメニューを選択してください。',
    zh: '请选择您的语言和菜单。',
  };

  const MORE: Record<string, string> = {
    ko: '증명서 더보기',
    en: 'View All',
    ja: 'もっと見る',
    zh: '查看更多',
  };

  return (
    <Layout currentStep={1}>
      <PageWrapper>
        <Title aria-live="polite">{TITLES[language]}</Title>

        <Section>
          <SectionLabel>
            <Star>★</Star> 자주 찾는 증명서
          </SectionLabel>

          {isLoading ? (
            <LoadText role="status">불러오는 중...</LoadText>
          ) : (
            <CardList role="list">
              {favoriteCerts.map((cert, idx) => (
                <li key={cert.id}>
                  <CertCard
                    onClick={() =>
                      navigate('/certificate', { state: { selectedCertificate: cert } })
                    }
                    /* main 그룹 tabIndex 0, 1, 2 */
                    data-tabfocus="Y"
                    data-tabgroup="main"
                    tabIndex={idx}
                    data-ttsmsg={`${cert.nameKo}. 선택하려면 확인을 누르세요.`}
                    aria-label={cert.nameKo}
                  >
                    <StarMark aria-hidden="true">★</StarMark>
                    {cert.nameKo}
                  </CertCard>
                </li>
              ))}
            </CardList>
          )}

          {/* 더보기: tabIndex = favoriteCerts.length (보통 3) */}
          <MoreBtn
            onClick={() => navigate('/certificate')}
            data-tabfocus="Y"
            data-tabgroup="main"
            tabIndex={favoriteCerts.length}
            data-ttsmsg={`${MORE[language]}. 전체 증명서 목록으로 이동합니다.`}
            aria-label={MORE[language]}
          >
            {MORE[language]}
          </MoreBtn>
        </Section>

        {/* 언어 선택: tabIndex 20~23 (LanguageSelector 내부에 정의됨) */}
        <LangSection>
          <LanguageSelector />
        </LangSection>
      </PageWrapper>
    </Layout>
  );
};

export default MainPage;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  height: 100%;
`;

const Title = styled.h1`
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.4;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionLabel = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
`;

const Star = styled.span`color: var(--accent-yellow);`;

const CardList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CertCard = styled.button`
  position: relative;
  width: 100%;
  padding: 15px 20px;
  background-color: var(--accent-blue);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-weight: 600;
  text-align: center;
  transition: all var(--transition);

  &:hover { background-color: #3A7BC8; transform: translateY(-1px); }
  &:focus-visible { outline: 3px solid var(--border-focus); outline-offset: 2px; }
`;

const StarMark = styled.span`
  position: absolute;
  left: 10px; top: 50%;
  transform: translateY(-50%);
  color: var(--accent-yellow);
  font-size: 13px;
`;

const MoreBtn = styled.button`
  width: 100%;
  padding: 13px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-default);
  background-color: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: 500;
  transition: all var(--transition);

  &:hover { border-color: var(--accent-blue); color: var(--text-primary); background-color: var(--bg-button-hover); }
  &:focus-visible { outline: 3px solid var(--border-focus); outline-offset: 2px; }
`;

const LangSection = styled.div`margin-top: auto; padding-bottom: 8px;`;

const LoadText = styled.p`
  color: var(--text-muted);
  text-align: center;
  padding: 16px 0;
`;

import styled from 'styled-components';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

const CategoryTabs = ({ categories, activeCategory, onSelect }: CategoryTabsProps) => {
  const handleSelect = (category: string) => {
    onSelect(category);
    const utt = new SpeechSynthesisUtterance(`${category} 카테고리.`);
    utt.lang = 'ko-KR';
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(utt);
  };

  return (
    <Wrapper role="tablist" aria-label="증명서 카테고리">
      {categories.map((cat, index) => (
        <Tab
          key={cat}
          role="tab"
          $isActive={activeCategory === cat}
          onClick={() => handleSelect(cat)}
          /* 카테고리 탭은 certificate 그룹에서 tabIndex 50번대 사용
             (0~49는 증명서 아이템용) */
          data-tabfocus="Y"
          data-tabgroup="certificate"
          tabIndex={50 + index}
          data-ttsmsg={`${cat} 카테고리. 선택하려면 확인을 누르세요.`}
          aria-selected={activeCategory === cat}
        >
          {cat}
        </Tab>
      ))}
    </Wrapper>
  );
};

export default CategoryTabs;

const Wrapper = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $isActive: boolean }>`
  padding: 8px 18px;
  border-radius: var(--radius-md);
  border: 1.5px solid
    ${({ $isActive }) => ($isActive ? 'var(--accent-blue)' : 'var(--border-default)')};
  background-color: ${({ $isActive }) =>
    $isActive ? 'var(--accent-blue)' : 'transparent'};
  color: ${({ $isActive }) => ($isActive ? 'var(--text-primary)' : 'var(--text-secondary)')};
  font-size: var(--font-size-base);
  font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};
  transition: all var(--transition);

  &:hover { border-color: var(--accent-blue); color: var(--text-primary); }
  &:focus-visible { outline: 3px solid var(--border-focus); outline-offset: 2px; }
`;

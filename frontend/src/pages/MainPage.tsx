import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Layout from "../components/common/Layout";
import { useAccessibility } from "../context/AccessibilityContext";
import { useFocusManagerContext } from "../context/FocusManagerContext";
import { fetchCertificates } from "../api/certificateApi";
import type { Certificate } from "../types/certificate";
import { FAVORITE_CERTIFICATE_NAMES } from "../types/certificate";

// ─────────────────────────────────────────────
// 언어 설정
// ─────────────────────────────────────────────
const TITLES: Record<string, string> = {
	ko: "이용하실 언어와 메뉴를 선택해주십시오.",
	en: "Please select your language and menu.",
	ja: "言語とメニューを選択してください。",
	zh: "请选择您的语言和菜单。",
};

const MORE: Record<string, string> = {
	ko: "증명서 더보기",
	en: "View All",
	ja: "もっと見る",
	zh: "查看更多",
};

const LANGUAGES = [
	{ code: "ko", label: "한국어", flag: "🇰🇷" },
	{ code: "en", label: "English", flag: "🇺🇸" },
	{ code: "ja", label: "日本語", flag: "🇯🇵" },
	{ code: "zh", label: "中文",   flag: "🇨🇳" },
] as const;

// ─────────────────────────────────────────────
// MainPage
// ─────────────────────────────────────────────
const MainPage = () => {
	const navigate = useNavigate();
	const { language, setLanguage, ttsEnabled, zoomEnabled } = useAccessibility();
	const fm = useFocusManagerContext();

	const [allCerts, setAllCerts]   = useState<Certificate[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// ── 초기화 ──
	useEffect(() => {
		fm.initTabGroup(document, "main", { tabRotation: true, playTtsOnMoved: true });
		fm.initTabGroup(document, "bottombar", { tabRotation: true, playTtsOnMoved: true });
		fm.registerGroupChain("main",     { next: "bottombar", prev: "bottombar" });
		fm.registerGroupChain("bottombar",{ next: "main",      prev: "main"      });

		fetchCertificates()
			.then(setAllCerts)
			.catch(console.error)
			.finally(() => setIsLoading(false));
	}, []);

	// ── 로드 완료 후 포커스 재설정 ──
	useEffect(() => {
		if (isLoading || !ttsEnabled) return;
		fm.activateFocusMode("main", 0, document);
	}, [isLoading]);

	const favCerts = allCerts.filter((c) =>
		FAVORITE_CERTIFICATE_NAMES.includes(c.nameKo),
	);

	// ─────────────────────────────────────────
	// 줌 모드 네비게이션 핸들러
	// ─────────────────────────────────────────
	const handleScrollUp    = () => window.scrollBy({ top: -300, behavior: "smooth" });
	const handleScrollLeft  = () => window.scrollBy({ left: -300, behavior: "smooth" });
	const handleScrollRight = () => window.scrollBy({ left:  300, behavior: "smooth" });

	// ─────────────────────────────────────────
	return (
		<Layout currentStep={1}>
			<PageWrapper>

				{/* ── 상단 스크롤 화살표 (줌 모드) ── */}
				{zoomEnabled && (
					<NavUpRow>
						<NavArrowBtn
							onClick={handleScrollUp}
							aria-label="위로 스크롤"
							data-tabfocus="Y"
							data-tabgroup="main"
							tabIndex={-1}
						>
							∧
						</NavArrowBtn>
					</NavUpRow>
				)}

				{/* ── 타이틀 ── */}
				<Title aria-live="polite">{TITLES[language]}</Title>

				{/* ── 자주 찾는 증명서 ── */}
				<ContentRow>
					{/* 좌측 화살표 (줌 모드) */}
					{zoomEnabled && (
						<SideNavBtn
							onClick={handleScrollLeft}
							aria-label="왼쪽으로 스크롤"
							data-tabfocus="Y"
							data-tabgroup="main"
							tabIndex={-1}
						>
							‹
						</SideNavBtn>
					)}

					<Section>
						<SLabel>
							<Star aria-hidden="true">★</Star>
							자주 찾는 증명서
						</SLabel>

						{isLoading ? (
							<LoadText role="status">불러오는 중...</LoadText>
						) : (
							<CardList role="list">
								{favCerts.map((cert, idx) => (
									<li key={cert.id}>
										<CertCard
											onClick={() =>
												navigate("/certificate", {
													state: { selectedCertificate: cert },
												})
											}
											data-tabfocus="Y"
											data-tabgroup="main"
											tabIndex={idx}
											data-ttsmsg={`${cert.nameKo}. 선택하려면 확인을 누르세요.`}
											aria-label={cert.nameKo}
										>
											<CardStarMark aria-hidden="true">★</CardStarMark>
											{cert.nameKo}
										</CertCard>
									</li>
								))}
							</CardList>
						)}

						<MoreBtn
							onClick={() => navigate("/certificate")}
							data-tabfocus="Y"
							data-tabgroup="main"
							tabIndex={favCerts.length}
							data-ttsmsg={`${MORE[language]}. 전체 증명서 목록으로 이동합니다.`}
							aria-label={MORE[language]}
						>
							{MORE[language]}
						</MoreBtn>
					</Section>

					{/* 우측 화살표 (줌 모드) */}
					{zoomEnabled && (
						<SideNavBtn
							onClick={handleScrollRight}
							aria-label="오른쪽으로 스크롤"
							data-tabfocus="Y"
							data-tabgroup="main"
							tabIndex={-1}
						>
							›
						</SideNavBtn>
					)}
				</ContentRow>

				{/* ── 언어 선택 ── */}
				<LangSection>
					<LangRow role="group" aria-label="언어 선택">
						{LANGUAGES.map((lang, idx) => {
							const isActive = language === lang.code;
							return (
								<LangBtn
									key={lang.code}
									onClick={() => setLanguage(lang.code)}
									$isActive={isActive}
									data-tabfocus="Y"
									data-tabgroup="main"
									tabIndex={favCerts.length + 1 + idx}
									data-ttsmsg={`${lang.label} 선택.`}
									aria-label={lang.label}
									aria-pressed={isActive}
								>
									<LangFlag aria-hidden="true">{lang.flag}</LangFlag>
									<LangLabel>{lang.label}</LangLabel>
								</LangBtn>
							);
						})}
					</LangRow>
				</LangSection>

			</PageWrapper>
		</Layout>
	);
};

export default MainPage;

// ═══════════════════════════════════════════════
// Styled Components
// ═══════════════════════════════════════════════

const PageWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: var(--spacing-lg);
	height: 100%;
	padding: var(--spacing-lg) var(--spacing-xl);
`;

// ── 타이틀 ──
const Title = styled.h1`
	font-size: var(--font-size-xl);
	font-weight: 700;
	color: var(--text-primary);
	text-align: center;
	line-height: 1.4;
`;

// ── 줌 네비게이션 ──
const NavUpRow = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: calc(var(--spacing-md) * -1);
`;

const NavArrowBtn = styled.button`
	width: 72px;
	height: 72px;
	border-radius: var(--radius-md);
	border: none;
	background-color: var(--accent-yellow);
	color: #1b2b5e;
	font-size: 36px;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all var(--transition);
	&:hover { background-color: #e09520; }
	&:focus-visible { outline: 3px solid var(--border-focus); outline-offset: 2px; }
`;

const ContentRow = styled.div`
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
	flex: 1;
`;

const SideNavBtn = styled.button`
	flex-shrink: 0;
	width: 72px;
	height: 72px;
	border-radius: var(--radius-md);
	border: none;
	background-color: var(--accent-yellow);
	color: #1b2b5e;
	font-size: 48px;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all var(--transition);
	&:hover { background-color: #e09520; }
	&:focus-visible { outline: 3px solid var(--border-focus); outline-offset: 2px; }
`;

// ── 증명서 섹션 ──
const Section = styled.section`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
`;

// 자주 찾는 증명서
const SLabel = styled.p`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: var(--spacing-sm);
	font-size: var(--font-size-base);
	font-weight: 900;
	color: var(--text-primary);
`;

const Star = styled.span`
	color: var(--accent-yellow);
	font-size: var(--font-size-base);
`;

const CardList = styled.ul`
	list-style: none;
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xl);
`;

const CertCard = styled.button`
	position: relative;
	width: 100%;
	min-height: 140px;         /* 88px → 140px */
	padding: var(--spacing-lg) var(--spacing-xl);
	background-color: var(--accent-blue);
	border: 2px solid transparent;
	border-radius: var(--radius-md);
	color: var(--text-primary);
	font-size: var(--font-size-base);
	font-weight: 1000;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all var(--transition);
	&:hover {
		background-color: #3a7bc8;
		transform: translateY(-2px);
	}
	&:focus-visible {
		outline: 3px solid var(--border-focus);
		outline-offset: 2px;
	}
`;

const CardStarMark = styled.span`
	position: absolute;
	left: var(--spacing-md);
	top: 50%;
	transform: translateY(-50%);
	color: var(--accent-yellow);
	font-size: var(--font-size-base);
`;

const MoreBtn = styled.button`
	width: 100%;
	min-height: 140px;         /* 88px → 140px */
    padding: var(--spacing-lg) var(--spacing-xl);
	border-radius: var(--radius-md);
 	border: none;
	background-color: var(--bg-default);
	color: var(--text-primary);
	font-size: var(--font-size-base);
	font-weight: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all var(--transition);
	&:hover {
		border-color: var(--accent-blue);
		color: var(--text-primary);
		background-color: var(--bg-button-hover);
	}
	&:focus-visible {
		outline: 3px solid var(--border-focus);
		outline-offset: 2px;
	}
`;

// ── 언어 선택 ──
const LangSection = styled.div`
	margin-top: auto;
	padding-bottom: var(--spacing-sm);
`;

const LangRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: var(--spacing-xl);
`;

const LangBtn = styled.button<{ $isActive?: boolean }>`
	width: 200px;
	height: 180px;
	border-radius: 50%;
	border: 3px solid ${({ $isActive }) =>
		$isActive ? "var(--accent-blue)" : "var(--border-default)"};
	background-color: ${({ $isActive }) =>
		$isActive ? "var(--bg-blue)" : "var(--bg-card)"};
	color: var(--text-secondary);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: var(--spacing-xs);
	transition: all var(--transition);
	box-shadow: ${({ $isActive }) =>
		$isActive ? "0 0 0 4px rgba(74, 144, 217, 0.3)" : "none"};
	&:hover {
		border-color: var(--accent-blue);
		background-color: var(--bg-button-hover);
	}
	&:focus-visible {
		outline: 3px solid var(--border-focus);
		outline-offset: 2px;
	}
`;

const LangFlag = styled.span`
	font-size: var(--font-size-xl);
	line-height: 0.8;
`;

const LangLabel = styled.span`
	font-size: var(--font-size-base);
	font-weight: 1000;
`;

const LoadText = styled.p`
	color: var(--text-secondary);
	text-align: center;
	padding: var(--spacing-lg) 0;
	font-size: var(--font-size-base);
`;
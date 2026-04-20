import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Layout from "../components/common/Layout";
import LanguageSelector from "../components/main/LanguageSelector";
import { useAccessibility } from "../context/AccessibilityContext";
import { useFocusManagerContext } from "../context/FocusManagerContext";
import { fetchCertificates } from "../api/certificateApi";
import type { Certificate } from "../types/certificate";
import { FAVORITE_CERTIFICATE_NAMES } from "../types/certificate";

const MainPage = () => {
	const navigate = useNavigate();
	const { language, ttsEnabled } = useAccessibility();
	const fm = useFocusManagerContext();

	const [allCerts, setAllCerts] = useState<Certificate[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// tabGroup / 체이닝 등록
		fm.initTabGroup(document, "main", {
			tabRotation: true,
			playTtsOnMoved: true,
		});
		fm.initTabGroup(document, "bottombar", {
			tabRotation: true,
			playTtsOnMoved: true,
		});
		fm.registerGroupChain("main", { next: "bottombar", prev: "bottombar" });
		fm.registerGroupChain("bottombar", { next: "main", prev: "main" });

		fetchCertificates()
			.then(setAllCerts)
			.catch(console.error)
			.finally(() => setIsLoading(false));
	}, []);

	/**
	 * 발급 완료 후 돌아왔을 때 포커스 재활성화
	 * ttsEnabled 가 이미 켜진 상태 + 데이터 로드 완료 시
	 * 단, BottomBar에서 speakPriority 이미 호출했으므로 여기서는 speakSafe 호출 안 함
	 */
	useEffect(() => {
		if (isLoading || !ttsEnabled) return;
		// 포커스만 재설정 (TTS는 data-ttsmsg에서 자동 읽힘)
		fm.activateFocusMode("main", 0, document);
	}, [isLoading]);
	// ↑ ttsEnabled 의존성 제거 — 페이지 데이터 로드 완료 시만 실행

	const favCerts = allCerts.filter((c) =>
		FAVORITE_CERTIFICATE_NAMES.includes(c.nameKo),
	);

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

	return (
		<Layout currentStep={1}>
			<PageWrapper>
				<Title aria-live="polite">{TITLES[language]}</Title>

				<Section>
					<SLabel>
						<Star>★</Star> 자주 찾는 증명서
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
												state: {
													selectedCertificate: cert,
												},
											})
										}
										data-tabfocus="Y"
										data-tabgroup="main"
										tabIndex={idx}
										data-ttsmsg={`${cert.nameKo}. 선택하려면 확인을 누르세요.`}
										aria-label={cert.nameKo}
									>
										<StarMark aria-hidden="true">
											★
										</StarMark>
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
	gap: 12px;
`;
const SLabel = styled.p`
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: var(--font-size-m);
	color: var(--text-secondary);
`;
const Star = styled.span`
	color: var(--accent-yellow);
`;
const CardList = styled.ul`
	list-style: none;
	display: flex;
	flex-direction: column;
	gap: 12px;
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
	&:hover {
		background-color: #3a7bc8;
		transform: translateY(-1px);
	}
	&:focus-visible {
		outline: 3px solid var(--border-focus);
		outline-offset: 2px;
	}
`;

const StarMark = styled.span`
	position: absolute;
	left: 10px;
	top: 50%;
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

const LangSection = styled.div`
	margin-top: auto;
	padding-bottom: 8px;
`;
const LoadText = styled.p`
	color: var(--text-muted);
	text-align: center;
	padding: 16px 0;
`;

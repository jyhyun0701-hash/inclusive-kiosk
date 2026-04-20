import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import Layout from "../components/common/Layout";
import Modal from "../components/common/Modal";
import CategoryTabs from "../components/certificate/CategoryTabs";
import KeyboardInput from "../components/certificate/KeyboardInput";
import { useFocusManagerContext } from "../context/FocusManagerContext";
import { useAccessibility } from "../context/AccessibilityContext";
import { speakSafe } from "../utils/speakSafe";
import { fetchCertificates } from "../api/certificateApi";
import type { Certificate } from "../types/certificate";

type ViewMode = "category" | "search";

const CertificateSelectPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const fm = useFocusManagerContext();
	const { ttsEnabled } = useAccessibility(); // ← 직접 사용

	const [allCertificates, setAllCertificates] = useState<Certificate[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [viewMode, setViewMode] = useState<ViewMode>("category");
	const [activeCategory, setActiveCategory] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const modalOriginTabindex = useRef(0);

	useEffect(() => {
		// TTS 켜진 상태에서만 그룹 등록 + 체이닝
		if (ttsEnabled) {
			fm.initTabGroup(document, "certificate", {
				tabRotation: true,
				playTtsOnMoved: true,
			});
			fm.initTabGroup(document, "bottombar", {
				tabRotation: true,
				playTtsOnMoved: true,
			});
			fm.registerGroupChain("certificate", {
				next: "bottombar",
				prev: "bottombar",
			});
			fm.registerGroupChain("bottombar", {
				next: "certificate",
				prev: "certificate",
			});
		}

		fetchCertificates()
			.then((data) => {
				setAllCertificates(data);
				if (data.length > 0) {
					const cats = [...new Set(data.map((c) => c.category))];
					setActiveCategory(cats[0]);
				}
			})
			.catch(console.error)
			.finally(() => setIsLoading(false));
	}, []);

	// 데이터 로드 완료 후 포커스 설정 (TTS 켜진 경우만)
	useEffect(() => {
		if (isLoading || !ttsEnabled) return;
		fm.initTabFocusWhenReady(document, "certificate", 0);
	}, [isLoading]);

	// 메인에서 바로 선택한 경우
	useEffect(() => {
		const pre = location.state?.selectedCertificate as
			| Certificate
			| undefined;
		if (pre) {
			setSelectedCert(pre);
			setIsModalOpen(true);
		}
	}, [location.state]);

	const categories = useMemo(
		() => [...new Set(allCertificates.map((c) => c.category))],
		[allCertificates],
	);

	const displayed = useMemo(() => {
		if (viewMode === "search") {
			if (!searchQuery.trim()) return [];
			return allCertificates.filter((c) =>
				c.nameKo.includes(searchQuery.trim()),
			);
		}
		return allCertificates.filter((c) => c.category === activeCategory);
	}, [viewMode, activeCategory, searchQuery, allCertificates]);

	const handleCertSelect = (cert: Certificate, tabindex: number) => {
		modalOriginTabindex.current = tabindex;
		setSelectedCert(cert);
		setIsModalOpen(true);
		if (ttsEnabled)
			speakSafe(`${cert.nameKo}을 선택하셨습니다. 발급하시겠습니까?`);
	};

	const handleConfirm = () => {
		setIsModalOpen(false);
		navigate("/verify", { state: { selectedCertificate: selectedCert } });
	};

	const handleCancel = () => {
		setIsModalOpen(false);
		setSelectedCert(null);
	};

	return (
		<Layout
			currentStep={2}
			modal={
				<Modal
					isOpen={isModalOpen}
					title="증명서 발급 확인"
					message={
						selectedCert
							? `${selectedCert.nameKo}\n수수료: ${selectedCert.fee != null ? selectedCert.fee.toLocaleString() + "원" : "무료"}`
							: ""
					}
					confirmLabel="발급"
					cancelLabel="취소"
					onConfirm={handleConfirm}
					onCancel={handleCancel}
					originGroup="certificate"
					originTabindex={modalOriginTabindex.current}
				/>
			}
		>
			<PageWrapper>
				<Title>발급을 원하시는 증명서를 선택해주십시오.</Title>

				<ViewToggle>
					<ToggleBtn
						$isActive={viewMode === "category"}
						onClick={() => {
							setViewMode("category");
							setSearchQuery("");
						}}
						data-tabfocus="Y"
						data-tabgroup="certificate"
						tabIndex={40}
						data-ttsmsg="카테고리 검색."
						aria-pressed={viewMode === "category"}
					>
						카테고리 검색
					</ToggleBtn>
					<ToggleBtn
						$isActive={viewMode === "search"}
						onClick={() => {
							setViewMode("search");
							setSearchQuery("");
						}}
						data-tabfocus="Y"
						data-tabgroup="certificate"
						tabIndex={41}
						data-ttsmsg="명칭 검색."
						aria-pressed={viewMode === "search"}
					>
						명칭 검색
					</ToggleBtn>
				</ViewToggle>

				{viewMode === "category" && (
					<ContentArea>
						<CategoryTabs
							categories={categories}
							activeCategory={activeCategory}
							onSelect={(cat) => {
								setActiveCategory(cat);
								if (ttsEnabled) {
									setTimeout(
										() =>
											fm.initTabFocusWhenReady(
												document,
												"certificate",
												0,
											),
										50,
									);
								}
							}}
						/>
						{isLoading ? (
							<LoadText role="status">불러오는 중...</LoadText>
						) : (
							<CertGrid role="list">
								{displayed.map((cert, idx) => (
									<li key={cert.id}>
										<CertItem
											onClick={() =>
												handleCertSelect(cert, idx)
											}
											data-tabfocus="Y"
											data-tabgroup="certificate"
											tabIndex={idx}
											data-ttsmsg={`${cert.nameKo}. 수수료 ${cert.fee ? cert.fee.toLocaleString() + "원" : "무료"}. 선택하려면 확인을 누르세요.`}
											aria-label={cert.nameKo}
										>
											<ItemName>{cert.nameKo}</ItemName>
											{cert.fee != null && (
												<ItemFee>
													{cert.fee.toLocaleString()}
													원
												</ItemFee>
											)}
										</CertItem>
									</li>
								))}
								{displayed.length === 0 && (
									<EmptyText role="status">
										검색된 결과가 없습니다.
									</EmptyText>
								)}
							</CertGrid>
						)}
					</ContentArea>
				)}

				{viewMode === "search" && (
					<ContentArea>
						<KeyboardInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="증명서명을 입력하세요"
						/>
						{searchQuery.trim() && (
							<CertGrid role="list">
								{displayed.map((cert, idx) => (
									<li key={cert.id}>
										<CertItem
											onClick={() =>
												handleCertSelect(cert, idx)
											}
											data-tabfocus="Y"
											data-tabgroup="certificate"
											tabIndex={idx}
											data-ttsmsg={`${cert.nameKo}. 선택하려면 확인을 누르세요.`}
										>
											<ItemName>{cert.nameKo}</ItemName>
										</CertItem>
									</li>
								))}
								{displayed.length === 0 && (
									<EmptyText>
										검색된 결과가 없습니다.
									</EmptyText>
								)}
							</CertGrid>
						)}
					</ContentArea>
				)}
			</PageWrapper>
		</Layout>
	);
};

export default CertificateSelectPage;

const PageWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 18px;
	height: 100%;
	min-height: 0;
`;
const Title = styled.h1`
	font-size: var(--font-size-xl);
	font-weight: 700;
	color: var(--text-primary);
	text-align: center;
	flex-shrink: 0;
`;
const ViewToggle = styled.div`
	display: flex;
	gap: 8px;
	flex-shrink: 0;
`;
const ToggleBtn = styled.button<{ $isActive: boolean }>`
	padding: 8px 18px;
	border-radius: var(--radius-md);
	border: 1.5px solid
		${({ $isActive }) =>
			$isActive ? "var(--accent-blue)" : "var(--border-default)"};
	background-color: ${({ $isActive }) =>
		$isActive ? "rgba(74,144,217,0.15)" : "transparent"};
	color: ${({ $isActive }) =>
		$isActive ? "var(--text-primary)" : "var(--text-secondary)"};
	font-size: var(--font-size-base);
	font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};
	transition: all var(--transition);
	&:hover {
		border-color: var(--accent-blue);
		color: var(--text-primary);
	}
	&:focus-visible {
		outline: 3px solid var(--border-focus);
		outline-offset: 2px;
	}
`;
const ContentArea = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	flex: 1;
	min-height: 0; /* ← zoom 시 스크롤 허용 */
	overflow-y: auto;
	scrollbar-width: none;
	&::-webkit-scrollbar {
		display: none;
	}
`;
const CertGrid = styled.ul`
	list-style: none;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 8px;
`;
const CertItem = styled.button`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4px;
	padding: 16px 10px;
	border-radius: var(--radius-md);
	border: 1.5px solid var(--border-default);
	background-color: var(--bg-card);
	color: var(--text-primary);
	font-size: var(--font-size-base);
	text-align: center;
	transition: all var(--transition);
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
	font-size: 11px;
	color: var(--text-muted);
`;
const EmptyText = styled.p`
	text-align: center;
	color: var(--text-muted);
	padding: 28px 0;
	grid-column: 1/-1;
`;
const LoadText = styled.p`
	color: var(--text-muted);
	text-align: center;
	padding: 28px 0;
`;

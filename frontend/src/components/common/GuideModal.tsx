import { useEffect } from "react";
import styled from "styled-components";
import { useFocusManagerContext } from "../../context/FocusManagerContext";
import { useAccessibility } from "../../context/AccessibilityContext";
import { speakSafe } from "../../utils/speakSafe";

interface GuideModalProps {
	isOpen: boolean;
	onClose: () => void;
	originGroup?: string;
	originTabindex?: number;
}

const KEYBOARD_ITEMS = [
	{ icon: "⊕", key: "방향키 ↑ ↓ ← →", desc: "목록 내 항목 이동" },
	{ icon: "O", key: "확인", desc: "선택한 항목 실행" },
];

const ACCESS_ITEMS = [
	{
		icon: "🔊",
		title: "음성 안내",
		desc: '하단 "음성 켜기"를 누르면 화면 내용을 음성으로 안내하고 가상 키패드가 활성화됩니다.',
	},
	{
		icon: "🔍",
		title: "화면 확대",
		desc: '"화면 확대" 버튼을 누르면 글씨가 커집니다. 다시 누르면 원래 크기로 돌아옵니다.',
	},
	{
		icon: "⌨",
		title: "키패드",
		desc: "음성 모드 활성화 시 나타납니다. 방향키·확인·취소·숫자를 입력할 수 있습니다.",
	},
];

const STEPS = ["언어·메뉴 선택", "증명서 선택", "본인 확인", "발급 완료"];

const GuideModal = ({
	isOpen,
	onClose,
	originGroup,
	originTabindex = 0,
}: GuideModalProps) => {
	const fm = useFocusManagerContext();
	const { ttsEnabled } = useAccessibility(); // ← 직접 사용

	useEffect(() => {
		if (isOpen) {
			if (!ttsEnabled) return; // TTS 꺼져 있으면 포커스 관리 안 함

			fm.initTabGroup(document, "guide-modal", {
				tabRotation: false,
				playTtsOnMoved: true,
			});
			speakSafe(
				"이용 안내입니다. 키보드 사용법과 접근성 기능을 안내해드립니다.",
			);
			setTimeout(
				() => fm.initTabFocusWhenReady(document, "guide-modal", 0),
				800,
			);
		} else {
			if (!ttsEnabled || !originGroup) return;
			setTimeout(
				() =>
					fm.moveTabFocusManual(
						document,
						originGroup,
						originTabindex,
					),
				100,
			);
		}
	}, [isOpen]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") onClose();
	};

	if (!isOpen) return null;

	return (
		<Overlay
			role="dialog"
			aria-modal="true"
			aria-label="이용 안내"
			onKeyDown={handleKeyDown}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<ModalBox>
				<Header>
					<Title>이용 안내</Title>
				</Header>
				<Body>
					<Section>
						<STitle>키보드 사용법</STitle>
						<KeyGrid>
							{KEYBOARD_ITEMS.map(({ icon, key, desc }) => (
								<KeyItem key={key}>
									<KeyIcon>{icon}</KeyIcon>
									<KeyContent>
										<KeyLabel>{key}</KeyLabel>
										<KeyDesc>{desc}</KeyDesc>
									</KeyContent>
								</KeyItem>
							))}
						</KeyGrid>
					</Section>
					<Divider />
					<Section>
						<STitle>접근성 기능</STitle>
						<AList>
							{ACCESS_ITEMS.map(({ icon, title, desc }) => (
								<AItem key={title}>
									<AIcon>{icon}</AIcon>
									<AContent>
										<ATitle>{title}</ATitle>
										<ADesc>{desc}</ADesc>
									</AContent>
								</AItem>
							))}
						</AList>
					</Section>
					<Divider />
					<Section>
						<STitle>이용 절차</STitle>
						<StepRow>
							{STEPS.map((s, i) => (
								<StepItem key={s}>
									<StepNum>{i + 1}</StepNum>
									<StepText>{s}</StepText>
									{i < STEPS.length - 1 && <Arrow>→</Arrow>}
								</StepItem>
							))}
						</StepRow>
					</Section>
				</Body>
				<Footer>
					<ConfirmBtn
						onClick={onClose}
						data-tabfocus="Y"
						data-tabgroup="guide-modal"
						tabIndex={0}
						data-ttsmsg="확인. 이용 안내를 닫습니다."
						aria-label="확인"
					>
						확인
					</ConfirmBtn>
				</Footer>
			</ModalBox>
		</Overlay>
	);
};

export default GuideModal;

const Overlay = styled.div`
	position: absolute;
	inset: 0;
	background-color: rgba(0, 0, 0, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 200;
`;
const ModalBox = styled.div`
	background-color: var(--bg-card);
	border: 1.5px solid var(--border-active);
	border-radius: var(--radius-lg);
	width: min(520px, 92%);
	max-height: 80%;
	overflow-y: hidden;
	display: flex;
	flex-direction: column;
	scrollbar-width: none;
	&::-webkit-scrollbar {
		display: none;
	}
`;
const Header = styled.div`
	padding: 16px 20px 12px;
	border-bottom: 1px solid var(--border-default);
	position: sticky;
	top: 0;
	background-color: var(--bg-card);
	z-index: 1;
`;
const Title = styled.h2`
	font-size: var(--font-size-xl);
	font-weight: 700;
	color: var(--text-primary);
	text-align: center;
`;
const Body = styled.div`
	padding: 16px 20px;
	display: flex;
	flex-direction: column;
	gap: 16px;
`;
const Section = styled.section`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;
const STitle = styled.h3`
	font-size: 13px;
	font-weight: 700;
	color: var(--text-secondary);
	letter-spacing: 0.5px;
`;
const KeyGrid = styled.ul`
	list-style: none;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 8px;
`;
const KeyItem = styled.li`
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 12px;
	border-radius: var(--radius-md);
	background-color: var(--bg-secondary);
	border: 1px solid var(--border-default);
`;
const KeyIcon = styled.div`
	width: 32px;
	height: 32px;
	border-radius: var(--radius-sm);
	background-color: var(--bg-button);
	border: 1.5px solid var(--border-active);
	color: var(--accent-blue);
	font-size: 15px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
`;
const KeyContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
`;
const KeyLabel = styled.span`
	font-size: 12px;
	font-weight: 700;
	color: var(--text-primary);
`;
const KeyDesc = styled.span`
	font-size: 11px;
	color: var(--text-muted);
`;
const AList = styled.ul`
	list-style: none;
	display: flex;
	flex-direction: column;
	gap: 8px;
`;
const AItem = styled.li`
	display: flex;
	align-items: flex-start;
	gap: 12px;
	padding: 12px 14px;
	border-radius: var(--radius-md);
	background-color: var(--bg-secondary);
	border: 1px solid var(--border-default);
`;
const AIcon = styled.span`
	font-size: 20px;
	flex-shrink: 0;
	margin-top: 2px;
`;
const AContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 3px;
`;
const ATitle = styled.span`
	font-size: 14px;
	font-weight: 700;
	color: var(--text-primary);
`;
const ADesc = styled.span`
	font-size: 12px;
	color: var(--text-secondary);
	line-height: 1.5;
`;
const StepRow = styled.ul`
	list-style: none;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 6px;
`;
const StepItem = styled.li`
	display: flex;
	align-items: center;
	gap: 6px;
`;
const StepNum = styled.div`
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background-color: var(--accent-blue);
	color: var(--text-primary);
	font-size: 12px;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: center;
`;
const StepText = styled.span`
	font-size: 13px;
	color: var(--text-primary);
`;
const Arrow = styled.span`
	color: var(--text-muted);
	font-size: 13px;
`;
const Divider = styled.hr`
	border: none;
	border-top: 1px solid var(--border-default);
	margin: 0;
`;
const Footer = styled.div`
	padding: 12px 20px 16px;
	border-top: 1px solid var(--border-default);
`;
const ConfirmBtn = styled.button`
	width: 100%;
	padding: 13px;
	border-radius: var(--radius-md);
	background-color: var(--accent-blue);
	border: 1.5px solid var(--accent-blue);
	color: var(--text-primary);
	font-size: var(--font-size-base);
	font-weight: 700;
	transition: all var(--transition);
	&:hover {
		background-color: #3a7bc8;
	}
	&:focus-visible {
		outline: 3px solid var(--border-focus);
		outline-offset: 2px;
	}
`;

import { useEffect } from "react";
import styled from "styled-components";
import { useFocusManagerContext } from "../../context/FocusManagerContext";
import { useAccessibility } from "../../context/AccessibilityContext";
import { speakSafe } from "../../utils/speakSafe";

interface ModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
	originGroup?: string;
	originTabindex?: number;
}

const Modal = ({
	isOpen,
	title,
	message,
	confirmLabel = "발급",
	cancelLabel = "취소",
	onConfirm,
	onCancel,
	originGroup,
	originTabindex = 0,
}: ModalProps) => {
	const fm = useFocusManagerContext();
	const { ttsEnabled } = useAccessibility(); // ← fm.isActive() 대신 직접 사용

	useEffect(() => {
		if (isOpen) {
			// TTS 꺼져 있으면 포커스 관리 전혀 하지 않음
			if (!ttsEnabled) return;

			fm.initTabGroup(document, "modal", {
				tabRotation: true,
				playTtsOnMoved: true,
			});
			speakSafe(
				`${title}. ${message}. ${confirmLabel} 또는 ${cancelLabel}을 선택하세요.`,
			);
			setTimeout(
				() => fm.initTabFocusWhenReady(document, "modal", 0),
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
		if (e.key === "Escape") {
			onCancel();
			return;
		}
		if (e.key === "Tab" && ttsEnabled) {
			e.preventDefault();
			fm.moveByCurrentGroup(e.shiftKey ? "UP" : "DOWN");
		}
	};

	if (!isOpen) return null;

	return (
		<Overlay
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			aria-describedby="modal-msg"
			onKeyDown={handleKeyDown}
			onClick={(e) => {
				if (e.target === e.currentTarget) onCancel();
			}}
		>
			<Box>
				<ModalTitle id="modal-title">{title}</ModalTitle>
				<ModalMsg id="modal-msg">{message}</ModalMsg>
				<BtnRow>
					<ConfirmBtn
						onClick={onConfirm}
						data-tabfocus="Y"
						data-tabgroup="modal"
						tabIndex={0}
						data-ttsmsg={`${confirmLabel}. ${confirmLabel}을 진행합니다.`}
						aria-label={confirmLabel}
					>
						{confirmLabel}
					</ConfirmBtn>
					<CancelBtn
						onClick={onCancel}
						data-tabfocus="Y"
						data-tabgroup="modal"
						tabIndex={1}
						data-ttsmsg={`${cancelLabel}. 취소합니다.`}
						aria-label={cancelLabel}
					>
						{cancelLabel}
					</CancelBtn>
				</BtnRow>
			</Box>
		</Overlay>
	);
};

export default Modal;

const Overlay = styled.div`
	position: absolute;
	inset: 0;
	background-color: rgba(0, 0, 0, 0.65);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
`;

const Box = styled.div`
	background-color: var(--bg-card);
	border: 1.5px solid var(--border-active);
	border-radius: var(--radius-lg);
	padding: 28px 32px;
	width: min(400px, 88%);
	text-align: center;
`;

const ModalTitle = styled.h2`
	font-size: var(--font-size-xl);
	font-weight: 700;
	color: var(--text-primary);
	margin-bottom: 10px;
`;

const ModalMsg = styled.p`
	font-size: var(--font-size-base);
	color: var(--text-secondary);
	line-height: 1.6;
	margin-bottom: 24px;
	white-space: pre-line;
`;

const BtnRow = styled.div`
	display: flex;
	gap: 10px;
`;

const Base = styled.button`
	flex: 1;
	padding: 13px;
	border-radius: var(--radius-md);
	font-size: var(--font-size-base);
	font-weight: 600;
	transition: all var(--transition);
	&:focus-visible {
		outline: 3px solid var(--border-focus);
		outline-offset: 2px;
	}
`;

const ConfirmBtn = styled(Base)`
	background-color: var(--accent-blue);
	border: 1.5px solid var(--accent-blue);
	color: var(--text-primary);
	&:hover {
		background-color: #3a7bc8;
	}
`;

const CancelBtn = styled(Base)`
	background-color: transparent;
	border: 1.5px solid var(--border-default);
	color: var(--text-secondary);
	&:hover {
		background-color: var(--bg-button-hover);
		color: var(--text-primary);
	}
`;

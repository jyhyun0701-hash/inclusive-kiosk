import styled from "styled-components";

interface BreadcrumbProps {
	currentStep: 1 | 2 | 3 | 4;
}

const STEPS = [
	{ step: 1, label: "메뉴 선택" },
	{ step: 2, label: "증명서 선택" },
	{ step: 3, label: "본인 확인" },
	{ step: 4, label: "발급" },
];

const Breadcrumb = ({ currentStep }: BreadcrumbProps) => {
	return (
		<Wrapper aria-label="진행 단계">
			<StepBar>
				{STEPS.map(({ step, label }, index) => {
					const isCompleted = step < currentStep;
					const isActive = step === currentStep;

					return (
						<StepWrapper key={step}>
							<StepItem
								$isActive={isActive}
								$isCompleted={isCompleted}
								aria-current={isActive ? "step" : undefined}
							>
								<StepNumber
									$isActive={isActive}
									$isCompleted={isCompleted}
								>
									{isCompleted ? "✓" : step}
								</StepNumber>
								<StepLabel
									$isActive={isActive}
									$isCompleted={isCompleted}
								>
									{label}
								</StepLabel>
							</StepItem>

							{/* 단계 사이 연결선 */}
							{index < STEPS.length - 1 && (
								<Connector $isCompleted={isCompleted} />
							)}
						</StepWrapper>
					);
				})}
			</StepBar>
		</Wrapper>
	);
};

export default Breadcrumb;

/* ===== Styled Components ===== */

const Wrapper = styled.nav`
	width: 100%;
	padding: 16px 24px;
	background-color: var(--bg-secondary);
	border-bottom: 1px solid var(--border-default);
`;

const StepBar = styled.ol`
	display: flex;
	align-items: center;
	list-style: none;
	max-width: 700px;
	margin: 0 auto;
`;

const StepWrapper = styled.li`
	display: flex;
	align-items: center;
	flex: 1;

	&:last-child {
		flex: 0;
	}
`;

const StepItem = styled.div<{ $isActive: boolean; $isCompleted: boolean }>`
	display: flex;
	align-items: center;
	gap: 8px;
	opacity: ${({ $isActive, $isCompleted }) =>
		$isActive || $isCompleted ? 1 : 0.45};
`;

const StepNumber = styled.span<{ $isActive: boolean; $isCompleted: boolean }>`
	width: 28px;
	height: 28px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 13px;
	font-weight: 700;
	flex-shrink: 0;
	transition:
		background-color var(--transition),
		border-color var(--transition);

	background-color: ${({ $isActive, $isCompleted }) =>
		$isCompleted
			? "var(--step-completed)"
			: $isActive
				? "var(--step-active)"
				: "transparent"};

	border: 2px solid
		${({ $isActive, $isCompleted }) =>
			$isCompleted
				? "var(--step-completed)"
				: $isActive
					? "var(--step-active)"
					: "var(--step-inactive)"};

	color: var(--text-primary);
`;

const StepLabel = styled.span<{ $isActive: boolean; $isCompleted: boolean }>`
	font-size: 13px;
	font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};
	color: ${({ $isActive }) =>
		$isActive ? "var(--text-primary)" : "var(--text-secondary)"};
	white-space: nowrap;
`;

const Connector = styled.div<{ $isCompleted: boolean }>`
	flex: 1;
	height: 2px;
	margin: 0 8px;
	background-color: ${({ $isCompleted }) =>
		$isCompleted ? "var(--step-completed)" : "var(--border-default)"};
	transition: background-color var(--transition);
`;

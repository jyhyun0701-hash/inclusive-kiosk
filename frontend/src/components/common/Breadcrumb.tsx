import styled from "styled-components";

interface BreadcrumbProps {
	currentStep: 1 | 2 | 3 | 4;
	title?: string;
}

const STEPS = [
	{ step: 1, label: "메뉴 선택" },
	{ step: 2, label: "증명서 선택" },
	{ step: 3, label: "본인 확인" },
	{ step: 4, label: "발급" },
];

const Breadcrumb = ({ currentStep, title }: BreadcrumbProps) => {
	return (
            <Wrapper aria-label="진행 단계">

                {/* ── 1행: 진행 단계 ── */}
                <StepRow>
                    <StepBar>
                        {STEPS.map(({ step, label }, index) => {
                            const isCompleted = step < currentStep;
                            const isActive    = step === currentStep;

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

                                    {index < STEPS.length - 1 && (
                                        <Connector $isCompleted={isCompleted} />
                                    )}
                                </StepWrapper>
                            );
                        })}
                    </StepBar>
                </StepRow>

                {/* ── 2행: 페이지 타이틀 ── */}
                <TitleRow>
                    <PageTitle aria-live="polite">{title}</PageTitle>
                </TitleRow>

            </Wrapper>
        );
    };

export default Breadcrumb;

/* ===== Styled Components ===== */

const Wrapper = styled.nav`
	width: 100%;
	background-color: var(--bg-secondary);
	border-bottom: 1px solid var(--border-default);
	flex-shrink: 0;
`;

/* ── 1행: 스텝 ── */
const StepRow = styled.div`
    display: flex;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-xl); /* 24px 64px */
`;

const StepBar = styled.ol`
	display: flex;
	align-items: center;
	list-style: none;
	width: 100%;
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
	gap: var(--spacing-sm);
	opacity: ${({ $isActive, $isCompleted }) =>
		$isActive || $isCompleted ? 1 : 0.4};
`;

const StepNumber = styled.span<{ $isActive: boolean; $isCompleted: boolean }>`
	width: 56px;
	height: 56px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: var(--font-size-sm);
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
    font-size: var(--font-size-xs);               /* 24px */
    font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};
    color: #ffffff;
    white-space: nowrap;
`;

const Connector = styled.div<{ $isCompleted: boolean }>`
    flex: 1;
    height: 3px;
    margin: 0 var(--spacing-md);                  /* 0 24px */
    background-color: ${({ $isCompleted }) =>
        $isCompleted ? "var(--step-completed)" : "var(--step-inactive)"};
    transition: background-color var(--transition);
`;

/* ── 2행: 타이틀 ── */
const TitleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg) var(--spacing-xl); /* 40px 64px */
`;

const PageTitle = styled.h1`
    font-size: var(--font-size-xl);               /* 52px */
    font-weight: 700;
    color: #ffffff;
    text-align: center;
    line-height: 1.4;
`;
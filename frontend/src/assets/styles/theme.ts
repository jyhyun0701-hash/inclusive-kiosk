// 키오스크 디자인 테마 변수
// 일반 모드 / 고대비 모드 두 가지를 CSS 변수로 관리

export const theme = {
	// 배경
	bgPrimary: "#1B2B5E", // 메인 네이비
	bgSecondary: "#162248", // 더 어두운 네이비 (카드 배경)
	bgCard: "#243470", // 카드/버튼 배경

	// 텍스트
	textPrimary: "#FFFFFF",
	textSecondary: "#B8C4E0",
	textMuted: "#7A8BB0",

	// 포인트 색상
	accentYellow: "#F5A623", // 화면확대 버튼 노란색
	accentBlue: "#4A90D9", // 선택된 버튼 파란색
	accentGreen: "#27AE60", // 성공 상태

	// 테두리
	borderDefault: "#2E4080",
	borderActive: "#4A90D9",

	// 단계 진행 바
	stepActive: "#4A90D9",
	stepCompleted: "#27AE60",
	stepInactive: "#2E4080",
};

// 고대비 모드 오버라이드 값 (CSS class .high-contrast 에서 사용)
// global.css 에서 CSS 변수로 정의

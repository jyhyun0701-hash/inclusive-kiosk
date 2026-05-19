# 접근성 키오스크 시스템 (Inclusive Kiosk)

> 교통약자를 포함한 모든 사용자가 도움 없이 이용할 수 있는 접근성 중심 무인 민원 발급 키오스크

<br>

## 프로젝트 소개
기존 키오스크의 접근성 한계를 개선하여 시각장애인, 지체장애인, 고령자 등  
교통약자가 독립적으로 민원서류를 발급받을 수 있는 키오스크 시스템입니다.

실무에서 항공사 키오스크 접근성 기능을 직접 개발한 경험을 바탕으로,  
실제 사용자 환경에서 발생하는 문제를 해결하는 방향으로 설계했습니다.

<br>

## ‍개발 기간 및 인원
개발 기간 : 2025.04 ~ 진행중 
인원 : 개인 프로젝트 (1인) 
역할 : 기획 /  프로트엔트 / 백엔드 전체 

<br>

## 기술 스택
- Frontend: React, TypeScript
- Backend: Java 17, Spring Boot 3, JPA
- Database: PostgreSQL
- API: REST API
- 버전 관리: Git, GitHub

<br>

## 시스템 아키텍쳐
[React + TypeScript]
        │
        │  REST API (HTTP)
        ▼
[Spring Boot 서버]
        │
        │  JPA / Hibernate
        ▼
[PostgreSQL]

<br>

## 프로젝트 구조
frontend/
├── src/
│   ├── components/       # 공통 컴포넌트
│   ├── pages/            # 화면별 페이지
│   ├── hooks/
│   │   └── useTTS.ts     # TTS 음성 안내 커스텀 훅
│   ├── styles/           # 전역 스타일 
│   └── utils/            # 포커스 관리 등 공통 유틸

backend/
├── src/main/java/
│   ├── controller/       # REST API 엔드포인트
│   ├── service/          # 비즈니스 로직
│   ├── entity/           # JPA 엔티티
│   ├── dto/              # 요청·응답 DTO
│   └── repository/       # DB 접근 계층

## 주요 기능
### 1. TTS 음성 안내 시스템
- `window.speechSynthesis` 기반 한국어 음성 안내
- 음성 켜기/끄기 토글 지원
- Chrome autoplay 정책 및 음성 중복 발화 문제 해결
- 화면 전환 시 자동 안내 재생
### 2. 키패드 기반 포커스 네비게이션
- 키패드만으로 전체 화면 조작 가능
- 포커스 스택 구조로 팝업/레이어 진입·복귀 시 포커스 자동 복원
- 동적 렌더링 환경에서도 안정적인 포커스 이동 처리
### 3. 접근성 모드 (화면 확대)
- 화면 확대 모드: UI 전체 스케일 확대 (CSS 기반, 레이아웃 유지)
- 일반 모드와 접근성 모드 간 실시간 전환
### 4. 헤드셋 연결 기반 자동 전환
- 헤드셋 연결 감지 시 접근성 모드 자동 활성화
- 연결 해제 시 일반 모드로 자동 복귀
### 5. 민원서류 발급 (백엔드 연동)
- 주민등록등본, 초본, 가족관계증명서 등 발급 신청 API
- Spring Boot REST API + JPA + PostgreSQL 구성

<br>

## 트러블슈팅
### 1. 동적 렌더링 환경에서 포커스 이동 문제
- **문제**: 화면 전환 시 DOM이 아직 렌더링되지 않은 상태에서 포커스 이동 시도 → 포커스가 예상과 다르게 이동하거나 소실
- **원인**: React의 비동기 렌더링 특성상 상태 업데이트 후 DOM 반영까지 시차 존재
- **해결**: `setTimeout` + 렌더링 완료 시점 체크로 실행 시점 제어, 포커스 스택 구조 설계로 레이어 진입·복귀 시 포커스 복원

### 2. TTS 중복 발화 문제ㄴ
- **문제**: 빠른 화면 전환 시 이전 음성과 다음 음성이 겹쳐 재생되어 사용자 경험 저하
- **원인**: 이전 utterance가 완료되기 전 새 `speak()` 호출
- **해결**: `speak()` 호출 전 `cancel()` 강제 실행 + 150ms 딜레이로 Chrome 내부 상태 초기화

### 3. Chrome speechSynthesis 무음 버그
- **문제**: 특정 상황에서 에러 없이 TTS가 완전히 동작하지 않는 현상 발생 (브라우저 재시작 후에도 지속)
- **원인**: Chrome의 `speechSynthesis` 내부 상태가 stuck 상태로 고착화, 음성 목록 비동기 로딩 타이밍 문제
- **해결**: `onvoiceschanged` 이벤트로 음성 목록 사전 로드, `cancel()` + 딜레이 패턴을 커스텀 훅(`useTTS.ts`)으로 추상화하여 일관된 호출 보장

<br>

## 실행 방법

### 백엔드
bash
cd backend
./gradlew bootRun
# 기본 포트: http://localhost:8080

### 프론트엔드
bash
cd frontend
npm install
npm start
# 기본 포트: http://localhost:5173

### 환경 변수 설정 (backend/src/main/resources/application.yml)
yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/kiosk_db
    username: postgres
    password: 
    driver-class-name: org.postgresql.Driver

<br>

## 향후 개선 계획
- [ ] TTS 다국어 지원 (영어 · 일본어 · 중국어)
- [ ] 관리자 대시보드 (발급 이력 통계)
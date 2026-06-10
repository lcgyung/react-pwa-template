# Changelog

이 프로젝트의 주요 변경 사항을 기록합니다. 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를
따르고, 버전은 [Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [0.1.0] - 2026-06-10

### Added

- 보일러플레이트 최초 구성 (React + TypeScript + Vite 기반 PWA 템플릿).
- PWA 코어: 설치형(홈 화면 추가) · 오프라인 캐싱 · Service Worker · `registerType: 'prompt'` 자동 업데이트 알림(`PWABadge`).
- UI: Shadcn/UI + Tailwind CSS v4(CSS-first) · 다크 모드(class 전략, persist) · `lucide-react` · `sonner` 토스트.
- 인증 & RBAC: 로그인/로그아웃, 토큰 persist, `ProtectedRoute`/`RoleRoute` 가드, 역할(`admin`/`manager`/`user`) 기반 메뉴·라우트 제어.
- 데이터 레이어: Axios API 레이어(인터셉터 토큰 주입·401 처리, 인증 브리지 옵션 B) + React Query 서버 상태 관리.
- 상태/폼: Zustand 전역 상태(persist) · React Hook Form + Zod 검증.
- 목 API: MSW(개발/테스트) — 백엔드 없이 즉시 동작.
- 아키텍처: Feature-Sliced Design 6레이어 + Steiger 경계 하드 강제.
- 품질/인프라: Vitest + Testing Library · Storybook · Docker(nginx) · GitHub Actions CI(lint → lint:fsd → test → build).

### Notes

- 초기 버전으로 구조/API가 변경될 수 있습니다.

# Changelog

이 프로젝트의 주요 변경 사항을 기록합니다. 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를
따르고, 버전은 [Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [0.1.0] - 2026-06-12

react-admin-template 파리티에 도달한 첫 공개 릴리스 — React + TypeScript + Vite 기반 PWA(설치형·오프라인) 템플릿. 데이터 레이어·보안·PWA·CI 하네스를 모두 갖췄습니다.

### Added

- 보일러플레이트 최초 구성 (React + TypeScript + Vite 기반 PWA 템플릿).
- PWA 코어: 설치형(홈 화면 추가) · 오프라인 캐싱 · Service Worker · `registerType: 'prompt'` 자동 업데이트 알림(`PWABadge`) · 설치 프롬프트(`features/pwa-install`, `beforeinstallprompt` 캡처) · 오프라인 폴백 페이지(`public/offline.html`) · 교차 출처 에셋 workbox 런타임 캐싱.
- UI: Shadcn/UI + Tailwind CSS v4(CSS-first) · 다크 모드(class 전략, persist) · `lucide-react` · `sonner` 토스트.
- 인증 & RBAC: 로그인/로그아웃, 토큰 persist, `ProtectedRoute`/`RoleRoute` 가드, 역할(`admin`/`manager`/`user`) 기반 메뉴·라우트 제어 · 로그인 후 캡처된 경로로 복귀(redirect-back).
- 데이터 레이어: Axios API 레이어(인터셉터 토큰 주입·401 처리, 인증 브리지 옵션 B) + React Query 서버 상태 관리 · API 타입 코드젠 **orval** 도입(OpenAPI 스펙 `openapi/pwa-api.yaml` → 타입 생성·커밋, `pnpm gen:api`, [ADR-0006](docs/adr/0006-api-types-orval.md)).
- React Query 오프라인 persist: localStorage 캐시 복원 · 앱 버전(`__APP_VERSION__`) buster · 세션 의존 쿼리 `meta: { persist: false }` 옵트아웃([ADR-0007](docs/adr/0007-react-query-offline-persist.md)).
- 상태/폼: Zustand 전역 상태(persist) · React Hook Form + Zod 검증 · 환경 변수 검증(부팅 시 Zod 로 `VITE_*` 조기 검증, `shared/config/env.ts`).
- web-vitals 수집(옵트인): `VITE_WEB_VITALS_ENDPOINT` 설정 시 CWV 를 sendBeacon 으로 전송 — 동적 import 라 메인 번들 미포함.
- 목 API: MSW(개발/테스트) — 백엔드 없이 즉시 동작.
- 아키텍처: Feature-Sliced Design 6레이어 + Steiger 경계 하드 강제 · 라우트 에러 바운더리(접근성 폴백) · 라우트 페이지 lazy-load(Suspense) · 슬라이스 생성기(`pnpm gen:slice`, plop).
- 품질/인프라: Vitest + Testing Library · Storybook · Docker(nginx) · Playwright E2E(로그인 스모크·오프라인 시나리오) · 번들 분석 옵션(`pnpm build:analyze`) · 검증 게이트(`pnpm verify` typecheck·lint·format:check·test·lint:fsd / `pnpm verify:full` +build).

### Changed

- 런타임 타깃을 **Node 24** 로 설정(`.nvmrc`·`engines.node`·CI·Dockerfile 동기화).
- 하네스 문서 계층화: 얇은 `CLAUDE.md`(지도+불변 경고) + `.claude/rules/` 단일 소유 구조 · 파일 컨벤션을 react-admin-template 과 정렬 · clean-code 게이트 일원화 · plan 모드에서 Stop 게이트(`gate.sh`) 스킵.
- 출력 언어 한글 통일: Claude Code 응답·커밋·PR 을 한글로 작성(정본 `CLAUDE.md`, `session-context.sh` 매 세션 보강, CONTRIBUTING 예시 한글화).
- 프로덕션 빌드에서 `console.log`/`debugger` 제거(`console.error` 유지).

### Security

- CSP·보안 헤더(nginx, [ADR-0005](docs/adr/0005-csp-and-security-headers.md)) · 로그아웃 시 Cache Storage·IndexedDB 정리.
- SCA: gitleaks 시크릿 스캔 · `pnpm audit` + OSV 스캐너 · dist 시크릿 grep · SBOM(CycloneDX) 생성.
- security eslint 플러그인(`no-unsanitized`·`security`) flat config 연동 · [`SECURITY.md`](SECURITY.md) + 위협 모델.

### CI / Infra

- GitHub Actions: Lighthouse CI(a11y/best-practices/seo) · E2E 잡 · CODEOWNERS.
- Dependabot: 월간 스케줄 + cooldown·peer-family·prod/dev 그룹화 · 메이저 그룹 7개로 통합 + dev-경유 불변식 명문화.
- 설계 결정 문서화: ADR 0002~0007 · `docs/shadcn-components.md`.

### Notes

- 초기 버전으로 구조/API가 변경될 수 있습니다.

# 하네스 엔지니어링 체크리스트 — React + shadcn/ui + PWA (App)

> 프론트엔드(PWA 앱) 프로젝트 단독 셋업 기준. 공통 기반 + shadcn/ui · PWA 특화 항목을 모두 포함합니다.
> 우선순위: 🔴 필수 · 🟡 권장 · 🟢 선택

---

## 1. 컨텍스트 레이어

- [ ] 🔴 `CLAUDE.md` (또는 `AGENTS.md`) — 빌드·테스트·실행 명령, 컴포넌트 컨벤션, "하지 말 것"
- [ ] 🔴 `README` + 화면/라우팅 구조 + PWA 동작 개요
- [ ] 🟡 `docs/adr/` — 상태관리·캐싱·오프라인 전략 결정 기록
- [ ] 🟡 컴포넌트 디렉터리 규칙

## 2. 빌드 & 피드백 루프

- [ ] 🔴 Vite (+ SWC)
- [ ] 🔴 ESLint + Prettier
- [ ] 🔴 `tsconfig` `strict: true`
- [ ] 🔴 단일 명령으로 `lint` / `typecheck` / `test` / `build`
- [ ] 🔴 Vitest + React Testing Library
- [ ] 🔴 MSW — API 모킹 (백엔드 없이 개발·테스트)
- [ ] 🟡 E2E (Playwright)
- [ ] 🟡 watch 모드 (HMR + test watch)
- [ ] 🟢 번들 분석 (rollup-plugin-visualizer)

## 3. 디자인 시스템 (shadcn/ui + Tailwind)

- [ ] 🔴 Vite + Tailwind + shadcn/ui (`components.json` 설정)
- [ ] 🔴 Tailwind 디자인 토큰 / 테마 (CSS 변수)
- [ ] 🔴 `cn()` 유틸 (clsx + tailwind-merge)
- [ ] 🟡 다크모드 (CSS 변수 기반 테마 스위칭)
- [ ] 🟡 `eslint-plugin-tailwindcss` — 클래스 정렬/검증
- [ ] 🟡 shadcn 컴포넌트 버전 추적 — 복사 기반이라 업데이트 수동 관리
- [ ] 🟢 컴포넌트 카탈로그 (Storybook, 선택)

## 4. 코드 품질 / 데이터 흐름

- [ ] 🔴 API 타입/클라이언트 자동 생성 소비 (orval) — 수동 fetch 타이핑 금지
- [ ] 🔴 폼: react-hook-form + zod
- [ ] 🔴 서버 상태 관리 (TanStack Query 등) — 오프라인 캐싱과 연계
- [ ] 🟡 라우팅 + 코드 스플리팅 (lazy import)
- [ ] 🟡 에러 바운더리 + 폴백 UI

## 5. PWA 핵심

- [ ] 🔴 `vite-plugin-pwa` (+ Workbox)
- [ ] 🔴 `manifest.json` — 아이콘 세트, `theme_color`, `display: standalone`
- [ ] 🔴 서비스 워커 캐싱 전략 (precache + runtime caching)
- [ ] 🔴 로컬 개발 HTTPS — 서비스 워커 요구사항
- [ ] 🟡 오프라인 폴백 페이지
- [ ] 🟡 SW 업데이트 흐름 — 새 버전 감지 → 사용자 리로드 안내
- [ ] 🟡 설치 프롬프트 처리 (`beforeinstallprompt`)
- [ ] 🟢 푸시 알림
- [ ] 🟢 백그라운드 동기화 (오프라인 큐)

## 6. 환경 / 보안

- [ ] 🔴 `.env.example` + 빌드타임 환경변수 검증
- [ ] 🔴 `.nvmrc` / Volta — Node 버전 고정 + lockfile 커밋
- [ ] 🔴 시크릿 스캔 (gitleaks)
- [ ] 🟡 의존성 취약점 스캔 + 업데이트 봇 (Renovate / Dependabot)

## 7. CI/CD & 품질 게이트

- [ ] 🔴 husky + lint-staged
- [ ] 🔴 PR 검증 워크플로 — lint · typecheck · test · build
- [ ] 🔴 Lighthouse CI — PWA · 성능 · 접근성 점수 임계값 게이트
- [ ] 🟡 오프라인 시나리오 E2E (네트워크 차단 후 동작 검증)
- [ ] 🟡 commitlint + Conventional Commits

## 8. 관찰가능성

- [ ] 🟡 에러 트래킹 (Sentry) — source map 업로드 포함
- [ ] 🟢 웹 바이탈 / 성능 모니터링

---

## 권장 셋업 순서

1. 컨텍스트(CLAUDE.md) + Vite + Tailwind/shadcn + lint/tsconfig + 단일 명령
2. 디자인 토큰(`cn()`, CSS 변수) + 다크모드
3. API 타입 자동 생성(orval) + TanStack Query + react-hook-form
4. Vitest/RTL + MSW
5. PWA (vite-plugin-pwa, manifest, SW 캐싱, HTTPS)
6. Lighthouse CI + 오프라인 E2E + 에러 트래킹

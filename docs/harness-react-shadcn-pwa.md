# 하네스 엔지니어링 체크리스트 — React + shadcn/ui + PWA (App)

> 프론트엔드(PWA 앱) 프로젝트 단독 셋업 기준. 공통 기반 + shadcn/ui · PWA 특화 항목을 모두 포함합니다.
> 우선순위: 🔴 필수 · 🟡 권장 · 🟢 선택
>
> 체크 표시는 이 리포의 현행 상태입니다(근거 병기). 미체크 항목은 의도된 보류 — 사유를 병기합니다.
>
> **이 문서는 규칙이 아니라 현행 상태 점검표입니다** — 작업 규칙은 [`.claude/rules/`](../.claude/rules/),
> 결정 배경은 [`docs/adr/`](adr/) 참고.

---

## 1. 컨텍스트 레이어

- [x] 🔴 `CLAUDE.md` (또는 `AGENTS.md`) — 빌드·테스트·실행 명령, 컴포넌트 컨벤션, "하지 말 것" — `CLAUDE.md` + `.claude/rules/`
- [x] 🔴 `README` + 화면/라우팅 구조 + PWA 동작 개요 — `README.md`
- [x] 🟡 `docs/adr/` — 상태관리·캐싱·오프라인 전략 결정 기록 — ADR 0001~0007
- [x] 🟡 컴포넌트 디렉터리 규칙 — FSD 6레이어(`CLAUDE.md`) + Steiger 하드 강제(`pnpm lint:fsd`)

## 2. 빌드 & 피드백 루프

- [x] 🔴 Vite (+ SWC) — `vite.config.ts`(@vitejs/plugin-react)
- [x] 🔴 ESLint + Prettier — `eslint.config.js` + husky/lint-staged
- [x] 🔴 `tsconfig` `strict: true` — + `noUnusedLocals/Parameters`
- [x] 🔴 단일 명령으로 `lint` / `typecheck` / `test` / `build` — `pnpm verify`(빌드 제외 고속) / `pnpm verify:full`(빌드 포함)
- [x] 🔴 Vitest + React Testing Library — `pnpm test`, 커버리지 ratchet(`vite.config.ts`)
- [x] 🔴 MSW — API 모킹 (백엔드 없이 개발·테스트) — `src/app/mocks/` + `vitest.setup.ts`
- [x] 🟡 E2E (Playwright) — `e2e/`(smoke + 오프라인), CI `e2e` 잡
- [x] 🟡 watch 모드 (HMR + test watch) — `pnpm dev` / `pnpm test:watch`
- [x] 🟢 번들 분석 (rollup-plugin-visualizer) — `pnpm build:analyze`

## 3. 디자인 시스템 (shadcn/ui + Tailwind)

- [x] 🔴 Vite + Tailwind + shadcn/ui (`components.json` 설정) — Tailwind v4 CSS-first
- [x] 🔴 Tailwind 디자인 토큰 / 테마 (CSS 변수) — `src/app/styles/index.css`
- [x] 🔴 `cn()` 유틸 (clsx + tailwind-merge) — `@/shared/lib/cn`
- [x] 🟡 다크모드 (CSS 변수 기반 테마 스위칭) — `features/theme`(class 전략)
- [x] 🟡 `eslint-plugin-tailwindcss` — 클래스 정렬/검증 — `eslint-plugin-better-tailwindcss`(검증) + `prettier-plugin-tailwindcss`(정렬)로 충족
- [x] 🟡 shadcn 컴포넌트 버전 추적 — 복사 기반이라 업데이트 수동 관리 — `docs/shadcn-components.md`
- [x] 🟢 컴포넌트 카탈로그 (Storybook, 선택) — `pnpm storybook`

## 4. 코드 품질 / 데이터 흐름

- [x] 🔴 API 타입/클라이언트 자동 생성 소비 (orval) — 수동 fetch 타이핑 금지 — `pnpm gen:api`(ADR-0006)
- [x] 🔴 폼: react-hook-form + zod — `features/*/model/*Schema.ts`
- [x] 🔴 서버 상태 관리 (TanStack Query 등) — 오프라인 캐싱과 연계 — RQ persist(localStorage, ADR-0007)
- [x] 🟡 라우팅 + 코드 스플리팅 (lazy import) — `src/app/router/router.tsx`(React.lazy + Suspense)
- [x] 🟡 에러 바운더리 + 폴백 UI — `AppProviders` + `shared/ui/ErrorFallback`

## 5. PWA 핵심

- [x] 🔴 `vite-plugin-pwa` (+ Workbox) — `vite.config.ts`
- [x] 🔴 `manifest.json` — 아이콘 세트, `theme_color`, `display: standalone` — 192/512(+maskable)
- [x] 🔴 서비스 워커 캐싱 전략 (precache + runtime caching) — ADR-0003(API 는 NetworkOnly)
- [x] 🔴 로컬 개발 HTTPS — 서비스 워커 요구사항 — **localhost 는 secure context 라 별도 인증서 불필요.** SW 검증은 `pnpm build && pnpm preview` 정책으로 충족(CLAUDE.md PWA 절)
- [x] 🟡 오프라인 폴백 페이지 — `navigateFallback: index.html` + `public/offline.html`
- [x] 🟡 SW 업데이트 흐름 — 새 버전 감지 → 사용자 리로드 안내 — `widgets/pwa-badge`(registerType: prompt)
- [x] 🟡 설치 프롬프트 처리 (`beforeinstallprompt`) — `features/pwa-install`
- [ ] 🟢 푸시 알림 — 보류: CLAUDE.md 로드맵 "파리티 이후"
- [ ] 🟢 백그라운드 동기화 (오프라인 큐) — 보류: CLAUDE.md 로드맵 "파리티 이후"

## 6. 환경 / 보안

- [x] 🔴 `.env.example` + 빌드타임 환경변수 검증 — `src/shared/config/env.ts`(zod)
- [x] 🔴 `.nvmrc` / Volta — Node 버전 고정 + lockfile 커밋 — Node 24(`.nvmrc`·engines·CI·Dockerfile)
- [x] 🔴 시크릿 스캔 (gitleaks) — pre-commit + CI(+dist 번들 grep)
- [x] 🟡 의존성 취약점 스캔 + 업데이트 봇 (Renovate / Dependabot) — `sca` 잡(pnpm audit + osv + SBOM) + Dependabot

## 7. CI/CD & 품질 게이트

- [x] 🔴 husky + lint-staged — + commitlint(commit-msg 훅)
- [x] 🔴 PR 검증 워크플로 — lint · typecheck · test · build — `.github/workflows/ci.yml` `build` 잡
- [x] 🔴 Lighthouse CI — PWA · 성능 · 접근성 점수 임계값 게이트 — `lighthouserc.json`(a11y/BP/SEO error 0.9 · perf warn; LH12 부터 PWA 카테고리 제거 — ADR-0003)
- [x] 🟡 오프라인 시나리오 E2E (네트워크 차단 후 동작 검증) — `e2e/offline.spec.ts`
- [x] 🟡 commitlint + Conventional Commits — `commitlint.config.js`

## 8. 관찰가능성

- [ ] 🟡 에러 트래킹 (Sentry) — source map 업로드 포함 — 보류: 외부 계정 필요, 백로그(현재는 ErrorBoundary 폴백만)
- [x] 🟢 웹 바이탈 / 성능 모니터링 — `shared/lib/reportWebVitals`(옵트인, `VITE_WEB_VITALS_ENDPOINT`)

---

## 권장 셋업 순서

1. 컨텍스트(CLAUDE.md) + Vite + Tailwind/shadcn + lint/tsconfig + 단일 명령
2. 디자인 토큰(`cn()`, CSS 변수) + 다크모드
3. API 타입 자동 생성(orval) + TanStack Query + react-hook-form
4. Vitest/RTL + MSW
5. PWA (vite-plugin-pwa, manifest, SW 캐싱, HTTPS)
6. Lighthouse CI + 오프라인 E2E + 에러 트래킹

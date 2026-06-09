# 작업 계획 — admin 수준 보일러플레이트 도달

> 상태: **계획 (미구현)** · 이 문서는 "문서만 있는 현재 상태 → react-admin-template 수준의
> 완성형 보일러플레이트"로 가는 단계별 작업 계획이다. 실제 애플리케이션 코드는 아직 없으며,
> 본 문서가 스캐폴딩의 청사진이다. 코드가 들어오는 단계마다 [`../CLAUDE.md`](../CLAUDE.md)와
> [`../README.md`](../README.md)도 함께 최신화한다.

## 목표

형제 템플릿 **react-admin-template** 과 동일한 아키텍처·도구·DX 수준에 도달하되, 차이는
UI 라이브러리와 PWA 레이어뿐인 **PWA 보일러플레이트**를 완성한다.

```
문서만(spec) → 스캐폴딩 → PWA 코어 → UI 기반 → 데이터 레이어 → 인증/RBAC → MSW → 테스트 → 인프라 → 문서 동기화
```

## 확정 결정 (기준)

| 항목          | 결정                              | 비고                                            |
| ------------- | --------------------------------- | ----------------------------------------------- |
| 패키지 매니저 | **pnpm**                          | admin과 통일 (명령/CI/Docker/workspace 보안설정) |
| UI            | **Shadcn/UI + Tailwind CSS**      | admin은 MUI — 이 부분이 핵심 차이                |
| 빌드/SW       | **vite-plugin-pwa**               | SW·매니페스트 자동 생성, PWA 차별점              |
| 목 API        | **MSW + 데모 계정 포함**          | 백엔드 없이 즉시 시연                            |
| 접근 제어     | **RBAC (admin/manager/user)**     | ProtectedRoute / RoleRoute                       |
| 테마          | **다크 모드 포함**                | themeStore + persist                            |
| 인프라        | **Storybook · Docker · CI 포함**  | admin과 동일 수준                               |

## 갭 분석 (현재 PWA vs admin)

| 영역             | PWA (현재) | admin (기준)        | 필요 작업                          |
| ---------------- | ---------- | ------------------- | ---------------------------------- |
| 소스 코드        | 없음       | 완성                | 전체 스캐폴딩 + 구현               |
| package.json/설정 | 없음       | 완비                | 생성 (Phase 0)                     |
| PWA(SW/매니페스트) | 없음       | 해당 없음           | vite-plugin-pwa 신규 (Phase 1)     |
| UI 라이브러리    | 없음       | MUI                 | Shadcn/UI + Tailwind 신규 (Phase 2) |
| 데이터 레이어    | 없음       | axios+RQ+Zustand    | 이식 (Phase 3)                     |
| 인증/RBAC        | 없음       | 완성                | 이식 (Phase 4)                     |
| MSW + 데모 계정  | 없음       | 완성                | 이식 (Phase 5)                     |
| 테스트           | 없음       | Vitest+TL+MSW       | 이식 (Phase 6)                     |
| Storybook/Docker/CI | 없음    | 완성                | 이식 (Phase 7)                     |

---

## 단계별 작업 계획

각 Phase는 독립적으로 검증 가능한 단위다. 가능한 한 react-admin-template 의 동일 파일을
복사 후 PWA에 맞게 수정하고(특히 UI는 MUI → Shadcn/UI 치환), 매 Phase 종료 시
`pnpm lint && pnpm test && pnpm build` 가 통과해야 다음으로 넘어간다.

### Phase 0 — 스캐폴딩 기반
- Vite + React 19 + TypeScript(strict) 프로젝트 초기화.
- `package.json` (pnpm), `pnpm-workspace.yaml`(`allowBuilds`/`onlyBuiltDependencies`: esbuild, msw).
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` + 경로 별칭 `@/*` → `src/*`
  (`vite.config.ts`에도 동일 별칭).
- ESLint flat config(`eslint.config.js`) + Prettier(`.prettierrc.json`, `.prettierignore`).
- Husky(`.husky/pre-commit` → `pnpm lint-staged`) + lint-staged 설정.
- `index.html`, `src/main.tsx`, `src/App.tsx`, `.env.example` / `.env.development` / `.env.production`.
- 참조: admin 의 `package.json`, `eslint.config.js`, `.prettierrc.json`, `tsconfig*.json`,
  `vite.config.ts`, `.husky/pre-commit`.
- **검증**: `pnpm dev`로 빈 앱 구동, `pnpm lint`/`pnpm build` 통과.

### Phase 1 — PWA 코어
- `vite-plugin-pwa` 설치 + `vite.config.ts` 플러그인 설정(`registerType`, manifest).
- `public/` 매니페스트 아이콘 192/512px + maskable, 테마 색상.
- 오프라인 폴백, 서비스 워커 업데이트 알림 컴포넌트/훅(`prompt` 사용 시 사용자 확인 UI).
- **검증**: `pnpm build && pnpm preview` 후 설치 프롬프트 노출, 오프라인 상태에서 앱 로드,
  업데이트 알림 동작 확인. (PWA는 `pnpm dev`로 검증 불가.)

### Phase 2 — UI 기반 (Shadcn/UI + Tailwind)
- Tailwind CSS 설정 + `src/styles` 엔트리 CSS, Shadcn/UI 초기화(컴포넌트 추가 규약).
- 모바일 우선 레이아웃: `layouts/AuthLayout`, `layouts/MainLayout` + `components/{Sidebar,Header}`.
- 다크 모드: `stores/themeStore`(light/dark, persist) + `providers/ThemeProvider`(Tailwind class 토글).
- 공용 컴포넌트(Loading, PageHeader 등)를 Shadcn/UI 기반으로 작성.
- 참조: admin 의 `layouts/*`, `providers/ThemeProvider.tsx`, `stores/themeStore.ts`
  (MUI → Shadcn/Tailwind 치환).
- **검증**: 다크/라이트 토글 + persist, 모바일 반응형 레이아웃.

### Phase 3 — 상태 / 데이터 레이어
- `api/axiosInstance.ts`: 요청 인터셉터(토큰 주입) + 응답 인터셉터(401 → 인증 초기화 → `/login`).
- `api/{auth,users}.ts`: 도메인 요청 함수.
- `stores/authStore.ts`: token/user(persist) + `getAuthToken()` / `clearAuthState()` 헬퍼.
- `providers/{AppProviders,QueryProvider}.tsx`: React Query Client.
- `hooks/{useAuth,useUsers}.ts`: useLogin/useLogout/useMe/useUsers.
- `schemas/{auth,user}.ts`(Zod), `types/{auth,user,common}.ts`.
- 참조: admin 의 `api/*`, `stores/authStore.ts`, `providers/*`, `hooks/*`, `schemas/*`, `types/*`
  (대부분 그대로 이식 가능).
- **검증**: 훅을 통한 데이터 흐름, 인터셉터 토큰/401 동작(다음 Phase의 MSW로 확인).

### Phase 4 — 인증 + RBAC
- 로그인 흐름(`pages/LoginPage`) + RHF + Zod.
- `routes/`: `createBrowserRouter`, `ProtectedRoute`, `RoleRoute`, `paths.ts`.
- 역할 `admin|manager|user`, `Sidebar` 메뉴 `allowedRoles` 필터.
- 샘플 페이지: `DashboardPage`, `UsersPage`(admin/manager 전용), `ForbiddenPage`(403), `NotFoundPage`(404).
- 참조: admin 의 `routes/*`, `pages/*`.
- **검증**: 미인증 → `/login` 리다이렉트, `user` 역할의 `/users` 접근 시 403, 메뉴 역할 필터.

### Phase 5 — MSW 목 API + 데모 계정
- `mocks/{handlers,data,browser,server}.ts`: 로그인/로그아웃/me/users 핸들러 + 시드 데이터.
- `VITE_ENABLE_MOCK=true` 시 `src/main.tsx`에서 워커 기동.
- `public/mockServiceWorker.js` 생성(MSW init).
- 데모 계정 admin/manager/user (비밀번호 `password`) — README 표와 일치.
- 참조: admin 의 `mocks/*`, `main.tsx`의 MSW 기동 분기.
- **검증**: 백엔드 없이 데모 계정 로그인, RBAC 시연.

### Phase 6 — 테스트
- Vitest + Testing Library + jsdom 설정(`vite.config.ts` test 블록), `vitest.setup.ts`(MSW server 기동).
- 유닛 예시: `utils/format.test.ts`. 컴포넌트+네트워크 예시: `pages/LoginPage.test.tsx`(MSW 연동).
- 참조: admin 의 `vitest.setup.ts`, `utils/format.test.ts`, `pages/LoginPage.test.tsx`.
- **검증**: `pnpm test` green.

### Phase 7 — 인프라 / DX
- Storybook 설정(`.storybook/`), 예시 스토리(`components/.../*.stories.tsx`).
- `Dockerfile`(멀티스테이지: node:22-alpine 빌드 → nginx:1.27-alpine) + `nginx.conf`(SPA fallback + 에셋 캐싱).
- GitHub Actions CI(`.github/workflows/ci.yml`): checkout → pnpm/Node 셋업 → install(`--frozen-lockfile`)
  → lint → test → build.
- 참조: admin 의 `.storybook/*`, `Dockerfile`, `nginx.conf`, `.github/workflows/ci.yml`.
- **검증**: `pnpm storybook`/`pnpm build-storybook`, Docker 이미지 빌드, CI green.

### Phase 8 — 문서 동기화
- `CLAUDE.md` 상단 "스캐폴딩 전" 배너 제거, 실제 코드 기준으로 문구 정리.
- `README.md`의 Quick Start/Scripts/Structure를 실제와 일치시키고 데모 계정 표 확정.
- 본 `docs/roadmap.md`는 완료 항목 체크 + "파리티 이후 로드맵"만 남김.

---

## react-admin-template 참조 매핑

UI(MUI → Shadcn/UI)와 PWA(vite-plugin-pwa) 외에는 admin 의 구조를 그대로 이식한다.

| PWA 대상                  | admin 참조 파일                              |
| ------------------------- | -------------------------------------------- |
| Axios 레이어/인터셉터     | `src/api/axiosInstance.ts`, `src/api/*.ts`   |
| 인증 스토어/헬퍼          | `src/stores/authStore.ts`                    |
| 라우트 가드               | `src/routes/{index.tsx,ProtectedRoute,RoleRoute,paths}` |
| React Query 훅            | `src/hooks/*`                                |
| Zod 스키마/타입           | `src/schemas/*`, `src/types/*`               |
| MSW 목 API                | `src/mocks/*`, `src/main.tsx`                |
| 테스트 셋업/예시          | `vitest.setup.ts`, `src/**/*.test.ts(x)`     |
| CI/Docker/Storybook       | `.github/workflows/ci.yml`, `Dockerfile`, `nginx.conf`, `.storybook/*` |

## admin과의 의도적 차이

- **UI 라이브러리**: MUI 대신 Shadcn/UI + Tailwind CSS(모바일 우선). 레이아웃·공용 컴포넌트는
  Shadcn 기반으로 재작성.
- **빌드/SW**: vite-plugin-pwa로 서비스 워커·매니페스트 생성(admin에는 없는 레이어).
- **검증 방식**: PWA 동작은 `pnpm dev`가 아니라 `pnpm build && pnpm preview`에서만 확인.

## 파리티 이후 로드맵

- **Push Notification** — Web Push + 서비스 워커 알림.
- **Offline Data Sync** — 오프라인 쓰기 큐 + 백그라운드 동기화.
- **i18n** — 다국어.
- **Social Login** — OAuth 제공자 연동.
- **TDD 워크플로우 자동화** — react-admin-template `docs/tdd-workflow.md` 설계를 pnpm 기준 공유
  (`/tdd` 스킬 + PostToolUse 자동 포맷 + Stop 게이트).

## 완료 정의 (Definition of Done)

- `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm test` 모두 green.
- `pnpm build && pnpm preview`에서 설치 프롬프트 노출 + 오프라인 로드 + 업데이트 알림 동작.
- 데모 계정(admin/manager/user)으로 MSW 기반 로그인 성공.
- RBAC: `user` 역할의 `/users` 접근 시 403, 메뉴 역할 필터 동작.
- 다크 모드 토글 + persist 동작.
- `pnpm build-storybook` 성공, Docker 이미지 빌드 성공, GitHub Actions CI green.
- `CLAUDE.md` / `README.md`가 실제 코드와 일치(스캐폴딩 배너 제거 완료).

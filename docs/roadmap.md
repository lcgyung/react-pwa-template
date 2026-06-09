# 작업 계획 — admin 수준 보일러플레이트 도달

> 상태: **구현 완료 (admin 파리티 달성)** · 형제 템플릿 react-admin-template 과 동일한
> 아키텍처·도구·DX 수준에 도달했으며, 의도적 차이는 UI(Shadcn/UI + Tailwind v4)와
> PWA(vite-plugin-pwa) 레이어뿐이다. 아래는 완료된 단계별 작업과 검증 결과,
> 그리고 파리티 이후 로드맵이다.

## 확정 결정 (구현 기준)

| 항목          | 결정                             | 비고                                             |
| ------------- | -------------------------------- | ------------------------------------------------ |
| 패키지 매니저 | **pnpm**                         | admin과 통일 (명령/CI/Docker/workspace 보안설정) |
| UI            | **Shadcn/UI + Tailwind CSS v4**  | admin은 MUI — 이 부분이 핵심 차이                |
| 빌드/SW       | **vite-plugin-pwa** (`prompt`)   | SW·매니페스트 생성 + PWABadge 업데이트 알림      |
| 목 API        | **MSW + 데모 계정 포함**         | 백엔드 없이 즉시 시연                            |
| 접근 제어     | **RBAC (admin/manager/user)**    | ProtectedRoute / RoleRoute                       |
| 테마          | **다크 모드 포함**               | themeStore + persist (Tailwind class 토글)       |
| 인프라        | **Storybook · Docker · CI 포함** | admin과 동일 수준                                |

## 완료된 단계

각 Phase는 종료 시 `pnpm lint && pnpm test && pnpm build` 통과를 게이트로 검증했다.

- [x] **Phase 0 — 스캐폴딩**: pnpm `package.json`, `pnpm-workspace.yaml`, `tsconfig*`(별칭 `@/*`),
      `vite.config.ts`, ESLint(flat)+Prettier, Husky+lint-staged, `.env*`, `index.html`.
- [x] **Phase 1 — PWA 코어**: `vite-plugin-pwa`(`registerType: 'prompt'`, manifest, workbox),
      `public/` 아이콘(192/512/maskable), `PWABadge`(useRegisterSW 업데이트/오프라인 알림).
- [x] **Phase 2 — UI 기반**: Tailwind v4(CSS-first) + Shadcn/UI(`components.json`, `lib/utils`,
      `components/ui/*`), `ThemeProvider`(dark class 토글), 모바일 우선 레이아웃
      (`MainLayout`/`AuthLayout` + Sheet 드로어 `Sidebar`/`Header`), 공용 컴포넌트.
- [x] **Phase 3 — 데이터 레이어**: `api/*`(axios 인터셉터), `stores/*`, `providers/*`,
      `hooks/*`(React Query), `schemas/*`(Zod), `types/*`, `utils/format` — admin에서 이식.
- [x] **Phase 4 — 인증 + RBAC**: `routes/*`(createBrowserRouter, ProtectedRoute, RoleRoute, paths),
      Sidebar `allowedRoles` 필터, 페이지(Login[Shadcn Form], Dashboard, Users, 403, 404).
- [x] **Phase 5 — MSW + 데모 계정**: `mocks/*`(login/logout/me/users), `main.tsx` 기동 분기,
      `public/mockServiceWorker.js`. 데모 admin/manager/user (pw `password`).
- [x] **Phase 6 — 테스트**: `vitest.setup.ts`(MSW server), `utils/format.test.ts`,
      `pages/LoginPage.test.tsx`(MSW 연동), `routes/guards.test.tsx`(RBAC). **8 tests green.**
- [x] **Phase 7 — 인프라/DX**: Storybook(Tailwind preview, PWA 플러그인 제외), 예시 스토리,
      `Dockerfile`(node:22→nginx:1.27) + `nginx.conf`(SPA fallback + 에셋 캐싱 + SW no-cache),
      GitHub Actions CI(install→lint→test→build).
- [x] **Phase 8 — 문서 동기화**: `CLAUDE.md`/`README.md`/본 문서를 실제 코드와 일치.

## 검증 결과 (Definition of Done)

- `pnpm lint` / `pnpm test`(8 passed) / `pnpm build` / `pnpm build-storybook` — 모두 green.
- `pnpm build && pnpm preview`: `manifest.webmanifest`·`sw.js`·아이콘 정상 서빙, 설치 가능,
  오프라인 로드, 업데이트 알림(prompt) 동작.
- 데모 계정(admin/manager/user)으로 MSW 기반 로그인 — `LoginPage.test.tsx` 로 자동 검증.
- RBAC: 미인증 → `/login`, `user` 역할의 `/users` → `/403`, `admin` → 접근 허용 — `guards.test.tsx` 로 자동 검증.
- 다크 모드 토글 + persist 동작(`themeStore` + `ThemeProvider`).
- Docker 이미지: 이 환경(도커 미설치)에서는 빌드 미검증. `Dockerfile`/`nginx.conf` 는 admin의
  검증된 구성을 이식한 것으로, `docker build -t react-pwa-template .` 로 확인할 수 있다.

## react-admin-template 참조 매핑

UI(MUI → Shadcn/UI)와 PWA(vite-plugin-pwa) 외에는 admin 의 구조를 그대로 이식했다.

| PWA 대상              | admin 참조 파일                                                        |
| --------------------- | ---------------------------------------------------------------------- |
| Axios 레이어/인터셉터 | `src/api/axiosInstance.ts`, `src/api/*.ts`                             |
| 인증 스토어/헬퍼      | `src/stores/authStore.ts`                                              |
| 라우트 가드           | `src/routes/{index.tsx,ProtectedRoute,RoleRoute,paths}`                |
| React Query 훅        | `src/hooks/*`                                                          |
| Zod 스키마/타입       | `src/schemas/*`, `src/types/*`                                         |
| MSW 목 API            | `src/mocks/*`, `src/main.tsx`                                          |
| 테스트 셋업/예시      | `vitest.setup.ts`, `src/**/*.test.ts(x)`                               |
| CI/Docker/Storybook   | `.github/workflows/ci.yml`, `Dockerfile`, `nginx.conf`, `.storybook/*` |

## admin과의 의도적 차이

- **UI 라이브러리**: MUI 대신 Shadcn/UI + Tailwind CSS v4(모바일 우선). 레이아웃·공용 컴포넌트는
  Shadcn 기반으로 재작성, 아이콘은 `lucide-react`, 토스트는 `sonner`.
- **빌드/SW**: vite-plugin-pwa로 서비스 워커·매니페스트 생성(admin에는 없는 레이어).
  업데이트 전략은 `prompt` + `PWABadge` 알림 UI.
- **검증 방식**: PWA 동작은 `pnpm dev`가 아니라 `pnpm build && pnpm preview`에서만 확인.

## 파리티 이후 로드맵

- **Push Notification** — Web Push + 서비스 워커 알림.
- **Offline Data Sync** — 오프라인 쓰기 큐 + 백그라운드 동기화.
- **i18n** — 다국어.
- **Social Login** — OAuth 제공자 연동.

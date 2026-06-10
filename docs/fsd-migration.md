# FSD 아키텍처 마이그레이션 (react-pwa-template)

> 상태: **실행 계획 확정** — 설계 · 매핑표 · 영향도 · 실제 실행 단계를 한 문서로 통합한 버전.
> **실제 폴더 이전(코드 이동·설정 변경)은 미수행**이며, 본 문서대로 추후 별도 진행한다.
> 자매 프로젝트 `react-admin-template`과 동일 설계를 동시 적용한다. 차이점은 **Tailwind v4 +
> Shadcn/UI**(MUI 아님)와 **PWA 레이어**(vite-plugin-pwa, 서비스워커/매니페스트)다.

---

## 1. 배경 / 목표

현재 `src`는 **타입 기반(type-first)** 구조다(`api/`, `components/ui`+`components/common`, `hooks/`,
`pages/`, `stores/`, `schemas/`, `types/`, `lib/`, `styles/` …). 한 도메인(예: auth)의 코드가 여러
폴더에 흩어져 "기능 단위로 모아보기"가 어렵고, 레이어 간 의존 방향을 강제하는 장치가 없다.

[Feature-Sliced Design(FSD) 2.x](https://feature-sliced.design/docs) ([KR](https://fsd.how/kr))를 도입해:

- 도메인(auth / users / theme) 응집도를 높이고,
- "위 레이어 → 아래 레이어" 단방향 의존 규칙을 **Steiger** 린터로 강제하고,
- 슬라이스 Public API(`index.ts`)로 내부 구현을 캡슐화한다.
- **PWA 빌드 자산(vite-plugin-pwa, public/ 매니페스트·아이콘, 서비스워커)은 빌드타임/루트 레벨이므로
  `src` 재배치와 무관하게 그대로 둔다.**

### 1.1 확정 결정사항

| 항목              | 결정                                                                             |
| ----------------- | -------------------------------------------------------------------------------- |
| FSD 깊이          | **정석 6레이어** (`app / pages / widgets / features / entities / shared`)        |
| 규칙 강제         | **Steiger** (`@feature-sliced/steiger-plugin`). 기존 ESLint는 유지하고 별도 추가 |
| Steiger 강제 강도 | **즉시 error (CI/게이트 하드 차단).** 위반 0을 달성해야 머지 가능                |
| 소비자 상속 강도  | **error (이 레포 CI와 동일).** 진입장벽 상승은 문서·레시피로 완화                |
| axios 상향 의존   | **옵션 B — 콜백 주입(의존성 역전).** `shared/api`를 의존성 0으로 유지            |
| 진행              | `react-admin-template` · `react-pwa-template` **동시·동일 적용**                 |
| 경로 alias        | 기존 `@/* → ./src/*` **유지** (레이어별 alias 추가 안 함)                        |

### 1.2 ⚠️ 설계 보정 2건 (하드 에러 0 위반 달성에 필수)

하드 강제(error)를 택했으므로, 초기 설계가 가볍게 다룬 **같은 레이어 cross-import** 2건을 정석대로
보정한다(아래 매핑표·실행 단계에 이미 반영).

1. **`entities/session → entities/user`** — `authStore`가 `User` 타입을 사용한다
   (`import type { User } from '@/types/user'`). entities 슬라이스끼리의 import는 FSD 금지.
   → FSD 공식 **`@x` 크로스임포트 API**로 해결: `entities/user/@x/session.ts`가 `User`를 재노출하고,
   session은 `@/entities/user/@x/session`에서 import한다. Steiger `recommended`가 `@x`를 인식한다.
2. **`widgets/main-layout → widgets/app-nav`** — `MainLayout`이 `<Sidebar/>`·`<Header/>`를 렌더한다.
   widget 슬라이스끼리의 import도 금지. → **`app-nav` 별도 슬라이스 분리안을 폐기**하고, 레이아웃 셸
   (`MainLayout` + `Sidebar` + `Header` + `SidebarNav`)을 **단일 `widgets/main-layout` 슬라이스**로
   통합한다(슬라이스 내부 import는 합법). 이 한 수로 Header↔Sidebar 결합 문제도 동시에 해소된다.
   `auth-layout`(네비 미사용) · `pwa-badge`는 별도 위젯으로 유지.

> 의존 방향 검증: `widgets→features→entities→shared`, `app→전부`는 모두 합법. 위 2건만이
> 같은-레이어 위반이며, 보정 후 **예상 Steiger 위반 0**.

---

## 2. FSD 6레이어 개요 + 의존성 규칙

레이어 (위 → 아래):

| 레이어       | 역할                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| **app**      | 앱 전역 설정 — providers, router/guards, **전역 스타일(Tailwind 엔트리 `index.css`)**, MSW 부트스트랩, axios 브리지 |
| **pages**    | 라우트 화면. 슬라이스 = 페이지                                                                                      |
| **widgets**  | 페이지에 독립적인 합성 UI 블록 (레이아웃 셸, **PWABadge**)                                                          |
| **features** | 사용자 액션·기능 (로그인 폼·액션, 유저 조회 훅, 테마 토글)                                                          |
| **entities** | 비즈니스 도메인 모델 (User/Role, 인증 세션)                                                                         |
| **shared**   | 도메인 무관 인프라 (axios 인스턴스, **Shadcn UI 프리미티브**, `cn()`, 유틸, 경로 상수)                              |

> `processes`는 deprecated이므로 사용하지 않는다.

**의존성 규칙(핵심)**: 한 레이어의 모듈은 **자기보다 엄격히 아래 레이어만** import할 수 있다. 같은
레이어의 다른 슬라이스끼리는 import 금지(예외: `@x` 크로스임포트 API). `app`/`shared`만 "레이어이자
슬라이스"로 동작(슬라이스 없이 세그먼트만 두며 누구나 import 가능).

**세그먼트**: 슬라이스 내부는 "왜"로 분류 — `ui / api / model / lib / config`. `components`/`hooks`처럼
"무엇" 이름은 금지.

**Public API**: 슬라이스마다 `index.ts` 배럴 하나. 슬라이스 간 import는 반드시 배럴 경유. `shared`는
깊은 경로로 직접 import(`@/shared/ui/button`). Shadcn 프리미티브는 기존 관행대로 파일 직접 import(배럴
생략) — eslint `react-refresh` 예외와 일치.

---

## 3. 타깃 폴더 구조

```text
src/
  app/
    providers/        # AppProviders(+Toaster/PWABadge 마운트), QueryProvider
    router/           # router.tsx + ProtectedRoute + RoleRoute (+ guards.test)
    mocks/            # MSW handlers/data/browser/server
    styles/           # index.css (Tailwind v4 엔트리 + Shadcn 테마 CSS 변수)
    config/           # configureAxios.ts (axios 브리지 주입 — 옵션 B)
    App.tsx
  pages/
    login/      ui/ index.ts      # LoginPage (+ test)
    dashboard/  ui/ index.ts
    users/      ui/ index.ts
    forbidden/  ui/ index.ts
    not-found/  ui/ index.ts
  widgets/
    main-layout/ ui/ index.ts     # MainLayout + Sidebar + Header + SidebarNav 통합 (cross-import 제거)
    auth-layout/ ui/ index.ts
    pwa-badge/   ui/ index.ts      # PWABadge (useRegisterSW)
  features/
    auth/   api/ model/ index.ts  # useAuth, authApi, loginSchema, Login DTO
    users/  api/ model/ index.ts  # useUsers, usersApi, userFormSchema
    theme/  model/ ui/ index.ts   # themeStore + ThemeProvider(Tailwind class toggle)
  entities/
    user/    model/ @x/ index.ts  # User/Role 타입 (+ @x/session.ts 크로스임포트 API)
    session/ model/ index.ts      # authStore(token/user, getAuthToken/clearAuthState)
  shared/
    api/     axiosInstance.ts, types.ts     # (배럴 없음, 깊은 경로 import) — axiosInstance 의존성 0
    ui/      Loading/, PageHeader/, StatCard/, + shadcn 프리미티브 (button, input, card, table, sheet, dropdown-menu, form, label, alert, avatar, badge, sonner)
    lib/     format.ts (+test), cn.ts
    config/  paths.ts
    assets/  .gitkeep
  main.tsx          # 루트 유지 (index.html 진입점). @/app/App, @/app/styles/index.css import
  vite-env.d.ts     # 루트 유지 (ambient 타입)
```

**루트 유지(이동 금지)**: `vite.config.ts`(VitePWA 설정), `public/`(아이콘·`manifest.webmanifest`),
`index.html`, `.storybook/`, `tsconfig.*`, `eslint.config.js`, `dev-dist/`, `virtual:pwa-register/react`.

---

## 4. 파일별 매핑표 (현재 59개 → FSD)

> **검증 결과(탐색 3종 + 직접 확인)**: 현재 `src` 파일 수 = **정확히 59개**, 아래 매핑표와 1:1 대응,
> 누락/추가 0. 경로 alias `@/* → ./src/*`는 폴더 이동과 무관하게 동작 → `tsconfig`/`vite.config.ts`
> **변경 불필요**. Steiger 의존성은 **미설치**. 커플링 위험(axios 상향 의존, Header↔Sidebar
> cross-import, paths importer 6곳)은 모두 사실로 확인.

### shared

| 현재                                       | FSD 목적지                                    |
| ------------------------------------------ | --------------------------------------------- |
| `api/axiosInstance.ts`                     | `shared/api/axiosInstance.ts` (의존성 0)      |
| `types/common.ts`                          | `shared/api/types.ts`                         |
| `routes/paths.ts`                          | `shared/config/paths.ts`                      |
| `utils/format.ts`                          | `shared/lib/format.ts`                        |
| `utils/format.test.ts`                     | `shared/lib/format.test.ts`                   |
| `lib/utils.ts` (`cn()`)                    | `shared/lib/cn.ts`                            |
| `components/common/Loading.tsx`            | `shared/ui/Loading/Loading.tsx`               |
| `components/common/PageHeader.tsx`         | `shared/ui/PageHeader/PageHeader.tsx`         |
| `components/common/PageHeader.stories.tsx` | `shared/ui/PageHeader/PageHeader.stories.tsx` |
| `components/common/StatCard.tsx`           | `shared/ui/StatCard/StatCard.tsx`             |
| `components/ui/*` (12개)                   | `shared/ui/*` (파일 직접 import 유지)         |
| `assets/.gitkeep`                          | `shared/assets/.gitkeep`                      |

### entities

| 현재                                                            | FSD 목적지                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------- |
| `types/user.ts` (User/Role/CreateUserInput)                     | `entities/user/model/types.ts` + `entities/user/index.ts`           |
| — (신규)                                                        | `entities/user/@x/session.ts` (`User` 재노출 — 크로스임포트)        |
| `stores/authStore.ts` (token/user, getAuthToken/clearAuthState) | `entities/session/model/authStore.ts` + `entities/session/index.ts` |

> `authStore`의 `User` import는 `@/entities/user/@x/session`으로 변경(보정 1).

### features

| 현재                          | FSD 목적지                               |
| ----------------------------- | ---------------------------------------- |
| `hooks/useAuth.ts`            | `features/auth/model/useAuth.ts`         |
| `api/auth.ts`                 | `features/auth/api/authApi.ts`           |
| `schemas/auth.ts`             | `features/auth/model/loginSchema.ts`     |
| `types/auth.ts` (Login DTO)   | `features/auth/model/types.ts`           |
| —                             | `features/auth/index.ts` (배럴)          |
| `hooks/useUsers.ts`           | `features/users/model/useUsers.ts`       |
| `api/users.ts`                | `features/users/api/usersApi.ts`         |
| `schemas/user.ts`             | `features/users/model/userFormSchema.ts` |
| —                             | `features/users/index.ts` (배럴)         |
| `stores/themeStore.ts`        | `features/theme/model/themeStore.ts`     |
| `providers/ThemeProvider.tsx` | `features/theme/ui/ThemeProvider.tsx`    |
| —                             | `features/theme/index.ts` (배럴)         |

> `features/auth`는 `entities/session`(set/clear)과 `entities/user`(User 타입)를 import한다.
> `ThemeProvider`는 Tailwind `<html class="dark">` 토글 방식이며 `themeStore` 구독.

### widgets (⚠️ 보정 2 적용 — 단일 `main-layout` 슬라이스 통합)

| 현재                                                      | FSD 목적지                              |
| --------------------------------------------------------- | --------------------------------------- |
| `layouts/MainLayout.tsx`                                  | `widgets/main-layout/ui/MainLayout.tsx` |
| `layouts/components/Sidebar.tsx` (Sidebar + `SidebarNav`) | `widgets/main-layout/ui/Sidebar.tsx`    |
| `layouts/components/Header.tsx` (`SidebarNav` import)     | `widgets/main-layout/ui/Header.tsx`     |
| `layouts/AuthLayout.tsx`                                  | `widgets/auth-layout/ui/AuthLayout.tsx` |
| `components/common/PWABadge.tsx`                          | `widgets/pwa-badge/ui/PWABadge.tsx`     |

> **통합 이유**: `MainLayout`이 `Sidebar`·`Header`를, `Header`가 `Sidebar`의 `SidebarNav`(모바일
> 드로어용 네비 리스트)를 import한다. 같은 레이어 슬라이스 간 import는 FSD 금지이므로 셸 전체를 단일
> `widgets/main-layout` 슬라이스로 합쳐 **내부 상대경로 import**로 처리한다.
> **PWABadge**: `useRegisterSW`로 SW 업데이트/오프라인 알림을 띄우는 앱 셸 크롬. `app/providers/AppProviders`에서
> `<Toaster/>`(`@/shared/ui/sonner`)와 함께 마운트.

### pages (각 슬라이스 `ui/` + `index.ts`)

| 현재                       | FSD 목적지                             |
| -------------------------- | -------------------------------------- |
| `pages/LoginPage.tsx`      | `pages/login/ui/LoginPage.tsx`         |
| `pages/LoginPage.test.tsx` | `pages/login/ui/LoginPage.test.tsx`    |
| `pages/DashboardPage.tsx`  | `pages/dashboard/ui/DashboardPage.tsx` |
| `pages/UsersPage.tsx`      | `pages/users/ui/UsersPage.tsx`         |
| `pages/ForbiddenPage.tsx`  | `pages/forbidden/ui/ForbiddenPage.tsx` |
| `pages/NotFoundPage.tsx`   | `pages/not-found/ui/NotFoundPage.tsx`  |

### app

| 현재                          | FSD 목적지                                                  |
| ----------------------------- | ----------------------------------------------------------- |
| `App.tsx`                     | `app/App.tsx`                                               |
| `providers/AppProviders.tsx`  | `app/providers/AppProviders.tsx`                            |
| `providers/QueryProvider.tsx` | `app/providers/QueryProvider.tsx`                           |
| `routes/index.tsx`            | `app/router/router.tsx`                                     |
| `routes/ProtectedRoute.tsx`   | `app/router/ProtectedRoute.tsx`                             |
| `routes/RoleRoute.tsx`        | `app/router/RoleRoute.tsx`                                  |
| `routes/guards.test.tsx`      | `app/router/guards.test.tsx`                                |
| `mocks/browser.ts`            | `app/mocks/browser.ts`                                      |
| `mocks/server.ts`             | `app/mocks/server.ts`                                       |
| `mocks/handlers.ts`           | `app/mocks/handlers.ts`                                     |
| `mocks/data.ts`               | `app/mocks/data.ts`                                         |
| `styles/index.css`            | `app/styles/index.css`                                      |
| — (신규)                      | `app/config/configureAxios.ts` (axios 브리지 주입 — 옵션 B) |

### 루트 유지 (이동만 안 하고 import 경로만 갱신)

| 파일            | 비고                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `main.tsx`      | `index.html` 진입점. `@/app/App`, `@/app/styles/index.css`, `@/app/mocks/browser` import로 갱신 |
| `vite-env.d.ts` | ambient 타입(PWA client 타입 포함), 레이어 아님                                                 |

### ⚠️ 핵심 주의: axios 상향 의존 → 옵션 B(콜백 주입) 확정

`shared/api/axiosInstance.ts`는 인터셉터에서 `getAuthToken`/`clearAuthState`(→ `entities/session`)와
`paths`(→ `shared/config`)를 사용한다. `paths`는 `shared`로 이동하므로 문제없지만, `entities/session`
참조는 **shared → entities 상향 import(규칙 위반)**다. → **옵션 B(의존성 역전)** 로 해결한다:

- `shared/api/axiosInstance.ts`는 도메인 import를 제거하고 모듈 스코프 `getToken`/`onUnauthorized`
  기본값(no-op) + `configureAuthBridge({ getToken, onUnauthorized })`를 export. request 인터셉터는
  `getToken()`, response 401은 `onUnauthorized()`를 호출 → **shared/api 도메인 의존성 0.**
- app 부트스트랩(`app/config/configureAxios.ts`)에서 `entities/session`의 `getAuthToken`/`clearAuthState`와
  `shared/config/paths`를 주입한다. (app→shared·entities = 합법)

---

## 5. 실행 단계 (하향식 · 각 단계 후 게이트)

이동은 **`git mv`로 이력 보존**. PostToolUse 포맷 훅이 변경 `*.ts(x)`를 자동 정리하므로
"이동 → import 수정" 순서로 진행한다. Steiger는 **7단계에서 도입**하므로 1~6단계 게이트엔 영향 없음.

각 단계 종료 게이트:

```bash
pnpm exec tsc -b --noEmit && pnpm exec eslint . && pnpm exec vitest run
```

> 게이트는 **repo 루트에서 실행**한다(`tsc -b`/`eslint .`/`vitest`/`steiger`가 cwd=루트를 전제).
> 하위 디렉터리(예: `docs/`)에서 돌리면 `TS5083`·eslint all-ignored 거짓 실패가 난다. (현재 Stop 훅
> `gate.sh`에는 cwd 보정이 없음 → 7단계에서 `cd "$CLAUDE_PROJECT_DIR"` 가드 추가 권장.)

### 1단계 — shared

- `git mv`: `api/axiosInstance.ts→shared/api/`, `types/common.ts→shared/api/types.ts`,
  `routes/paths.ts→shared/config/paths.ts`, `utils/format.ts(+test)→shared/lib/`,
  `lib/utils.ts→shared/lib/cn.ts`, `components/common/{Loading,PageHeader(+stories),StatCard}→shared/ui/<Name>/`,
  `components/ui/*`(12종)`→shared/ui/`, `assets/.gitkeep→shared/assets/`.
- **axios 옵션 B 적용**: `shared/api/axiosInstance.ts`에서 `@/stores/authStore`·`@/routes/paths`
  import 제거. `configureAuthBridge({ getToken, onUnauthorized })` export. **도메인 의존성 0.**
- **⚠️ 중간 단계 보존책**: 브리지 주입처(`app/config`)는 6단계에야 생기므로, 1~5단계 동안에는
  `main.tsx`(런타임)에서 `configureAuthBridge`를 **그 시점의 현재 위치** getter/clearer로 임시 호출한다
  (1단계엔 `@/stores/authStore`, 2단계 후 `@/entities/session`). 6단계에서 `app/config/configureAxios.ts`로
  이전·일원화하며 `main.tsx`를 슬림화. (이렇게 안 하면 옵션 B 전환 직후 토큰 주입·401이 무력화됨.)
  단, `vitest.setup.ts`는 테스트가 토큰을 요구하지 않으므로(로그인 POST=토큰 불요, 가드는 authStore
  직접) **불필요** — vitest 게이트는 이 구간에도 그대로 통과(admin과 차이).
- 전역 import 경로 갱신: `@/lib/utils→@/shared/lib/cn`, `@/components/ui/*→@/shared/ui/*`,
  `@/routes/paths→@/shared/config/paths`, `@/utils/format→@/shared/lib/format`,
  `@/components/common/*→@/shared/ui/*`, `@/types/common→@/shared/api/types`.
- **설정**: `eslint.config.js` 글롭 `src/components/ui/**`→`src/shared/ui/**`.
  `components.json` `aliases.ui→@/shared/ui`, `aliases.utils→@/shared/lib/cn`.

### 2단계 — entities

- `git mv`: `types/user.ts→entities/user/model/types.ts`,
  `stores/authStore.ts→entities/session/model/authStore.ts`.
- 배럴: `entities/user/index.ts`, `entities/session/index.ts`.
- **`@x` 크로스임포트**: `entities/user/@x/session.ts` → `export type { User } from '../model/types'`.
  `authStore`의 `User` import를 `@/entities/user/@x/session`으로 변경.
- 전역 갱신: `@/types/user→@/entities/user`, `@/stores/authStore→@/entities/session`.

### 3단계 — features

- `git mv`: `hooks/useAuth.ts→features/auth/model/`, `api/auth.ts→features/auth/api/authApi.ts`,
  `schemas/auth.ts→features/auth/model/loginSchema.ts`, `types/auth.ts→features/auth/model/types.ts`;
  `hooks/useUsers.ts→features/users/model/`, `api/users.ts→features/users/api/usersApi.ts`,
  `schemas/user.ts→features/users/model/userFormSchema.ts`;
  `stores/themeStore.ts→features/theme/model/`, `providers/ThemeProvider.tsx→features/theme/ui/`.
- 배럴 3개: `features/{auth,users,theme}/index.ts`.
- 전역 갱신(`@/hooks/*→@/features/*`, `@/schemas/*→@/features/*/model`, `@/stores/themeStore→@/features/theme`).
  게이트에서 `LoginPage.test` 통과 확인.

### 4단계 — widgets (⚠️ 보정 2 적용)

- **`widgets/main-layout` 단일 슬라이스로 통합**: `git mv`로 `layouts/MainLayout.tsx`,
  `layouts/components/{Sidebar,Header}.tsx`를 `widgets/main-layout/ui/`로 이동. `MainLayout`·`Header`의
  상호 참조는 **상대경로 내부 import**로 처리(배럴 경유 금지).
- `widgets/auth-layout/ui/AuthLayout.tsx`,
  `widgets/pwa-badge/ui/PWABadge.tsx`(`components/common/PWABadge.tsx` 이동) + 각 배럴.
- 위젯은 하위 의존만 사용: `@/features/*`, `@/entities/session`, `@/shared/ui|lib|config`.

### 5단계 — pages

- `git mv`로 5개 슬라이스화: `pages/login/ui/LoginPage.tsx(+test)`, `dashboard/`, `users/`,
  `forbidden/`, `not-found/` + 각 `index.ts` 배럴.

### 6단계 — app

- `git mv`: `App.tsx→app/App.tsx`, `providers/{AppProviders,QueryProvider}→app/providers/`,
  `routes/{index.tsx→router.tsx,ProtectedRoute,RoleRoute,guards.test}→app/router/`,
  `mocks/*→app/mocks/`, `styles/index.css→app/styles/`.
- **axios 브리지 부트스트랩(일원화)**: `app/config/configureAxios.ts` 신설 —
  `configureAuthBridge({ getToken: getAuthToken, onUnauthorized: () => { clearAuthState(); if (location.pathname !== paths.login) location.href = paths.login } })`.
  `app/App.tsx` 최상단에서 side-effect import(`import '@/app/config/configureAxios';`)해 렌더 전 1회 실행.
  **1~5단계에서 `main.tsx`에 두었던 임시 주입은 여기로 옮기고 제거**(중복 주입 방지).
- 루트 import 갱신: `main.tsx`(`@/app/App`, `@/app/styles/index.css`, `@/app/mocks/browser`),
  `vitest.setup.ts`(`@/mocks/server→@/app/mocks/server`).

### 7단계 — Steiger 도입(하드 에러) + 문서화

- devDeps 추가(pnpm): `steiger`, `@feature-sliced/steiger-plugin`.
- `steiger.config.ts` 신설(`fsd.configs.recommended`). `package.json`에 `"lint:fsd": "steiger ./src"`.
- **하드 강제 연동**: `.claude/hooks/gate.sh`(Stop)·`.github/workflows/ci.yml`에 `pnpm lint:fsd`
  추가, **위반 시 실패**. 이때 `gate.sh`에 `cd "$CLAUDE_PROJECT_DIR"` 가드도 함께 추가(하위 디렉터리
  실행 시 `tsc -b`/`eslint`/`steiger` 거짓 실패 방지 — 현재 미적용).
- `pnpm lint:fsd` 실행 → **위반 0 확인.** (옵션 B로 axios, `@x`로 session→user, 통합으로 widget
  cross-import 모두 해소됨)
- **문서/스킬 갱신**: `CLAUDE.md`(구조 트리 전면 교체 + FSD 의존성/Public API 규칙 섹션 신설),
  `README.md`("## Structure" 트리 교체),
  `.claude/skills/code-review/SKILL.md`(`components/ui`→`src/shared/ui` 문구). 본 문서 상태를
  "적용 완료"로 갱신.

---

## 6. 영향도 분석

### 6.1 마이그레이션 작업 자체 (코드 / 설정 / 문서 / 스킬 / 훅)

**코드**

- `src` 59개 파일 대부분의 **import 경로 재작성**. alias `@/*`는 유지하므로 경로 접두만 변경
  (`@/stores/authStore`→`@/entities/session`, `@/lib/utils`→`@/shared/lib/cn` 등).
- Header↔Sidebar·Main↔nav 결합을 `widgets/main-layout` 통합으로 제거.
- axios 상향 의존은 옵션 B(콜백 주입)로 제거.
- 테스트: `LoginPage.test`, `guards.test`(RBAC), `format.test` — 내부 import만 갱신. vitest는
  `**/*.test.{ts,tsx}` 자동 탐색이라 폴더 이동에 영향받지 않음. `passWithNoTests: true`로 중간 상태도 안전.

**설정**

| 파일                       | 변경                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `tsconfig.app.json`        | **변경 거의 없음** — `@/*` paths 유지, `include` 유지                                      |
| `vite.config.ts`           | **변경 없음** — `@` alias 유지, **VitePWA 설정 그대로**                                    |
| `eslint.config.js`         | override 글롭 `src/components/ui/**` → `src/shared/ui/**` 로 변경                          |
| `components.json`          | `aliases.ui` → `@/shared/ui`, `aliases.utils` → `@/shared/lib/cn`                          |
| `.storybook/main.ts`       | 글롭 `../src/**/*.stories.*` 가 새 위치도 매칭 → **변경 없음**                             |
| `package.json`             | **신규** `"lint:fsd": "steiger ./src"`, devDeps `steiger`·`@feature-sliced/steiger-plugin` |
| `steiger.config.ts`        | **신규** — `fsd.configs.recommended`                                                       |
| `.github/workflows/ci.yml` | **기존 파일**(lint→test→build) — `pnpm lint:fsd` 스텝 추가 (하드 실패)                     |

> **PWA 빌드 자산은 무영향**: VitePWA, `public/` 아이콘·매니페스트, `dev-dist/`,
> `virtual:pwa-register/react`는 빌드타임/루트 레벨이라 `src` 재배치와 독립.

**문서 / 스킬 / 훅**

- `CLAUDE.md` "프로젝트 구조" 트리 전면 교체 + **FSD 의존성 규칙·Public API 규칙 섹션 신설** + axios
  브리지 gotcha 명시. `README.md` "## Structure" 트리 교체.
- `.claude/skills/code-review/SKILL.md`의 `components/ui` 참조 1곳 → `src/shared/ui` 문구 갱신.
  `.claude/agents/code-reviewer.md`는 폴더 참조 없음 → 영향 없음(선택: FSD 경계 점검 항목 추가).
- 훅: `session-context.sh`·`guard-bash.sh`·`format-changed-file.sh`·`check-pwa.sh`는 경로/확장자
  기반 → **영향 없음**. `gate.sh`에 `steiger ./src` 추가(7단계). `settings.json`은 파일명 기반 등록 →
  변경 불필요.

### 6.2 보일러플레이트 사용 영향도 (소비자 관점)

§6.1이 "마이그레이션 작업 자체"라면, 본 절은 **이 템플릿을 클론해 앱을 만드는 소비자(개발자) 관점**의
영향도다. 소비자가 상속받는 Steiger 강도 = **error**(이 레포 CI와 동일).

#### A. 멘탈 모델 / 온보딩 — 영향 큼

소비자가 의존하던 "어디에 코드를 두나" 규칙(README 트리·CLAUDE.md)이 전면 변경된다.

| 작업          | 기존(type-first)     | FSD 후                                         |
| ------------- | -------------------- | ---------------------------------------------- |
| 새 페이지     | `pages/Foo.tsx`      | `pages/foo/ui/FooPage.tsx` + `index.ts`        |
| 데이터 훅     | `hooks/useFoo.ts`    | `features/foo/model/useFoo.ts`(+배럴)          |
| API 함수      | `api/foo.ts`         | `features/foo/api/fooApi.ts` 또는 `shared/api` |
| 전역 스토어   | `stores/fooStore.ts` | `entities/foo/model` 또는 `features/*/model`   |
| Zod 스키마    | `schemas/foo.ts`     | `features/*/model/*Schema.ts`                  |
| UI 프리미티브 | `components/ui/*`    | `shared/ui/*`(파일 직접 import)                |
| 라우트 가드   | `routes/*`           | `app/router/*`                                 |
| MSW 핸들러    | `mocks/*`            | `app/mocks/*`                                  |

→ 7단계에서 문서 갱신 필수. 추가로 **"새 슬라이스 추가 레시피"**(슬라이스 생성 → 세그먼트
`ui/api/model` → 배럴 → 레이어 의존 확인) 가이드 신설 권장.

#### B. 하드 에러 Steiger — 최대 마찰점

FSD에 미숙한 소비자가 흔히 만드는 위반(전부 **commit은 통과**[lint-staged는 FSD 미검사]하나
**Stop 게이트/CI에서 하드 실패**): `feature → feature`, `page → page`, `widget → widget`, 잘못된 레이어
배치, 배럴 우회 deep import, `entity → entity`(해결: `@x`).

완화책: (1) **CLAUDE.md에 FSD 의존성·Public API 규칙 명시** → AI 보조 편집이 규칙 준수,
(2) README/docs "레시피" + "`pnpm lint:fsd`로 푸시 전 점검", (3) Steiger 메시지가 위반 경로를 알려줘
자가 수정 용이, (4) 느슨하게 쓰려는 소비자를 위해 "gate/CI에서 `error → warn`으로 낮추는 한 줄" 탈출구 문서화.

#### C. shadcn 워크플로 — 낮은 마찰(1회 조정)

- `components.json` alias 갱신 후 `pnpm dlx shadcn@latest add <name>`은 정상 동작. 새 프리미티브는
  `src/shared/ui/<name>.tsx` **평면 파일**로 생성되고 내부 `cn` import는 `@/shared/lib/cn`로 정확.
- 규약 명문화 필요: **shadcn 프리미티브 = 평면 파일·배럴 없음·파일 직접 import** /
  **합성 공용 컴포넌트(Loading/PageHeader/StatCard) = 서브폴더**. (eslint `src/shared/ui/**` 예외 글롭과 일치)

#### D. 런타임 함정 — axios 옵션 B

- `shared/api/axiosInstance`는 의존성 0(주입식). app 부트스트랩에서 `configureAuthBridge` **미연결 시
  토큰 주입·401 리다이렉트가 타입 에러 없이 조용히 무력화**(기본 no-op).
- 완화: `app/App.tsx` 최초 import에 브리지 설정을 두고 "이 줄 제거 금지" 주석 + CLAUDE.md 인증 섹션 기록.

#### E. 변경 거의 없는 영역 — 소비자 일상 워크플로 유지

- PostToolUse 포맷 훅·lint-staged(커밋)·Storybook glob·`@/*` alias·VitePWA·SW/매니페스트/오프라인:
  **무변경**. FSD는 커밋에서 미검사(성능상 gate/CI 전용 — `lint:fsd`를 lint-staged에 넣지 않음).
  → 소비자 PWA 경험 무영향(템플릿 강점 유지).

#### F. 기존 포크(업스트림 추적) 소비자

- 1회 복사 후 분기: 영향 없음. 업스트림 추적: 재배치로 import 경로·추가 파일 위치 대거 충돌 →
  **대형 머지 1회**. 릴리스 노트에 "FSD 전환: 경로 매핑표 + `git mv` 이력" 안내 권장(해당 소비자 한정).

#### 소비자 영향 요약

| 영역                             | 영향             | 마찰 | 완화                        |
| -------------------------------- | ---------------- | ---- | --------------------------- |
| 멘탈 모델/온보딩                 | 큼               | 중   | 문서·레시피                 |
| 하드 에러 Steiger                | 큼               | 중   | CLAUDE.md·레시피·`lint:fsd` |
| shadcn add                       | 1회 조정         | 낮음 | 규약 문서화                 |
| axios 브리지                     | 새 런타임 gotcha | 낮음 | 주석·CLAUDE.md              |
| 포맷훅/lint-staged/Storybook/PWA | 무변경           | 없음 | —                           |

---

## 7. 검증 방법

**본 설계/계획 검증**: 4절 매핑표가 현재 `src` 59개 파일과 1:1 대응하는지 확인(코드 변경 없음 → 빌드 불필요). ✅ 완료.

**실제 마이그레이션 검증**:

1. `pnpm exec tsc -b --noEmit` — strict + `noUnusedLocals`로 누락/오타 import 즉시 검출.
2. `pnpm exec eslint .` — 린트 통과(특히 `src/shared/ui/**` 예외 글롭 동작 확인).
3. `pnpm exec vitest run` — `LoginPage.test`·`guards.test`(RBAC)·`format.test` 통과로 인증/가드 회귀 방지.
4. `pnpm lint:fsd` — **Steiger 위반 0**(레이어/Public API/cross-import).
5. **`pnpm build && pnpm preview`** — PWA 설치 가능성·서비스워커·오프라인 fallback 정상 확인
   (`pnpm dev` 아님). `public/` 매니페스트·`vite.config.ts` VitePWA 불변이라 회귀 위험 낮음.
6. `pnpm storybook` — `PageHeader.stories` 등 스토리 로드 확인(글롭 변경 불필요).

## 8. 범위 밖 / 참고

- 자매 `react-admin-template` 동시 적용은 본 리포 범위 밖(이 세션에선 react-pwa-template만 수정).
- `tsconfig.*` · `vite.config.ts` · `.storybook/main.ts` · MSW 핸들러 · `public/` ·
  훅 등록(`.claude/settings.json`)은 **변경 불필요**(검증 완료).

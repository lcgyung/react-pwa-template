# CLAUDE.md

이 문서는 Claude Code(claude.ai/code)가 이 리포지토리에서 작업할 때 참고하는 가이드입니다.

**React PWA Template** — React + TypeScript + Vite 기반 PWA(설치형·오프라인) 템플릿. 기능 목록·
기술 스택·빠른 시작·데모 계정 등 개요는 [`README.md`](README.md)를 참고하세요. 이 문서는 코드만
봐서는 알기 어려운 작업 규칙에 집중합니다. 형제 템플릿인 **react-admin-template** 과 동일한 톤·
구조·도구 체계를 따르며, 차이는 UI(Shadcn/UI + Tailwind CSS v4)와 PWA(vite-plugin-pwa) 부분뿐입니다.

## 패키지 매니저

이 프로젝트는 **pnpm**(`pnpm-workspace.yaml`, `pnpm-lock.yaml` 추적)을 사용합니다. npm/yarn 대신
pnpm 명령을 사용하세요. (react-admin-template 과 동일하게 통일.)

> 참고: pnpm 10+ 는 보안상 의존성의 빌드 스크립트를 기본 차단합니다. `esbuild`/`msw` 의 빌드를
> 허용하는 설정이 `pnpm-workspace.yaml`(`allowBuilds` / `onlyBuiltDependencies`)에 들어 있습니다.

## 자주 쓰는 명령어

```bash
pnpm dev                         # 개발 서버 (5173) — PWA(SW/설치)는 여기서 동작 안 함
pnpm build                       # tsc -b 타입체크 + vite build (SW/매니페스트 생성)
pnpm preview                     # 빌드 산출물 미리보기 — PWA 검증은 build && preview 로만
pnpm lint                        # eslint .
pnpm lint:fsd                    # FSD 레이어 경계 검사 (Steiger) — 위반 시 CI/게이트 하드 실패
pnpm format                      # prettier --write .

pnpm test                        # 단위/컴포넌트 테스트 (vitest run, jsdom)
pnpm test:watch                  # watch 모드
pnpm exec vitest run src/app/router/guards.test.tsx   # 단일 파일
pnpm exec vitest run -t "redirects to /login"         # 테스트명(-t)으로 단일 케이스

pnpm exec tsc -b --noEmit        # 타입체크 단독 (project references; Stop 게이트가 사용)

pnpm storybook                   # Storybook (6006)
pnpm build-storybook             # 정적 Storybook 빌드
```

테스트는 별도 커스텀 스크립트 없이 위의 Vitest 표준 단일 실행 방식을 사용하세요.
전체 스크립트·데모 계정·환경 변수는 [`README.md`](README.md) 참고.

## 프로젝트 구조 (FSD 6레이어)

경로 별칭: `@/*` → `src/*` (`tsconfig`, `vite.config.ts` 양쪽에 설정).
[Feature-Sliced Design 2.x](https://feature-sliced.design) 정석 6레이어를 따릅니다.

```text
src
├── app                       # 앱 전역 설정 (레이어=슬라이스, 세그먼트만 둠)
│   ├── providers/            #   AppProviders(+ThemedToaster/PWABadge 마운트), QueryProvider
│   ├── router/               #   router.tsx + ProtectedRoute/RoleRoute 가드 (+ guards.test)
│   ├── mocks/                #   MSW handlers/data/browser/server
│   ├── styles/               #   index.css — Tailwind v4 엔트리 + Shadcn 테마(CSS 변수)
│   ├── config/               #   configureAxios.ts — axios 인증 브리지 주입 (제거 금지)
│   └── App.tsx
├── pages                     # 라우트 화면. 슬라이스 = 페이지 (각 ui/ + index.ts)
│   └── {login,dashboard,users,forbidden,not-found}/
├── widgets                   # 페이지 독립 합성 UI 블록
│   ├── main-layout/          #   MainLayout+Sidebar+Header 통합 슬라이스 (내부 상대 import)
│   ├── auth-layout/
│   └── pwa-badge/            #   PWABadge (useRegisterSW — SW 업데이트/오프라인 알림)
├── features                  # 사용자 액션·기능 (각 api/model/ui 세그먼트 + index.ts)
│   ├── auth/                 #   useLogin/useLogout/useMe, authApi, loginSchema, Login DTO
│   ├── users/                #   useUsers/useCreateUser, usersApi, userFormSchema
│   └── theme/                #   themeStore + ThemeProvider (Tailwind class 토글)
├── entities                  # 비즈니스 도메인 모델
│   ├── user/                 #   User/Role 타입 (+ @x/session.ts 크로스임포트 API)
│   └── session/              #   authStore (token/user, getAuthToken/clearAuthState)
├── shared                    # 도메인 무관 인프라 (레이어=슬라이스)
│   ├── api/                  #   axiosInstance(+configureAuthBridge), 공용 API 타입
│   ├── ui/                   #   Shadcn 프리미티브(평면 파일) + Loading/PageHeader/StatCard(폴더)
│   ├── lib/                  #   cn.ts, format.ts
│   └── config/               #   paths.ts (라우트 경로 상수)
├── main.tsx                  # 루트 유지 — index.html 진입점
└── vite-env.d.ts             # 루트 유지 — ambient 타입(PWA client 포함)
```

PWA 정적 리소스(매니페스트 아이콘 등)는 `public/`에 둡니다.

### FSD 의존성 / Public API 규칙 (Steiger가 강제)

- **레이어 단방향 의존**: 모듈은 자기보다 **아래 레이어만** import 가능
  (`app > pages > widgets > features > entities > shared`). 상향·역방향 import 금지.
- **같은 레이어 슬라이스 간 import 금지.** 유일한 예외는 entities 의 `@x` 크로스임포트 API
  (`entities/user/@x/session.ts` → session 이 `@/entities/user/@x/session` 으로 import).
- **Public API(배럴) 경유**: 슬라이스 간 import 는 반드시 해당 슬라이스의 `index.ts` 를 거친다
  (`@/features/auth`, `@/widgets/main-layout`, `@/entities/session` …). 배럴 우회 deep import 금지.
- **shared 는 세그먼트 단위 배럴**: `@/shared/api`, `@/shared/config` 로 import. 단,
  `shared/ui` 의 Shadcn 프리미티브 평면 파일(`@/shared/ui/button`)과 `shared/lib`
  (`@/shared/lib/cn`)은 파일 직접 import 가 정석이다. 합성 공용 컴포넌트
  (Loading/PageHeader/StatCard)는 서브폴더 + `index.ts` 를 갖는다.
- **세그먼트 이름은 "왜"로**: `ui / api / model / lib / config`. (`components`, `hooks` 같은
  "무엇" 이름 금지.)
- 검사: `pnpm lint:fsd`(Steiger, `steiger.config.ts`). Stop 게이트와 CI에서 **위반 시 하드 실패**.

**새 슬라이스 추가 레시피**: ① 레이어 선택(화면=pages, 재사용 UI 블록=widgets, 사용자
액션=features, 도메인 모델=entities) → ② 슬라이스 폴더 + 세그먼트(`ui/api/model`) 작성 →
③ `index.ts` 배럴로 공개할 것만 export → ④ `pnpm lint:fsd` 로 경계 확인.

## UI (Shadcn/UI + Tailwind v4)

- **Tailwind v4**: 설정은 `tailwind.config.js` 가 아니라 CSS-first 입니다. `vite.config.ts` 의
  `@tailwindcss/vite` 플러그인 + `src/app/styles/index.css`(`@import 'tailwindcss'`, `@theme inline`,
  `:root`/`.dark` CSS 변수)로 구성됩니다.
- **Shadcn/UI**: `components.json`(style `new-york`, CSS 변수, alias)을 둡니다. 컴포넌트는
  `src/shared/ui` 에 둡니다. 새 컴포넌트는 `pnpm dlx shadcn@latest add <name>` 로 추가하거나
  기존 프리미티브 패턴을 따라 직접 작성합니다(평면 파일·배럴 없음·파일 직접 import).
  클래스 병합은 `@/shared/lib/cn` 의 `cn()` 을 씁니다.
- **다크 모드**: `ThemeProvider` 가 `themeStore`(persist)의 mode 를 구독해 `<html>` 에 `dark`
  클래스를 토글합니다(MUI createTheme 대신 Tailwind class 전략).
- **아이콘**: `lucide-react`. 토스트는 `sonner`(`components/ui/sonner` 의 `Toaster`).
- 플레이스홀더 매니페스트 아이콘은 `scripts/gen-icons.mjs`(의존성 없는 PNG 생성기)로 만듭니다.

## 아키텍처 / 상태 관리 규칙

- **서버 상태** → React Query. 컴포넌트에서 직접 `axios`를 호출하지 말고 각 feature 의
  React Query 훅(`@/features/auth`, `@/features/users` — `model` 세그먼트)을 거칩니다.
- **API 호출** → 각 feature 의 `api` 세그먼트(`features/*/api/*Api.ts`)에 Axios 함수로 정의.
  `@/shared/api` 의 `axiosInstance`가 요청 인터셉터로 토큰을 주입하고, 응답 인터셉터로
  401 시 인증 상태를 초기화하고 `/login`으로 보냅니다.

  ```typescript
  export const getUsers = async () => {
    const { data } = await axiosInstance.get<User[]>('/users');
    return data;
  };
  ```

- **⚠️ axios 인증 브리지(옵션 B)**: `shared/api/axiosInstance` 는 도메인 의존성이 0이며,
  토큰 getter·401 핸들러는 `src/app/config/configureAxios.ts` 가 `configureAuthBridge()` 로
  주입합니다(`app/App.tsx` 최상단 side-effect import). **이 import 를 제거하면 타입 에러 없이
  토큰 주입·401 리다이렉트가 조용히 무력화**되므로 제거 금지.
- **전역 클라이언트 상태** → Zustand. `authStore`(token/user, persist)는
  `@/entities/session`, `themeStore`(light/dark, persist)는 `@/features/theme`. React 외부
  (브리지)에서는 `getAuthToken()` / `clearAuthState()` 헬퍼로 접근합니다.
  **서버 데이터는 Zustand에 넣지 마세요.**
- **폼 / 검증** → React Hook Form + Zod. 스키마는 해당 feature 의 `model` 세그먼트에 정의하고
  (`features/auth/model/loginSchema.ts` 등) `zodResolver`로 연결합니다
  (`@/shared/ui/form` 의 Shadcn Form 래퍼 사용).

## 인증 & RBAC

- 로그인 성공 시 `authStore`(`@/entities/session`)에 `token`/`user`를 저장(persist)합니다.
- 라우트 가드는 `src/app/router`에 있습니다.
  - `ProtectedRoute` — 미인증 시 `/login` 리다이렉트.
  - `RoleRoute` — `allowedRoles` 미충족 시 `/403` 리다이렉트.
- 사이드바 메뉴는 `widgets/main-layout` 의 `Sidebar.tsx` `menuItems[].allowedRoles`로 역할
  필터링됩니다.
- 역할: `'admin' | 'manager' | 'user'`. `/users`는 `admin`/`manager`만 접근 가능합니다.
- RBAC는 프런트엔드(메뉴·라우트) 차원의 제어입니다. 실제 데이터 권한은 백엔드에서 강제해야 합니다.
- 라우트 가드, Axios 인터셉터의 토큰(브리지 주입), 인증 스토어가 서로 일관되게 유지되어야 합니다.

## 목 API (MSW)

- `VITE_ENABLE_MOCK=true` 일 때 `src/main.tsx`가 MSW 워커를 기동합니다.
- 핸들러는 `src/app/mocks/handlers.ts`(로그인/로그아웃/me/users), 시드 데이터는 `src/app/mocks/data.ts`.
- 테스트에서는 `src/app/mocks/server.ts`(setupServer)를 `vitest.setup.ts`가 기동합니다.
- 데모 계정과 환경 변수(`VITE_ENABLE_MOCK` / `VITE_API_BASE_URL`)는 `README.md` 와 `.env.example` 참고.

## PWA

- **PWA 확인**: 서비스 워커와 설치 프롬프트는 HTTPS 또는 `localhost`에서만 동작하며, `pnpm dev`로는
  **동작하지 않습니다**. PWA 동작은 항상 `pnpm build && pnpm preview`로 확인하세요.
- **빌드/SW**: `vite-plugin-pwa`(`vite.config.ts`)가 서비스 워커와 매니페스트를 생성합니다.
  업데이트 전략은 `registerType: 'prompt'` — 새 버전 감지 시 사용자에게 새로고침을 확인받습니다.
- **업데이트 알림/오프라인**: `src/widgets/pwa-badge`(`useRegisterSW`)가 새 버전
  알림과 오프라인 준비 안내를 처리합니다. `AppProviders` 에서 마운트됩니다.
- **에셋**: 매니페스트 아이콘/테마 색상은 `public/`의 192/512px(및 maskable) 에셋을 교체해
  커스터마이즈합니다(`scripts/gen-icons.mjs` 로 재생성 가능).

## 코드 컨벤션

- **타입 안정성 우선** — TypeScript 타입을 명확히 지정하고 `any` 사용을 지양합니다.
  `tsconfig`에 `strict`, `noUnusedLocals/Parameters`가 켜져 있습니다.
- **최소 보일러플레이트** — 불필요한 추상화를 피하고 간결하게 작성합니다.
- **ESLint + Prettier** — 모든 코드는 린트/포매팅 규칙을 통과해야 합니다 (`pnpm lint`, `pnpm format`).
  Shadcn/UI 프리미티브(`src/shared/ui/**`)는 컴포넌트와 variant 를 함께 export 하므로 해당
  디렉터리에 한해 `react-refresh/only-export-components` 규칙을 끕니다(`eslint.config.js`).
- **FSD 경계** — `pnpm lint:fsd`(Steiger)를 통과해야 합니다(레이어 의존 방향·Public API·
  cross-import). 위 "FSD 의존성 / Public API 규칙" 절 참고.
- **Husky + Lint-Staged** — 커밋 시 변경 파일에 자동으로 `eslint --fix` + `prettier`가 적용됩니다.

## Claude Code 자동화 (`.claude/`)

`.claude/settings.json` 이 훅을 등록한다. 코드를 만질 때 아래 동작을 전제로 한다.

- **SessionStart** → `session-context.sh`: 브랜치·Shadcn·PWA 가이드라인 등 컨텍스트를 주입.
- **PreToolUse(Bash)** → `guard-bash.sh`: 파괴적 명령(`rm -rf /`, force push, `reset --hard` 등)을 차단.
- **PostToolUse(Edit/Write)** → `format-changed-file.sh`(변경 `*.ts(x)` 에 `eslint --fix` + `prettier`,
  Tailwind 클래스 정렬 포함) + `check-pwa.sh`(매니페스트/SW 설정 검증).
- **Stop** → `gate.sh`: 세션 종료 전 `tsc -b --noEmit` + `eslint .` + `prettier --check .` +
  `vitest run` + `pnpm lint:fsd`(Steiger) 게이트. 실패하면 `exit 2` 로 계속 수정을 유도한다.
  `stop_hook_active` 무한루프 가드와 `cd "$CLAUDE_PROJECT_DIR"` cwd 가드 포함.
- `.claude/agents/code-reviewer.md`, `.claude/skills/code-review/`(FSD 경계 점검 포함)가 함께 제공된다.
- **잔여(백로그, 후속 컨텍스트에서 진행)**: `/tdd` 스킬, coverage 임계값 ratchet.

## 배포 (인프라)

`Dockerfile`(빌드 → `nginx:1.27` 서빙) + `nginx.conf`(SPA fallback, 정적 에셋 캐싱, 서비스 워커
no-cache)로 프로덕션 컨테이너를 구성한다. CI는 `.github/workflows/ci.yml`(lint → test → build).

## 로드맵

- [x] **admin 수준 보일러플레이트 도달** — 스캐폴딩 · PWA 코어 · UI(Shadcn/Tailwind) · 데이터 레이어 ·
      인증/RBAC · MSW · 테스트 · 인프라(Storybook/Docker/CI) 구현 완료.
- [x] **FSD 마이그레이션** — 6레이어 재배치 + Steiger 하드 강제 + 게이트 강화 완료.
- [ ] **파리티 이후** — Push Notification · Offline Data Sync · i18n · Social Login.

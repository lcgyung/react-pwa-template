---
paths:
  - 'src/**'
---

# FSD 아키텍처 & 상태 관리 규칙

> 강제의 정본은 `steiger.config.ts`(`pnpm lint:fsd` — CI·Stop 게이트에서 하드 강제)와
> `eslint.config.js`(`no-restricted-imports` 등)다. 이 문서는 그 규칙의 해설·요약이며,
> 충돌 시 설정이 우선한다. 결정 배경:
> [ADR 0001 FSD 아키텍처](../../docs/adr/0001-fsd-architecture.md) ·
> [ADR 0002 상태 관리](../../docs/adr/0002-state-management.md)

[Feature-Sliced Design 2.x](https://feature-sliced.design) 정석 6레이어 구조를 따른다.

## FSD 의존성 규칙

- **레이어 단방향**: `app > pages > widgets > features > entities > shared`. 모듈은 자기보다
  **엄격히 아래** 레이어만 import할 수 있다.
- **같은 레이어 슬라이스 간 import 금지**. 유일한 예외는 `@x` 크로스임포트 API —
  `entities/session`은 `@/entities/user/@x/session`에서 `User`를 가져온다.
- **Public API**: 슬라이스 간 import는 반드시 `index.ts` 배럴 경유(`@/features/auth`,
  `@/widgets/main-layout` 등 — 내부 깊은 경로 우회 금지). `shared`는 세그먼트 배럴 경유
  (`@/shared/api`, `@/shared/config`; `@/shared/ui/<Name>`, `@/shared/lib/<name>`은 파일 직접 import).
- **세그먼트 이름은 "왜"로**: `ui / api / model / lib / config`. `components`/`hooks` 같은
  "무엇" 이름 금지.

## 상태 관리 규칙

- **서버 상태** → React Query. 컴포넌트에서 직접 `axios`를 호출하지 말고 `features/*`의
  React Query 훅(`useAuth`, `useUsers`)을 거친다. `no-restricted-imports`가 `api/` 세그먼트 밖에서
  `axiosInstance` import를 **error로 차단**한다.
- **오프라인 persist(RQ)** — 쿼리 캐시는 `app/providers/queryPersist.ts`가 localStorage에 persist
  한다([ADR 0007](../../docs/adr/0007-react-query-offline-persist.md)). 세션 의존 쿼리는
  `meta: { persist: false }`로 옵트아웃(`useMe` 참고). `gcTime`(24h)은 persist `maxAge` 이상 유지
  — 줄이면 dehydrate 대상에서 빠져 persist가 조용히 무력화된다.
- **API 호출** → `features/*/api`의 Axios 레이어 함수로 정의(슬라이스 내부용, 배럴 미노출).
  `shared/api`의 `axiosInstance`가 요청 인터셉터로 토큰을 주입하고, 응답 인터셉터로 401 시
  인증 상태를 초기화하고 `/login`으로 보낸다. 파일 골격·예시 코드는
  [`slice-blueprint.md`](slice-blueprint.md) 참고.
- **⚠️ axios 인증 브리지** — `shared/api/axiosInstance`는 도메인 의존성 0이며, 토큰 getter·401
  핸들러는 `src/app/config/configureAxios.ts`가 `configureAuthBridge()`로 주입한다
  (`app/App.tsx` 최상단 side-effect import). 이 import를 제거하면 타입 에러 없이 토큰 주입·401
  리다이렉트가 조용히 무력화되므로 제거 금지.
- **전역 클라이언트 상태** → Zustand. `entities/session`(authStore: token/user, persist),
  `features/theme`(themeStore: light/dark, persist). React 외부(주입 콜백)에서는
  `getAuthToken()` / `clearAuthState()` 헬퍼로 접근한다. **서버 데이터는 Zustand에 넣지 않는다.**
- **폼 / 검증** → React Hook Form + Zod. 스키마는 해당 feature의 `model` 세그먼트에 정의하고
  (`features/auth/model/loginSchema.ts`, `features/users/model/userFormSchema.ts`)
  `zodResolver`로 연결한다(`@/shared/ui/form`의 Shadcn Form 래퍼 사용).

## 인증 & RBAC

- 로그인 성공 시 `authStore`(`entities/session`)에 `token`/`user`를 저장(persist)한다.
- 라우트 가드는 `src/app/router`: `ProtectedRoute`(미인증 → `/login`),
  `RoleRoute`(`allowedRoles` 미충족 → `/403`).
- 사이드바 메뉴는 `widgets/main-layout/ui/Sidebar.tsx`의 `menuItems[].allowedRoles`로 역할 필터링.
- 역할: `'admin' | 'manager' | 'user'`. `/users`는 `admin`/`manager`만 접근 가능.

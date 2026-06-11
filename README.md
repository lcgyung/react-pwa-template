# React PWA Template

React + TypeScript + Vite 기반 PWA 템플릿. Shadcn/UI, React Query, Zustand, React Hook Form으로 모바일 웹·SaaS·MVP를 빠르게 구축하고, 설치형(홈 화면 추가)·오프라인 앱 경험을 제공합니다.

## Stack

React · TypeScript · Vite · vite-plugin-pwa · Shadcn/UI · Tailwind CSS · React Router · React Query · Axios · Zustand · React Hook Form · Zod · Dayjs · MSW · Vitest · Playwright · ESLint · Prettier · Husky · Storybook

## Features

- PWA: 홈 화면 설치(설치 프롬프트) · 오프라인 캐싱 · Service Worker · 자동 업데이트 알림
- Shadcn/UI + Tailwind CSS, 모바일 우선 반응형
- 인증 (로그인/로그아웃, 토큰 저장, 보호된 라우트)
- RBAC 기반 메뉴·라우트 접근 제어 (`admin` / `manager` / `user`)
- Axios API Layer (인터셉터로 토큰 주입 · 401 처리 · 공통 에러)
- React Query 서버 상태 관리
- Zustand 전역 상태 관리 (persist)
- React Hook Form + Zod 검증
- 다크 모드 (Tailwind + persist)
- MSW 목 API (백엔드 없이 즉시 동작)
- 환경 변수 검증 (Zod, 부팅 시 조기 실패)
- Vitest + Testing Library · Playwright E2E (로그인 스모크 · 오프라인 시나리오)
- ESLint + Prettier + Husky + Lint-Staged
- Storybook · Docker (nginx) · GitHub Actions CI (lint · FSD · 테스트 · 빌드 · CodeQL · gitleaks · SCA · Lighthouse · E2E) · Dependabot
- 보안: CSP·보안 헤더(nginx) · CodeQL SAST · SCA(`pnpm audit` + osv) · dist 시크릿 스캔 · 로그아웃 시 캐시/IndexedDB 정리 — [`SECURITY.md`](SECURITY.md)

## Quick Start

```bash
git clone https://github.com/<owner>/react-pwa-template.git
cd react-pwa-template
pnpm install
cp .env.example .env
pnpm dev
```

> 패키지 매니저는 **pnpm** 입니다.

기본값(`VITE_ENABLE_MOCK=true`)으로 MSW 목 API가 켜져 있어 백엔드 없이 바로 로그인할 수 있습니다.

> PWA(Service Worker·설치 프롬프트)는 `pnpm build && pnpm preview`로 확인하세요.
> Service Worker는 HTTPS 또는 localhost에서만 동작하며 `pnpm dev`로는 동작하지 않습니다.

**데모 계정** (비밀번호 모두 `password`)

| 이메일              | 역할    | 비고                 |
| ------------------- | ------- | -------------------- |
| admin@example.com   | admin   | 전체 메뉴            |
| manager@example.com | manager | 사용자 메뉴 접근     |
| user@example.com    | user    | `/users` 접근 시 403 |

## Scripts

```bash
pnpm dev              # 개발 서버
pnpm build            # 프로덕션 빌드 (타입체크 포함)
pnpm build:analyze    # 번들 분석 리포트 생성 (dist/stats.html)
pnpm preview          # 빌드 미리보기 (PWA 동작 확인)
pnpm lint             # 린트
pnpm lint:fsd         # FSD 레이어 경계 검사 (Steiger)
pnpm test             # 단위/컴포넌트 테스트 (Vitest)
pnpm test:e2e         # E2E 테스트 (Playwright — build+preview 위에서 실행)
pnpm storybook        # Storybook (port 6006)
```

## Environment

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_MOCK=true   # MSW 목 API. 실제 백엔드 연동 시 false
```

`.env.development` / `.env.production`으로 모드별 분리. 값은 `.env.example` 참고. 환경 변수는 부팅
시 `src/shared/config/env.ts`(Zod)가 검증하여 오타·잘못된 값을 즉시 에러로 드러냅니다.

> Playwright E2E 는 결정적 실행을 위해 빌드 단계에서 `VITE_ENABLE_MOCK=false` 로 강제합니다(로그인은
> route 스텁, 오프라인은 PWA SW 로 검증).

## PWA

- 설치형 앱 (Add to Home Screen) · 오프라인 지원 · 백그라운드 에셋 캐싱
- 업데이트 전략: `vite-plugin-pwa`의 `registerType: 'prompt'` — 새 버전 감지 시
  `PWABadge`(`src/widgets/pwa-badge`)가 새로고침을 확인받는 알림을 띄움
- 설치 프롬프트: `beforeinstallprompt` 를 캡처해 설치 버튼을 노출(`src/features/pwa-install`,
  iOS 는 이벤트 미지원이라 표시되지 않음)
- 캐싱: precache(앱 셸) + 런타임 캐싱(교차 출처 이미지/폰트는 `CacheFirst`, `/api` 는 `NetworkOnly`).
  오프라인 폴백 페이지는 `public/offline.html`. 자세한 전략은 [`docs/adr/0003`](docs/adr/0003-pwa-caching-strategy.md)
- 아이콘·테마 색상은 `public/` 의 매니페스트 에셋(192/512px, maskable) 교체로 커스터마이즈
  (`scripts/gen-icons.mjs` 로 플레이스홀더 재생성 가능)
- SW·설치·오프라인 동작은 `pnpm build && pnpm preview`(HTTPS/localhost) 또는 `pnpm test:e2e` 로만 확인 가능

## Structure

[FSD(Feature-Sliced Design) 2.x](https://feature-sliced.design) 6레이어 구조. 위 레이어는 아래
레이어만 import 할 수 있고(`app > pages > widgets > features > entities > shared`), 슬라이스 간
import 는 각 슬라이스의 `index.ts`(Public API)를 경유합니다. 경계는 `pnpm lint:fsd`(Steiger)가
CI에서 강제합니다.

```text
src
├── app          # 전역 설정 — providers, router(가드), mocks(MSW), styles, config(axios 브리지)
├── pages        # 라우트 화면 슬라이스 (login, dashboard, users, forbidden, not-found)
├── widgets      # 페이지 독립 합성 UI (main-layout[사이드바+헤더], auth-layout, pwa-badge)
├── features     # 사용자 기능 (auth: 로그인/세션 훅 · users: 조회/생성 · theme: 다크모드)
├── entities     # 도메인 모델 (user: User/Role 타입 · session: 인증 스토어)
└── shared       # 도메인 무관 인프라 (api: axios · ui: Shadcn 프리미티브 · lib: cn/format · config: paths)
```

## API Example

```typescript
export const getUsers = async () => {
  const { data } = await axiosInstance.get<User[]>('/users');
  return data;
};
```

요청·응답 인터셉터로 토큰 주입과 401 리다이렉트를 처리합니다(인증 헬퍼는
`src/app/config/configureAxios.ts`에서 주입). 컴포넌트는 axios를 직접 호출하지 않고
각 feature 의 React Query 훅(`@/features/auth`, `@/features/users`)을 거칩니다.

## Roadmap

admin 수준 보일러플레이트(스캐폴딩 · PWA · UI · 데이터 레이어 · 인증/RBAC · MSW · 테스트 · 인프라)는 **구현 완료**.

향후 기능(파리티 이후): Social Login · Push Notification · Offline Data Sync · i18n

## Contributing

브랜치 전략·커밋 컨벤션(Conventional Commits)·버전 규칙(SemVer)은 [`CONTRIBUTING.md`](CONTRIBUTING.md),
보안 정책·위협 모델·취약점 신고는 [`SECURITY.md`](SECURITY.md), 변경 이력은
[`CHANGELOG.md`](CHANGELOG.md)를 참고하세요. 주요 설계 결정은 [`docs/adr/`](docs/adr), 사용 중인
Shadcn 컴포넌트 목록·갱신 절차는 [`docs/shadcn-components.md`](docs/shadcn-components.md)에 정리돼
있습니다.

## License

MIT

# React PWA Template

React + TypeScript + Vite 기반 PWA 템플릿. Shadcn/UI, React Query, Zustand, React Hook Form으로 모바일 웹·SaaS·MVP를 빠르게 구축하고, 설치형(홈 화면 추가)·오프라인 앱 경험을 제공합니다.

> 구현 현황과 단계별 작업 계획은 [`docs/roadmap.md`](docs/roadmap.md)를 참고하세요.

## Stack

React · TypeScript · Vite · vite-plugin-pwa · Shadcn/UI · Tailwind CSS · React Router · React Query · Axios · Zustand · React Hook Form · Zod · Dayjs · MSW · Vitest · ESLint · Prettier · Husky · Storybook

## Features

- PWA: 홈 화면 설치 · 오프라인 캐싱 · Service Worker · 자동 업데이트 알림
- Shadcn/UI + Tailwind CSS, 모바일 우선 반응형
- 인증 (로그인/로그아웃, 토큰 저장, 보호된 라우트)
- RBAC 기반 메뉴·라우트 접근 제어 (`admin` / `manager` / `user`)
- Axios API Layer (인터셉터로 토큰 주입 · 401 처리 · 공통 에러)
- React Query 서버 상태 관리
- Zustand 전역 상태 관리 (persist)
- React Hook Form + Zod 검증
- 다크 모드 (Tailwind + persist)
- MSW 목 API (백엔드 없이 즉시 동작)
- Vitest + Testing Library
- ESLint + Prettier + Husky + Lint-Staged
- Storybook · Docker (nginx) · GitHub Actions CI

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
pnpm preview          # 빌드 미리보기 (PWA 동작 확인)
pnpm lint             # 린트
pnpm test             # 테스트
pnpm storybook        # Storybook (port 6006)
```

## Environment

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_MOCK=true   # MSW 목 API. 실제 백엔드 연동 시 false
```

`.env.development` / `.env.production`으로 모드별 분리. 값은 `.env.example` 참고.

## PWA

- 설치형 앱 (Add to Home Screen) · 오프라인 지원 · 백그라운드 에셋 캐싱
- 업데이트 전략: `vite-plugin-pwa`의 `registerType: 'autoUpdate'` (또는 `prompt`로 사용자 확인)
- 아이콘·테마 색상은 `public/` 의 매니페스트 에셋(192/512px, maskable) 교체로 커스터마이즈
- SW·설치 동작은 `pnpm build && pnpm preview`(HTTPS/localhost)에서만 확인 가능

## Structure

```text
src
├── api          # axios 인스턴스, 인터셉터, 요청 함수
├── assets
├── components   # Shadcn/UI 기반 재사용 UI
├── hooks        # React Query 훅
├── layouts      # MainLayout(사이드바+헤더), AuthLayout
├── mocks        # MSW 핸들러 · 시드 데이터
├── pages        # 라우트 단위 페이지
├── providers    # Query / Theme Provider
├── routes       # 라우트 정의 + 가드 (Protected / Role)
├── schemas      # zod 스키마
├── stores       # zustand (auth / theme)
├── styles       # Tailwind 엔트리 CSS
├── types
└── utils
```

## API Example

```typescript
export const getUsers = async () => {
  const { data } = await axiosInstance.get<User[]>('/users');
  return data;
};
```

요청·응답 인터셉터로 토큰 주입과 401 리다이렉트를 처리합니다. 컴포넌트는 axios를 직접
호출하지 않고 `src/hooks`의 React Query 훅을 거칩니다.

## Roadmap

향후 기능(파리티 이후): Social Login · Push Notification · Offline Data Sync · i18n

admin 수준 보일러플레이트 도달을 위한 단계별 구현 계획은 [`docs/roadmap.md`](docs/roadmap.md)를 참고하세요.

## License

MIT

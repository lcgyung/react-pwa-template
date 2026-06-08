# React PWA Template

React + TypeScript + Vite 기반 PWA 템플릿. Shadcn/UI, React Query, Zustand로 모바일 웹·SaaS·MVP를 빠르게 구축하고 설치형 앱 경험을 제공합니다.

## Stack

React · TypeScript · Vite · vite-plugin-pwa · Shadcn/UI · Tailwind CSS · React Router · React Query · Axios · Zustand · React Hook Form · Zod · Dayjs · Vitest · ESLint · Prettier · Husky

## Features

- PWA: 홈 화면 설치 · 오프라인 캐싱 · Service Worker · 자동 업데이트 알림
- Shadcn/UI + Tailwind CSS, 모바일 우선 반응형
- 인증 (로그인/로그아웃, 보호된 라우트)
- Axios API Layer (인터셉터로 토큰 주입 · 401 처리)
- React Query 서버 상태 · Zustand 전역 상태
- React Hook Form + Zod 검증
- Vitest + Testing Library
- ESLint + Prettier + Husky + Lint-Staged

## Quick Start

```bash
git clone https://github.com/<owner>/react-pwa-template.git
cd react-pwa-template
npm install
cp .env.example .env
npm run dev
```

> PWA(Service Worker·설치 프롬프트)는 `npm run build && npm run preview`로 확인하세요.
> Service Worker는 HTTPS 또는 localhost에서만 동작합니다.

## Scripts

```bash
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 미리보기 (PWA 동작 확인)
npm run lint      # 린트
npm run test      # 테스트
```

## Environment

```env
VITE_API_BASE_URL=http://localhost:3000
```

## PWA

- 설치형 앱 (Add to Home Screen) · 오프라인 지원 · 백그라운드 에셋 캐싱
- 업데이트 전략: `vite-plugin-pwa`의 `registerType: 'autoUpdate'` (또는 `prompt`로 사용자 확인)
- 아이콘·테마 색상은 `public/` 의 매니페스트 에셋(192/512px, maskable) 교체로 커스터마이즈

## Structure

```text
src
├── api          # axios 인스턴스, 인터셉터
├── assets
├── components
├── hooks
├── layouts
├── pages
├── providers
├── routes
├── schemas      # zod
├── stores       # zustand
├── styles
├── types
└── utils
```

## API Example

```typescript
export const getUsers = () => axiosInstance.get('/users');
```

## Roadmap

Social Login · Push Notification · Offline Data Sync · Dark Mode · i18n · Storybook · Docker · GitHub Actions

## License

MIT

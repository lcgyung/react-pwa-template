# React PWA Template

React, TypeScript, Vite 기반의 Progressive Web App(PWA) 템플릿입니다.

Shadcn/UI, React Query, Zustand를 활용하여 모바일 웹, SaaS, MVP, 서비스 랜딩 페이지 및 PWA 애플리케이션을 빠르게 구축할 수 있도록 설계되었습니다.

---

## 🚀 Tech Stack

* React
* TypeScript
* Vite
* PWA (vite-plugin-pwa)
* Shadcn/UI
* Tailwind CSS
* React Router
* React Query
* Axios
* Zustand
* React Hook Form
* Zod
* Dayjs
* ESLint
* Prettier
* Husky
* Lint-Staged

---

## ✨ Features

* TypeScript 기반 개발 환경
* PWA 지원
* 홈 화면 설치(Add to Home Screen)
* 오프라인 캐싱 지원
* Shadcn/UI 기반 UI 시스템
* Tailwind CSS 기반 스타일링
* React Query 서버 상태 관리
* Zustand 전역 상태 관리
* Axios API Layer
* React Hook Form + Zod Validation
* ESLint + Prettier 적용
* Husky + Lint-Staged Git Hooks
* 모바일 우선 반응형 UI

---

## 🤔 Why This Template?

* 빠른 MVP 개발
* 모바일 우선 설계
* PWA 기반 앱 경험 제공
* 타입 안정성 보장
* 최소한의 보일러플레이트
* 유지보수 용이성

---

## 📂 Project Structure

```text
src
├── api
├── assets
├── components
├── hooks
├── layouts
├── pages
├── providers
├── routes
├── schemas
├── stores
├── styles
├── types
└── utils
```

---

## 📦 Installation

```bash
git clone <repository-url>

cd react-pwa-template

npm install
npm run dev
```

---

## ⚙️ Environment

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 📱 PWA Features

* Installable Application
* Offline Support
* Service Worker
* App Manifest
* Background Asset Caching
* Mobile Friendly UX

---

## 📡 API Example

```typescript
export const getUsers = () => {
  return axiosInstance.get('/users');
};
```

---

## 📝 Validation Example

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

---

## 🗺 Roadmap

* [ ] Authentication
* [ ] Social Login
* [ ] Push Notification
* [ ] Offline Data Sync
* [ ] Dark Mode
* [ ] i18n
* [ ] Storybook
* [ ] Docker
* [ ] GitHub Actions

---

## 📄 License

MIT License

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 현재 상태: 아직 스캐폴딩 전

이 저장소에는 현재 `README.md`(한글)와 `LICENSE` 두 파일만 존재합니다. 아래에 설명한 애플리케이션 코드는 **아직 존재하지 않습니다** — `package.json`, `src/`, 각종 설정 파일, `.env.example` 모두 없습니다. README는 *의도된* 프로젝트를 문서화한 것입니다. 코드를 스캐폴딩하거나 추가할 때는 README를 스택 선택과 디렉터리 구조의 기준으로 삼고, 실제 코드가 들어오면 이 파일도 함께 최신 상태로 유지하세요.

## 의도된 프로젝트

설치형(홈 화면에 추가) · 오프라인 지원 경험을 갖춘 모바일 웹 / SaaS / MVP 앱을 빠르게 만들기 위한 React + TypeScript + Vite 기반 **PWA 템플릿**.

### 계획된 스택

React · TypeScript · Vite · vite-plugin-pwa · Shadcn/UI · Tailwind CSS · React Router · React Query(서버 상태) · Axios · Zustand(전역 상태) · React Hook Form + Zod(폼/검증) · Dayjs · Vitest + Testing Library · ESLint · Prettier · Husky + lint-staged

### 계획된 명령어 (README 기준 — 스캐폴딩 전까지는 동작하지 않음)

```bash
npm install
cp .env.example .env
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 미리보기 — PWA(서비스 워커 + 설치 프롬프트) 확인에 필요
npm run lint
npm run test
```

테스트 도구를 구성할 때는 별도의 커스텀 스크립트를 만들기보다 Vitest의 표준 단일 테스트 실행 방식(`npx vitest run <경로>` / `-t "<이름>"`)을 사용하세요.

### 환경 변수

`VITE_API_BASE_URL` (예: `http://localhost:3000`) — Axios 레이어에 주입되는 base URL.

## 아키텍처 참고 (여러 파일에 걸친 부분)

다음은 제대로 잡아야 하는 횡단 관심사들입니다. 나머지 구조는 일반적인 관례를 따릅니다.

- **PWA 확인**: 서비스 워커와 설치 프롬프트는 HTTPS 또는 `localhost`에서만 동작하며, `npm run dev`로는 **동작하지 않습니다**. PWA 동작은 항상 `npm run build && npm run preview`로 확인하세요. 업데이트 전략은 `vite-plugin-pwa`의 `registerType`(`autoUpdate`, 또는 사용자 확인이 필요하면 `prompt`)을 따릅니다. 매니페스트 아이콘/테마 색상은 `public/`의 192/512px(및 maskable) 에셋을 교체해 커스터마이즈합니다.
- **API 레이어** (`src/api`): 요청 시 인증 토큰을 주입하고 `401` 응답을 중앙에서 처리하는 인터셉터를 가진 단일 Axios 인스턴스. 새로운 API 호출은 Axios/fetch를 직접 호출하지 말고 이 인스턴스를 통하도록 하세요.
- **상태 분리**: 서버 상태는 React Query(쿼리/뮤테이션 + 캐시)에, 클라이언트/전역 상태는 Zustand 스토어(`src/stores`)에 둡니다. 서버 데이터는 Zustand에 넣지 마세요.
- **인증 + 보호된 라우트**: `src/routes`의 라우트 가드를 통한 로그인/로그아웃 흐름. 라우트 가드, Axios 인터셉터의 토큰, 인증 스토어가 서로 일관되게 유지되어야 합니다.
- **폼**: Zod 리졸버를 사용하는 React Hook Form. 검증 스키마는 `src/schemas`에 두며, 해당 폼의 형태(shape)에 대한 단일 기준이 되어야 합니다.

### 의도된 디렉터리 구조 (`src/`)

`api`(axios 인스턴스 + 인터셉터) · `assets` · `components` · `hooks` · `layouts` · `pages` · `providers` · `routes` · `schemas`(zod) · `stores`(zustand) · `styles` · `types` · `utils`

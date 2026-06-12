# Shadcn/UI 컴포넌트 추적

`src/shared/ui` 에 둔 UI 자산 목록과 갱신 절차. Shadcn/UI 는 패키지가 아니라 **복사해 소유하는 코드**
이므로, 업스트림 변경은 자동 반영되지 않는다. 어떤 프리미티브를 들였는지 한곳에서 추적한다.

설정: `components.json`(style `new-york`, CSS 변수, alias). Tailwind v4 는 CSS-first 이므로 설정은
`src/app/styles/index.css`(`@theme inline` + `:root`/`.dark` 변수)에 있다. 클래스 병합은
`@/shared/lib/cn` 의 `cn()` 을 쓴다.

## 프리미티브 (평면 파일 · 파일 직접 import)

업스트림 표준을 그대로 따른다(컴포넌트+variant 동시 export, `function` 선언). `eslint.config.js` 가
`src/shared/ui/**` 에 한해 `react-refresh/only-export-components` 와
`react/function-component-definition` 을 끈다.

| 컴포넌트         | 파일                | 비고                                   |
| ---------------- | ------------------- | -------------------------------------- |
| Alert            | `alert.tsx`         | 로그인 에러 배너 등                    |
| Avatar           | `avatar.tsx`        | Radix avatar                           |
| Badge            | `badge.tsx`         | 역할 표시 등                           |
| Button           | `button.tsx`        | `buttonVariants`(cva) 포함             |
| Card             | `card.tsx`          | 로그인/대시보드 카드                   |
| Dropdown Menu    | `dropdown-menu.tsx` | 사용자 메뉴(헤더)                      |
| Form             | `form.tsx`          | RHF + Zod 래퍼(`FormField` 등)         |
| Input            | `input.tsx`         |                                        |
| Label            | `label.tsx`         |                                        |
| Sheet            | `sheet.tsx`         | 모바일 사이드바 드로어                 |
| Sonner (Toaster) | `sonner.tsx`        | 토스트 — 테마는 AppProviders 에서 주입 |
| Table            | `table.tsx`         | 사용자 목록                            |

## 합성 공용 컴포넌트 (서브폴더 + `index.ts`)

도메인 무관하지만 프로젝트 고유 조합. `@/shared/ui/<Name>` 으로 import.

| 컴포넌트      | 폴더             | 용도                                    |
| ------------- | ---------------- | --------------------------------------- |
| Loading       | `Loading/`       | 스피너(Suspense fallback, 쿼리 로딩)    |
| PageHeader    | `PageHeader/`    | 페이지 제목/설명/액션 헤더              |
| StatCard      | `StatCard/`      | 대시보드 지표 카드                      |
| ErrorFallback | `ErrorFallback/` | ErrorBoundary 폴백(role=alert + 재시도) |

## 갱신 절차

새 프리미티브 추가:

```bash
pnpm dlx shadcn@latest add <name>   # src/shared/ui 에 평면 파일로 추가됨
```

또는 기존 패턴을 따라 직접 작성(평면 파일·배럴 없음·파일 직접 import). 추가/업그레이드 후:

1. 이 문서의 표에 항목을 추가/갱신한다.
2. `pnpm lint && pnpm exec tsc -b --noEmit` 로 회귀를 확인한다.
3. 클래스는 `cn()` 으로 병합하고, 색은 하드코딩 대신 디자인 토큰(CSS 변수)을 쓴다.

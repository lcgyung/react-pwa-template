---
paths:
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
  - '.storybook/**'
---

# 코드 스타일 컨벤션

> 강제의 정본은 `eslint.config.js`(+`tsconfig`의 strict)다. 이 문서는 그 규칙의 해설·요약이며,
> 충돌 시 린트 설정이 우선한다. 모든 코드는 `pnpm lint`, `pnpm format`을 통과해야 한다.

- **타입 안정성 우선** — TypeScript 타입을 명확히 지정하고 `any` 사용을 지양한다.
  `tsconfig`에 `strict`, `noUnusedLocals/Parameters`가 켜져 있다.
- **최소 보일러플레이트** — 불필요한 추상화를 피하고 간결하게 작성한다.
- **컴포넌트 선언은 화살표 함수** — `react/function-component-definition`이 `const X = () => …`를
  강제한다(autofix). `default export`는 쓰지 않고 named export로 통일한다(`local/no-default-export`가
  **error로 차단** — Storybook meta·`*.config.ts`·`.storybook/**`는 예외). props는
  `interface NameProps`(PascalCase)로 정의한다. 단, `src/shared/ui`의 Shadcn 프리미티브는 컴포넌트와
  variant(cva)·훅을 함께 export 하고 `function` 선언을 쓰는 업스트림 표준을 따르므로 해당 디렉터리만
  관련 룰을 끈다.
- **네이밍** — 컴포넌트/타입 `PascalCase`, 훅 `use*`, 함수/변수 `camelCase`, 모듈 상수 `UPPER_CASE`,
  상수 객체(queryKeys 등) `camelCase`. `@typescript-eslint/naming-convention`이 **error로 강제**한다
  (객체 리터럴 키·import 별칭은 false positive 방지로 미강제).
- **import 정렬(자동)** — `simple-import-sort`가 `side-effect → 외부 → @/ 레이어(app→shared) → 상대경로`
  순으로 자동 정렬한다. 수동으로 맞추지 말고 `--fix`에 맡긴다. 단, side-effect import
  (`import '@/app/config/configureAxios'`)는 정렬 장벽으로 위치가 보존된다.
- **queryKey는 객체 패턴** — React Query 키는 `userKeys`/`authKeys` 같은 상수 객체로 관리하고,
  배열 리터럴을 하드코딩하지 않는다. `local/query-key-object`가 `queryKey: [...]` 리터럴을 **error로 차단**한다.
- **enum 단일 출처** — `Role` 등 도메인 값은 `entities`의 `ROLES`(`entities/user`)를 단일 출처로
  재사용한다(`z.enum(ROLES)`). 문자열 배열 중복 정의 금지.
- **스타일(shadcn/Tailwind v4)** — 클래스 병합은 `@/shared/lib/cn`의 `cn()`(clsx + tailwind-merge)을
  쓴다. 색·간격·타이포는 Tailwind 유틸리티와 디자인 토큰(CSS 변수, `src/app/styles/index.css`의
  `:root`/`.dark`)으로 표현하고, 임의값(`bg-[#fff]`) 하드코딩을 지양한다. 클래스 정렬은
  `prettier-plugin-tailwindcss`가, 미사용/오타 점검은 `better-tailwindcss`(warn)가 담당한다.
  다크 모드는 `ThemeProvider`가 `<html>`에 `dark` 클래스를 토글하는 Tailwind class 전략을 쓴다.
  > admin-template의 MUI `sx` 전용 `#hex` 금지 룰(`no-restricted-syntax`)은 이식하지 않는다 — pwa는
  > 색 단일소스가 CSS 변수이고 임의값이 className 문자열이라 bare `#hex` literal 규칙의 표면적이 없다.
  > 디자인 토큰 강제는 위 Tailwind/CSS 변수 + `better-tailwindcss`로 충족한다.
- **접근성(a11y)** — `eslint-plugin-jsx-a11y` recommended를 강제한다. 인터랙티브 요소의
  label/aria/role·키보드 접근 위반은 린트에서 막힌다. Radix 기반 프리미티브의 포커스·키보드 동작을 보존한다.
- **JSDoc 범위** — JSDoc/주석은 공개 API(배럴로 노출되는 함수·훅)와 비자명한 로직·함정(gotcha)에
  한정한다(예: `shared/api/axiosInstance.ts`의 인증 브리지 주석). 자명한 컴포넌트엔 생략한다.

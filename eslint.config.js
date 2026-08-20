import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import nounsanitized from 'eslint-plugin-no-unsanitized';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import security from 'eslint-plugin-security';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// 프로젝트 고유 "파일 구현" 구조 규칙 — 외부 의존성 없이 flat config 안의 로컬 플러그인으로 정의한다.
// 폴더 구조는 steiger 가, 파일 내부 구현(queryKey 객체·named export)은 아래 룰이 error 로 하드 강제한다.
const local = {
  rules: {
    // queryKey 배열 리터럴 금지 → userKeys/authKeys 같은 상수 객체를 강제(중복 키·무효화 누락 방지).
    'query-key-object': {
      meta: {
        type: 'problem',
        docs: { description: 'queryKey 는 상수 객체로 관리한다(배열 리터럴 금지)' },
        schema: [],
      },
      create: (context) => ({
        "Property[key.name='queryKey'] > ArrayExpression": (node) => {
          context.report({
            node,
            message:
              'queryKey 는 userKeys/authKeys 같은 상수 객체로 관리하세요(배열 리터럴 하드코딩 금지).',
          });
        },
      }),
    },
    // default export 금지 → named export 통일. 스토리·설정 파일은 아래 override 로 예외.
    'no-default-export': {
      meta: {
        type: 'problem',
        docs: { description: 'default export 금지(named export 통일)' },
        schema: [],
      },
      create: (context) => ({
        ExportDefaultDeclaration: (node) => {
          context.report({ node, message: 'default export 금지 — named export 를 사용하세요.' });
        },
      }),
    },
    // orval 생성 도메인 훅/DTO 의 ui 직접 import 차단 → model/api/lib 래퍼 경유 강제(ADR-0006 의
    // "생성물은 손으로 고치지 않는다"를 소비 측 게이트로 승격). `@/shared/api` 배럴은 손작성 인프라
    // (allowlist)와 생성 DTO 를 함께 재노출하므로, allowlist 밖 심볼 = 생성물로 보고 차단한다
    // (이름 패턴보다 견고 — 새 DTO 가 늘어도 자동으로 잡힌다). 래퍼 세그먼트 한정 적용은 아래
    // config 블록의 files/ignores 가 맡는다.
    'no-generated-api-outside-wrapper': {
      meta: {
        type: 'problem',
        docs: {
          description: '생성 도메인 훅/DTO 는 model/api/lib 래퍼에서만 import(ui 직접 금지)',
        },
        schema: [],
      },
      create: (context) => {
        // `@/shared/api` 가 노출하는 손작성(비생성) 심볼. 나머지는 전부 orval 생성물.
        const HAND_WRITTEN = new Set([
          'axiosInstance',
          'configureAuthBridge',
          'ApiErrorResponse',
          'Paginated',
        ]);
        const message =
          '생성 도메인 훅/DTO 는 model/api/lib 래퍼에서만 소비하세요. 컴포넌트는 래퍼 훅(useAuth·useUsers)을 거칩니다.';
        return {
          "ImportDeclaration[source.value='@/shared/api']": (node) => {
            for (const spec of node.specifiers) {
              // 네임스페이스 import(import * as)는 생성 심볼 전체를 끌어오므로 차단.
              if (spec.type === 'ImportNamespaceSpecifier') {
                context.report({ node: spec, message });
                continue;
              }
              if (spec.type !== 'ImportSpecifier') continue;
              const name = spec.imported.name ?? spec.imported.value;
              if (!HAND_WRITTEN.has(name)) {
                context.report({ node: spec, message });
              }
            }
          },
        };
      },
    },
  },
};

// axios 격리 path — 아래 두 no-restricted-imports 블록(전역 src/**, 엔티티)이 공유한다.
// flat config 는 같은 룰 키를 마지막 매칭 블록이 통째로 덮어쓰므로, 엔티티 블록도 이 항목을 포함해야
// axios 격리가 엔티티에서 조용히 풀리지 않는다(zod 만 넣지 말 것).
const restrictAxiosInstance = {
  name: '@/shared/api',
  importNames: ['axiosInstance'],
  message:
    'axios 호출은 features/*/api 세그먼트에만 두세요. 컴포넌트는 React Query 훅(useAuth·useUsers)을 거칩니다.',
};

export default tseslint.config(
  {
    ignores: [
      'dist',
      'dev-dist',
      'storybook-static',
      'coverage',
      'playwright-report',
      'test-results',
      '.lighthouseci',
      'public/mockServiceWorker.js',
      // orval 생성물 — import 정렬·네이밍 규칙 비대상.
      'src/shared/api/generated',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    // function-component-definition 룰만 켜기 위해 react 플러그인을 등록한다(recommended 미확장).
    // version 은 'detect' 대신 설치 버전(19.2)으로 고정한다 — ESLint 10 에서 plugin-react 의 버전
    // 탐지 경로(resolveBasedir → 제거된 context.getFilename())가 크래시하므로 탐지를 건너뛴다.
    // 우리가 켠 react 룰은 버전 무관(function-component-definition)이라 고정값이 판정을 바꾸지 않는다.
    settings: { react: { version: '19.2' } },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
      react,
      local,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // import/export 정렬 — FSD 레이어(app→shared) 인지 그룹핑. --fix 자동.
      // 형제 admin-template 과 동일한 그룹 구성, 단 심각도는 pwa 가 더 엄격한 'error' 유지.
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. side-effect import (예: '@/app/config/configureAxios' — 인증 브리지, 제거 금지)
            ['^\\u0000'],
            // 2. 외부 패키지 (react 우선)
            ['^react', '^@?\\w'],
            // 3. FSD 레이어 — 한 블록 안에서 상위(app)→하위(shared) 순서로 정렬
            [
              '^@/app(/.*)?$',
              '^@/pages(/.*)?$',
              '^@/widgets(/.*)?$',
              '^@/features(/.*)?$',
              '^@/entities(/.*)?$',
              '^@/shared(/.*)?$',
              '^@/',
            ],
            // 4. 슬라이스 내부 상대경로 (부모 → 동일 디렉터리)
            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      // 네이밍 컨벤션 — 노이즈 최소 셋(admin-template 과 동일, error 강제). 위반 0건 확인 후 승격.
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        // PascalCase 허용: 컴포넌트를 인자로 받는 경우(Storybook 데코레이터·render prop·HOC)
        { selector: 'parameter', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
        { selector: 'typeLike', format: ['PascalCase'] },
        // UPPER_CASE 허용: 환경변수·상수성 타입 멤버(예: ImportMetaEnv의 VITE_*)
        { selector: 'typeProperty', format: ['camelCase', 'UPPER_CASE'] },
        // 객체 리터럴 프로퍼티/import 별칭은 형식 강제 안 함 (mocks·zod·API 키 false positive 차단)
        { selector: 'objectLiteralProperty', format: null },
        { selector: 'import', format: null },
      ],
      // 컴포넌트 선언은 화살표 함수로 통일(shared/ui shadcn 프리미티브는 아래에서 예외).
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
      ],
      // 색 하드코딩 가드레일 — 리터럴 색(#hex·rgb/hsl)을 차단해 Shadcn/UI 시맨틱 토큰 사용을
      // 강제한다. 색은 Tailwind 토큰 클래스(bg-primary·text-muted-foreground 등)나
      // src/app/styles/index.css 의 CSS 변수를 거친다. 스토리는 아래 override 로 예외.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
          message:
            '색상은 시맨틱 토큰을 사용하세요(하드코딩 #hex 금지). Tailwind 토큰 클래스(bg-primary·text-muted-foreground) 또는 index.css 의 CSS 변수를 참고하세요.',
        },
        {
          // #hex 우회로 rgb()/hsl() 리터럴 색을 박는 것도 함께 차단(named color 는 오탐 방지로 제외 — 리뷰가 받는다).
          selector: 'Literal[value=/^(?:rgb|rgba|hsl|hsla)\\(/i]',
          message:
            '색상은 시맨틱 토큰을 사용하세요(rgb/hsl 리터럴 금지). Tailwind 토큰 클래스 또는 index.css 의 CSS 변수를 참고하세요.',
        },
      ],
      // 파일 구현 구조 강제(로컬 플러그인) — queryKey 상수 객체·named export 통일.
      'local/query-key-object': 'error',
      'local/no-default-export': 'error',
    },
  },
  // 접근성(a11y) 권장 룰셋 — code-review 스킬 기준을 lint 로 강제.
  jsxA11y.flatConfigs.recommended,
  {
    // Shadcn/UI 프리미티브는 컴포넌트와 variant(cva)·훅을 함께 export 하고 function 선언을
    // 쓰는 것이 업스트림 표준이다. 해당 디렉터리만 관련 룰을 끈다(과수정 방지).
    files: ['src/shared/ui/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react/function-component-definition': 'off',
    },
  },
  {
    // 색 하드코딩 규칙 예외:
    // - 스토리: 디자인 토큰 데모·시각 비교 목적.
    // - 빌드/툴 설정: PWA 매니페스트의 theme_color·background_color 는 W3C 사양상 리터럴 색이어야
    //   하며(브라우저 UI 가 CSS 변수를 해석하지 않는다), 그 값은 index.css 의 토큰과 손으로 맞춘다.
    files: ['**/*.stories.tsx', '**/*.config.{ts,tsx}'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    // default export 가 규약상 필요한 파일: Storybook(meta·preview), 빌드/툴 설정(vite·orval·steiger·playwright 등).
    files: ['**/*.stories.tsx', '**/*.config.{ts,tsx}', '.storybook/**'],
    rules: { 'local/no-default-export': 'off' },
  },
  {
    // axios 격리 — api 세그먼트(features/*/api, shared/api) 밖에서 axiosInstance 직접 import 금지.
    // 컴포넌트는 features/* 의 React Query 훅을 거치게 강제(서버 상태 단일 경로).
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/api/**'],
    rules: {
      'no-restricted-imports': ['error', { paths: [restrictAxiosInstance] }],
    },
  },
  {
    // 엔티티는 타입 전용 레이어 — 런타임 검증(zod)은 features/*/model/*Schema.ts 에 둔다.
    // axios 격리도 함께 유지: flat config 는 같은 룰을 마지막 매칭 블록이 덮어쓰므로,
    // restrictAxiosInstance 를 여기서도 포함해 엔티티에서 격리가 풀리지 않게 한다(zod 만 넣지 말 것).
    files: ['src/entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            restrictAxiosInstance,
            {
              name: 'zod',
              message:
                'zod 검증은 features/*/model/*Schema.ts 에 두세요. 엔티티는 타입 전용 레이어입니다.',
            },
          ],
        },
      ],
    },
  },
  {
    // 생성 도메인 훅/DTO 격리 — model/api/lib 래퍼 세그먼트 밖(주로 ui/컴포넌트)에서 `@/shared/api`
    // 의 생성 심볼 직접 import 금지. 별도 룰 키라 위 no-restricted-imports/syntax 블록과 충돌 없음.
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/**/api/**',
      'src/**/model/**',
      'src/**/lib/**',
      'src/**/config/**',
      'src/app/mocks/**',
      'src/**/*.test.{ts,tsx}',
      'src/**/*.stories.tsx',
    ],
    plugins: { local },
    rules: {
      'local/no-generated-api-outside-wrapper': 'error',
    },
  },
  ...storybook.configs['flat/recommended'],
  {
    // Tailwind 클래스 점검(better-tailwindcss) — 전 룰 warn(게이트에 --max-warnings 없음).
    // 정렬/줄바꿈은 prettier-plugin-tailwindcss 가 담당하므로 중복되는 포매팅 룰은 끈다.
    files: ['**/*.{ts,tsx}'],
    plugins: { 'better-tailwindcss': betterTailwind },
    settings: {
      // Tailwind v4 는 CSS-first — 테마/커스텀 유틸을 해석하도록 CSS 엔트리를 지정한다.
      'better-tailwindcss': { entryPoint: 'src/app/styles/index.css' },
    },
    rules: {
      ...betterTailwind.configs['recommended-warn'].rules,
      // 정렬/줄바꿈은 prettier-plugin-tailwindcss 가 담당 → 중복되는 포매팅 룰을 끈다.
      'better-tailwindcss/enforce-consistent-class-order': 'off',
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
      // 정규 클래스 권고(예: data-[disabled]→data-disabled, px-4 py-4→p-4)는 의견이 강하고
      // shadcn 프리미티브의 업스트림 표기와 충돌한다(원본 과수정 지양) → 끈다.
      'better-tailwindcss/enforce-canonical-classes': 'off',
      // 임의값·shadcn/sonner 커스텀 클래스에서 false positive 가 잦아 끈다(오타 방지 가치 < 노이즈).
      'better-tailwindcss/no-unknown-classes': 'off',
    },
  },
  {
    // 보안 정적 분석. no-unsanitized 는 XSS 직접 가드(dangerouslySetInnerHTML/innerHTML 등)라
    // a11y 와 동급 'error'. eslint-plugin-security 는 휴리스틱이라 false positive 가 잦아
    // naming-convention 과 동급 'warn'(recommended 가 이미 전 룰 warn) — 게이트 비차단.
    files: ['**/*.{ts,tsx}'],
    plugins: { security, 'no-unsanitized': nounsanitized },
    rules: {
      'no-unsanitized/method': 'error',
      'no-unsanitized/property': 'error',
      ...security.configs.recommended.rules,
      // 프론트 정적 라우팅에서 노이즈만 만드는 룰을 끈다(객체 인젝션·비literal fs 경로).
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
  {
    // Node 빌드 스크립트(브라우저 아님) — node 전역을 쓰고 리포 고정 경로에 파일을 쓴다
    // (scripts/gen-icons.mjs 가 public/ 에 플레이스홀더 아이콘을 생성). ts/tsx 전용 규칙
    // (naming·import-sort·local 플러그인)은 files 매칭에서 빠져 적용되지 않는다.
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: { globals: globals.node },
    rules: {
      // 생성 경로는 리포 고정이라 비literal fs 경고는 노이즈.
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
  prettier,
);

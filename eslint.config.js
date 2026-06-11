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
  },
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
    settings: { react: { version: 'detect' } },
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
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/shared/api',
              importNames: ['axiosInstance'],
              message:
                'axios 호출은 features/*/api 세그먼트에만 두세요. 컴포넌트는 React Query 훅(useAuth·useUsers)을 거칩니다.',
            },
          ],
        },
      ],
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
  prettier,
);

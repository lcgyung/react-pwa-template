import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

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
      // 네이밍 컨벤션 — 노이즈 최소 셋(admin-template 과 동일). 자동수정 불가라 warn.
      '@typescript-eslint/naming-convention': [
        'warn',
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
  prettier,
);

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'prompt': 새 버전 감지 시 사용자에게 새로고침을 확인받는다(PWABadge 컴포넌트).
      registerType: 'prompt',
      injectRegister: null, // 등록은 PWABadge 의 useRegisterSW 가 담당.
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'React PWA Template',
        short_name: 'PWA Template',
        description: 'React + TypeScript + Vite 기반 PWA 템플릿',
        lang: 'ko',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        cleanupOutdatedCaches: true,
        // SPA: 캐시되지 않은 내비게이션은 index.html 로 폴백(오프라인 라우팅).
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
      devOptions: {
        // 개발 중에도 SW 를 등록해 동작을 점검할 수 있게 한다(프로덕션 확인은 build && preview).
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    css: false,
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      // 측정 대상에서 제외: 진입점·배럴·목 데이터·스토리·타입 선언(로직 없음).
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/index.ts',
        'src/app/mocks/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.d.ts',
      ],
      // ratchet 베이스라인(현재 stmts/lines 28%·branch 68%·funcs 55%): 바로 아래로 고정하고
      // PR 마다 점진 상향한다. 미달 시 vitest 가 non-zero 로 종료 → CI 실패.
      thresholds: {
        lines: 25,
        statements: 25,
        functions: 50,
        branches: 60,
      },
    },
  },
});

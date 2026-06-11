import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { VitePWA } from 'vite-plugin-pwa';
import { configDefaults, defineConfig } from 'vitest/config';

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
        // 런타임 캐싱: precache(globPatterns)가 못 잡는 교차 출처 자원만 다룬다.
        // ⚠️ 검증은 pnpm build && pnpm preview 의 DevTools(Application 탭)로만 가능 — dev 서버는 SW 미동작.
        runtimeCaching: [
          {
            // 교차 출처 이미지(CDN 등): 잘 안 바뀌므로 캐시 우선 + 용량/수명 상한.
            urlPattern: ({ request, sameOrigin }) => !sameOrigin && request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'cross-origin-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // 교차 출처 폰트(Google Fonts 등): 거의 불변 → 장기 캐시.
            urlPattern: ({ request, sameOrigin }) => !sameOrigin && request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'cross-origin-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // API 응답은 절대 캐시하지 않는다 — 인증/권한이 섞인 동적 데이터.
            // navigateFallbackDenylist([/^\/api/]) 와 일관: 오프라인 시 stale 인증 데이터 노출 방지.
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkOnly',
          },
        ],
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
    // Playwright E2E(e2e/*.spec.ts)는 vitest 가 아니라 @playwright/test 로 실행한다.
    // 기본 exclude 를 덮어쓰지 않도록 스프레드한다.
    exclude: [...configDefaults.exclude, 'e2e/**'],
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
        // 설치 프롬프트 UI 는 브라우저 beforeinstallprompt 에 의존 — 훅(useInstallPrompt)만 테스트한다.
        'src/features/pwa-install/ui/**',
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

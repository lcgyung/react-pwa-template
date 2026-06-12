import { defineConfig, devices } from '@playwright/test';

// PWA(서비스 워커/오프라인)는 dev 서버가 아니라 프로덕션 빌드(preview)에서만 동작한다.
// 따라서 webServer 로 build && preview 를 띄우고 그 위에서 E2E 를 돌린다.
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // E2E 는 결정적으로 가야 한다: .env.production 이 MSW(mock)를 켜지만, MSW SW 와 PWA SW 가
    // 같은 scope 에서 충돌하므로 빌드 단계에서 mock 을 끈다(process env 가 .env 보다 우선).
    // 로그인은 page.route 로, 오프라인은 PWA SW 로 각각 검증한다.
    command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
    env: { VITE_ENABLE_MOCK: 'false' },
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

import { expect, test } from '@playwright/test';

// 오프라인 렌더는 프로덕션 SW 의 precache 에 의존한다 — preview 빌드에서만 유효하다.
test('오프라인에서도 앱 셸이 캐시에서 렌더된다', async ({ page, context }) => {
  // 최초 로드: PWABadge(useRegisterSW)가 SW 를 등록하고 앱 셸/자산을 precache 한다.
  await page.goto('/login');
  await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();

  // SW 가 활성화될 때까지 대기(activated → install 단계의 precache 완료 보장).
  await page.evaluate(() => navigator.serviceWorker.ready);

  // 네트워크를 끊고 새로고침 — 셸이 네트워크가 아니라 SW 캐시에서 떠야 한다.
  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
});

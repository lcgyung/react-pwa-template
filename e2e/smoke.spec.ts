import { expect, test } from '@playwright/test';

// 서비스 워커를 차단해 네트워크 요청을 Playwright route 로 직접 가로챈다.
// (preview 빌드의 PWA SW 와 MSW SW 가 같은 scope 에서 충돌하는 것을 피하고 테스트를 결정적으로 만든다.)
test.use({ serviceWorkers: 'block' });

const adminUser = {
  id: 1,
  name: '관리자',
  email: 'admin@example.com',
  role: 'admin',
  createdAt: '2026-01-02T09:00:00.000Z',
};

test('데모 계정으로 로그인하면 대시보드로 이동한다', async ({ page }) => {
  // 백엔드 계약을 route 로 스텁한다(엔드포인트 baseURL 은 동일 출처).
  await page.route('**/auth/login', (route) =>
    route.fulfill({ json: { token: 'e2e-token', user: adminUser } }),
  );
  await page.route('**/auth/me', (route) => route.fulfill({ json: adminUser }));
  await page.route('**/users', (route) => route.fulfill({ json: [adminUser] }));

  await page.goto('/login');
  await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();

  await page.getByLabel('이메일').fill('admin@example.com');
  await page.getByLabel('비밀번호').fill('password');
  await page.getByRole('button', { name: '로그인' }).click();

  // 대시보드 진입 — PageHeader 제목과 환영 문구 확인.
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible();
  await expect(page.getByText('환영합니다, 관리자님')).toBeVisible();
});

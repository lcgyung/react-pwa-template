import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/App';
import { configureAuthBridge } from '@/shared/api/axiosInstance';
import { paths } from '@/shared/config/paths';
import { clearAuthState, getAuthToken } from '@/entities/session';

import '@/styles/index.css';

// FSD 마이그레이션 임시 주입(6단계에서 app/config/configureAxios.ts 로 이전 예정).
// 미주입 시 토큰 주입·401 처리가 무력화되므로 제거 금지.
configureAuthBridge({
  getToken: getAuthToken,
  onUnauthorized: () => {
    clearAuthState();
    if (window.location.pathname !== paths.login) {
      window.location.href = paths.login;
    }
  },
});

// VITE_ENABLE_MOCK=true 일 때만 MSW 목 서버를 기동한다.
async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCK !== 'true') {
    return;
  }
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element(#root)를 찾을 수 없습니다.');

  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

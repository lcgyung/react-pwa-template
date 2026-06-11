import '@/app/styles/index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { env } from '@/shared/config';

// VITE_ENABLE_MOCK=true 일 때만 MSW 목 서버를 기동한다.
async function enableMocking() {
  if (env.VITE_ENABLE_MOCK !== 'true') {
    return;
  }
  const { worker } = await import('@/app/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

// 목 초기화 실패가 앱 렌더를 막지 않도록 한다(실패 시 목 없이 그대로 부팅).
enableMocking()
  .catch((error) => {
    console.error('[mock] MSW 초기화 실패 — 목 없이 계속 진행합니다.', error);
  })
  .then(() => {
    const rootEl = document.getElementById('root');
    if (!rootEl) throw new Error('Root element(#root)를 찾을 수 없습니다.');

    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });

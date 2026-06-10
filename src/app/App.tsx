import { RouterProvider } from 'react-router-dom';

import '@/app/config/configureAxios'; // axios 인증 브리지 주입 — 이 줄 제거 금지

import { AppProviders } from '@/app/providers/AppProviders';
import { router } from '@/app/router/router';

export const App = () => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);

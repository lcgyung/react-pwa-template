import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AuthLayout } from '@/widgets/auth-layout';
import { MainLayout } from '@/widgets/main-layout';
import { paths } from '@/shared/config';
import { Loading } from '@/shared/ui/Loading';

import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// 페이지는 라우트 단위 코드 스플리팅을 위해 lazy 로 로드한다(배럴이 named export 라 default 로 매핑).
// 레이아웃은 정적 import 를 유지한다 — 내부 <Suspense> 경계가 자식 페이지 로딩을 감싸기 때문.
const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.DashboardPage })),
);
const ForbiddenPage = lazy(() =>
  import('@/pages/forbidden').then((m) => ({ default: m.ForbiddenPage })),
);
const LoginPage = lazy(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })));
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })),
);
const UsersPage = lazy(() => import('@/pages/users').then((m) => ({ default: m.UsersPage })));

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: paths.login, element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: paths.dashboard, element: <DashboardPage /> },
          {
            element: <RoleRoute allowedRoles={['admin', 'manager']} />,
            children: [{ path: paths.users, element: <UsersPage /> }],
          },
          { path: paths.forbidden, element: <ForbiddenPage /> },
        ],
      },
    ],
  },
  {
    // 레이아웃 밖의 최상위 매치 — 자체 Suspense 경계를 둔다.
    path: '*',
    element: (
      <Suspense fallback={<Loading />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

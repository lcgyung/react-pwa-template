import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '@/entities/session';
import { paths } from '@/shared/config';

export const AuthLayout = () => {
  const token = useAuthStore((s) => s.token);

  // 이미 로그인한 사용자는 대시보드로.
  if (token) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <Outlet />
    </div>
  );
};

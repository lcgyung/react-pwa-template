import { Navigate, Outlet } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { useAuthStore } from '@/stores/authStore';

export const AuthLayout = () => {
  const token = useAuthStore((s) => s.token);

  // 이미 로그인한 사용자는 대시보드로.
  if (token) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return (
    <div className="bg-background flex min-h-dvh items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { Loading } from '@/shared/ui/Loading';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout = () => (
  <div className="flex min-h-dvh">
    <Sidebar />
    <div className="flex flex-1 flex-col">
      <Header />
      {/* 셸(사이드바/헤더)은 유지하고 본문만 페이지 lazy 로딩 동안 Loading 으로 대체한다. */}
      <main className="flex-1 p-4 md:p-6">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  </div>
);

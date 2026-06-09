import { Outlet } from 'react-router-dom';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

export const MainLayout = () => (
  <div className="flex min-h-dvh">
    <Sidebar />
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

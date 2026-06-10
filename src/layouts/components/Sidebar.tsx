import { LayoutDashboard, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { paths } from '@/shared/config/paths';
import { useAuthStore } from '@/stores/authStore';
import type { Role } from '@/types/user';

interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
  allowedRoles?: Role[];
  end?: boolean;
}

const menuItems: MenuItem[] = [
  { label: '대시보드', path: paths.dashboard, icon: LayoutDashboard, end: true },
  { label: '사용자', path: paths.users, icon: Users, allowedRoles: ['admin', 'manager'] },
];

/** 데스크톱/모바일 양쪽에서 재사용하는 네비게이션 목록 (RBAC 역할 필터 포함). */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);

  // RBAC: 사용자 역할에 허용된 메뉴만 노출.
  const visibleItems = menuItems.filter(
    (item) => !item.allowedRoles || (user != null && item.allowedRoles.includes(user.role)),
  );

  return (
    <nav className="flex flex-col gap-1 p-2">
      {visibleItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
            )
          }
        >
          <item.icon className="size-4 shrink-0" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

/** 데스크톱 고정 사이드바 (md 이상에서만 표시). */
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-14 items-center border-b px-4 text-base font-bold">PWA Template</div>
      <SidebarNav />
    </aside>
  );
}

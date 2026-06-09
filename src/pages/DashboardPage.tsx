import { Loading } from '@/components/common/Loading';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { useUsers } from '@/hooks/useUsers';
import { useAuthStore } from '@/stores/authStore';

export const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const { data: users, isLoading } = useUsers();

  return (
    <div>
      <PageHeader title="대시보드" description={`환영합니다, ${user?.name ?? ''}님`} />

      {isLoading ? (
        <Loading />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <StatCard label="총 사용자" value={users?.length ?? 0} hint="등록된 계정 수" />
          <StatCard
            label="관리자"
            value={users?.filter((u) => u.role === 'admin').length ?? 0}
            hint="admin 권한 계정"
          />
          <StatCard label="내 역할" value={user?.role ?? '-'} hint="현재 로그인 권한" />
        </div>
      )}
    </div>
  );
};

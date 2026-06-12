import { useUsers } from '@/features/users';
import type { Role } from '@/entities/user';
import { formatDate } from '@/shared/lib/format';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import { Loading } from '@/shared/ui/Loading';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';

const roleVariant: Record<Role, 'destructive' | 'secondary' | 'outline'> = {
  admin: 'destructive',
  manager: 'secondary',
  user: 'outline',
};

export const UsersPage = () => {
  const { data: users, isLoading, isError } = useUsers();

  return (
    <div>
      <PageHeader title="사용자" description="등록된 사용자 목록" />

      {isLoading && <Loading />}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>사용자 목록을 불러오지 못했습니다.</AlertDescription>
        </Alert>
      )}

      {users && (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>가입일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[u.role]}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(u.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

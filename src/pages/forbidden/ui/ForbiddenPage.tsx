import { Link } from 'react-router-dom';

import { paths } from '@/shared/config';
import { Button } from '@/shared/ui/button';

export const ForbiddenPage = () => (
  <div className="flex flex-col items-center gap-4 py-16 text-center">
    <h1 className="text-6xl font-bold">403</h1>
    <p className="text-muted-foreground">이 페이지에 접근할 권한이 없습니다.</p>
    <Button asChild>
      <Link to={paths.dashboard}>대시보드로 돌아가기</Link>
    </Button>
  </div>
);

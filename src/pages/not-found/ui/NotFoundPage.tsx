import { Link } from 'react-router-dom';

import { paths } from '@/shared/config';
import { Button } from '@/shared/ui/button';

export const NotFoundPage = () => (
  <div className="flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
    <h1 className="text-6xl font-bold">404</h1>
    <p className="text-muted-foreground">페이지를 찾을 수 없습니다.</p>
    <Button asChild>
      <Link to={paths.dashboard}>홈으로</Link>
    </Button>
  </div>
);

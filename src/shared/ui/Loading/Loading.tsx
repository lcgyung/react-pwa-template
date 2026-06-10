import { Loader2 } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

export const Loading = ({ className }: { className?: string }) => (
  <div className={cn('flex justify-center py-12', className)}>
    <Loader2 className="size-8 animate-spin text-muted-foreground" aria-label="로딩 중" />
  </div>
);

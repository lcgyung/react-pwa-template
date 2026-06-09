import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export const Loading = ({ className }: { className?: string }) => (
  <div className={cn('flex justify-center py-12', className)}>
    <Loader2 className="text-muted-foreground size-8 animate-spin" aria-label="로딩 중" />
  </div>
);

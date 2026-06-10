import type { ReactNode } from 'react';

import { Card, CardContent } from '@/shared/ui/card';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

export const StatCard = ({ label, value, hint }: StatCardProps) => (
  <Card>
    <CardContent className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </CardContent>
  </Card>
);

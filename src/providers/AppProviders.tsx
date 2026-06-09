import type { ReactNode } from 'react';

import { PWABadge } from '@/components/common/PWABadge';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryProvider>
    <ThemeProvider>
      {children}
      <Toaster />
      <PWABadge />
    </ThemeProvider>
  </QueryProvider>
);

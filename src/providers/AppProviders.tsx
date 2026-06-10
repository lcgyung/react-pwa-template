import type { ReactNode } from 'react';

import { PWABadge } from '@/widgets/pwa-badge';
import { ThemeProvider, useThemeStore } from '@/features/theme';
import { Toaster } from '@/shared/ui/sonner';
import { QueryProvider } from './QueryProvider';

// Toaster 의 theme 은 shared 가 테마 스토어를 직접 알지 않도록 여기서 주입한다.
const ThemedToaster = () => {
  const mode = useThemeStore((s) => s.mode);
  return <Toaster theme={mode} />;
};

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryProvider>
    <ThemeProvider>
      {children}
      <ThemedToaster />
      <PWABadge />
    </ThemeProvider>
  </QueryProvider>
);

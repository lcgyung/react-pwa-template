import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { useThemeStore } from '../model/themeStore';

/**
 * Tailwind 다크 모드 프로바이더.
 * themeStore(persist)의 mode 를 구독해 <html> 에 `dark` 클래스와 color-scheme 를 토글한다.
 * (admin 의 MUI createTheme 대신 Tailwind class 전략을 사용.)
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;
  }, [mode]);

  return <>{children}</>;
};

import { Toaster as Sonner, type ToasterProps } from 'sonner';

import { useThemeStore } from '@/stores/themeStore';

const Toaster = ({ ...props }: ToasterProps) => {
  const mode = useThemeStore((s) => s.mode);

  return (
    <Sonner
      theme={mode}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

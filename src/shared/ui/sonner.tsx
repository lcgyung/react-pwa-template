import { Toaster as Sonner, type ToasterProps } from 'sonner';

// shared 레이어는 테마 스토어(features/theme)를 모른다 — theme 은 호출부에서 prop 으로 주입한다.
const Toaster = ({ theme = 'system', ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
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

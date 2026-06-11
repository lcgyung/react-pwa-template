import type { FallbackProps } from 'react-error-boundary';

import { Button } from '@/shared/ui/button';

// ErrorBoundary 폴백 — 예기치 못한 렌더 오류를 사용자에게 알리고 재시도를 제공한다.
export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const message = error instanceof Error ? error.message : String(error ?? '');

  return (
    <div
      role="alert"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">문제가 발생했습니다</h1>
        <p className="text-sm text-muted-foreground">
          예기치 못한 오류로 화면을 표시할 수 없습니다. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
      {message && (
        <pre className="max-w-md overflow-auto rounded-md bg-muted px-3 py-2 text-left text-xs text-muted-foreground">
          {message}
        </pre>
      )}
      <Button onClick={resetErrorBoundary}>다시 시도</Button>
    </div>
  );
};

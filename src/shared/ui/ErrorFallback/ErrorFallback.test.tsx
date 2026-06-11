import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ErrorFallback } from './ErrorFallback';

describe('ErrorFallback', () => {
  it('에러 메시지와 재시도 버튼을 렌더하고 클릭 시 reset 을 호출한다', async () => {
    const resetErrorBoundary = vi.fn();
    render(<ErrorFallback error={new Error('boom')} resetErrorBoundary={resetErrorBoundary} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
  });
});

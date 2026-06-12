import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useInstallPrompt } from './useInstallPrompt';

const fireBeforeInstall = () => {
  const event = new Event('beforeinstallprompt') as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  // userChoice 는 readonly 라 defineProperty 로 부여한다.
  Object.defineProperty(event, 'userChoice', { value: Promise.resolve({ outcome: 'accepted' }) });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
};

describe('useInstallPrompt', () => {
  it('초기에는 설치 불가 상태다', () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);
  });

  it('beforeinstallprompt 를 캡처하면 설치 가능 상태가 된다', () => {
    const { result } = renderHook(() => useInstallPrompt());
    fireBeforeInstall();
    expect(result.current.canInstall).toBe(true);
  });

  it('promptInstall 은 네이티브 프롬프트를 띄우고 상태를 초기화한다', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = fireBeforeInstall();
    await act(async () => {
      await result.current.promptInstall();
    });
    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(result.current.canInstall).toBe(false);
  });

  it('appinstalled 이벤트는 설치 가능 상태를 해제한다', () => {
    const { result } = renderHook(() => useInstallPrompt());
    fireBeforeInstall();
    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(result.current.canInstall).toBe(false);
  });
});

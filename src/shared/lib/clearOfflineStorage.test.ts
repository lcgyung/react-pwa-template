import { afterEach, describe, expect, it, vi } from 'vitest';

import { storageKeys } from '@/shared/config';

import { clearOfflineStorage } from './clearOfflineStorage';

describe('clearOfflineStorage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('caches/indexedDB 미지원 환경에서 안전하게 통과한다(no-op)', async () => {
    await expect(clearOfflineStorage()).resolves.toBeUndefined();
  });

  it('런타임 캐시 이름만 삭제하고 precache 는 건드리지 않는다', async () => {
    const remove = vi.fn().mockResolvedValue(true);
    vi.stubGlobal('caches', {
      keys: vi
        .fn()
        .mockResolvedValue(['cross-origin-images', 'workbox-precache-v2-/', 'cross-origin-fonts']),
      delete: remove,
    });

    await clearOfflineStorage();

    expect(remove).toHaveBeenCalledWith('cross-origin-images');
    expect(remove).toHaveBeenCalledWith('cross-origin-fonts');
    expect(remove).not.toHaveBeenCalledWith('workbox-precache-v2-/');
  });

  it('RQ persist 캐시 키를 localStorage 에서 제거한다', async () => {
    localStorage.setItem(storageKeys.queryCache, '{"clientState":{}}');

    await clearOfflineStorage();

    expect(localStorage.getItem(storageKeys.queryCache)).toBeNull();
  });

  it('캐시 정리가 실패해도 reject 하지 않는다', async () => {
    vi.stubGlobal('caches', {
      keys: vi.fn().mockRejectedValue(new Error('boom')),
      delete: vi.fn(),
    });

    await expect(clearOfflineStorage()).resolves.toBeUndefined();
  });
});

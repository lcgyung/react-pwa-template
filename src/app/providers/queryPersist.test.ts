import type { Query } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { storageKeys } from '@/shared/config';

import { createQueryPersistOptions, shouldPersistQuery } from './queryPersist';

const queryWith = (status: string, meta?: { persist?: boolean }) =>
  ({ state: { status }, meta }) as unknown as Query;

describe('shouldPersistQuery', () => {
  it('성공한 쿼리만 persist 한다(pending/error 제외)', () => {
    expect(shouldPersistQuery(queryWith('success'))).toBe(true);
    expect(shouldPersistQuery(queryWith('pending'))).toBe(false);
    expect(shouldPersistQuery(queryWith('error'))).toBe(false);
  });

  it('meta.persist === false 옵트아웃 쿼리는 제외한다(세션 의존 데이터)', () => {
    expect(shouldPersistQuery(queryWith('success', { persist: false }))).toBe(false);
    expect(shouldPersistQuery(queryWith('success', { persist: true }))).toBe(true);
  });
});

describe('createQueryPersistOptions', () => {
  it('buster 는 빌드타임 앱 버전, maxAge 24h, dehydrate 필터를 연결한다', () => {
    const options = createQueryPersistOptions();
    expect(options.buster).toBe(__APP_VERSION__);
    expect(options.maxAge).toBe(1000 * 60 * 60 * 24);
    expect(options.dehydrateOptions.shouldDehydrateQuery).toBe(shouldPersistQuery);
  });

  it('persist 캐시는 storageKeys.queryCache 키로 localStorage 에 기록된다', () => {
    // sync persister 는 기록을 throttle(기본 1초) 하므로 fake timer 로 시간을 진행시킨다.
    vi.useFakeTimers();
    try {
      const options = createQueryPersistOptions();
      void options.persister.persistClient({
        buster: __APP_VERSION__,
        timestamp: 0,
        clientState: { mutations: [], queries: [] },
      });
      vi.advanceTimersByTime(1000);
      expect(localStorage.getItem(storageKeys.queryCache)).toContain(__APP_VERSION__);
    } finally {
      localStorage.removeItem(storageKeys.queryCache);
      vi.useRealTimers();
    }
  });
});

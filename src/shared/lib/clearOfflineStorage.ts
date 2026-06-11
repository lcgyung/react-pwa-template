// 로그아웃·세션 종료 시 오프라인 잔존 데이터를 정리한다 — 교차출처 이미지/폰트 런타임 캐시 +
// IndexedDB + RQ persist 캐시(localStorage). caches/indexedDB 미지원 환경(jsdom/SSR)에서도
// 안전하게 no-op 한다. 모든 정리는 베스트 에포트 — 실패해도 로그아웃 흐름을 막지 않는다.

import { storageKeys } from '@/shared/config';

// ⚠️ vite.config.ts 의 workbox.runtimeCaching cacheName 과 반드시 일치해야 한다(드리프트 주의).
const RUNTIME_CACHE_NAMES = ['cross-origin-images', 'cross-origin-fonts'];

export const clearOfflineCaches = async (): Promise<void> => {
  if (typeof caches === 'undefined') return;
  try {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => RUNTIME_CACHE_NAMES.some((name) => key.includes(name)))
        .map((key) => caches.delete(key)),
    );
  } catch {
    // 캐시 정리는 베스트 에포트.
  }
};

export const clearIndexedDb = async (): Promise<void> => {
  const idb = typeof indexedDB === 'undefined' ? undefined : indexedDB;
  if (!idb || typeof idb.databases !== 'function') return;
  try {
    const dbs = await idb.databases();
    await Promise.all(
      dbs.map(
        (db) =>
          db.name &&
          new Promise<void>((resolve) => {
            const request = idb.deleteDatabase(db.name!);
            request.onsuccess = request.onerror = request.onblocked = () => resolve();
          }),
      ),
    );
  } catch {
    // IndexedDB 정리는 베스트 에포트.
  }
};

// RQ persist 캐시(localStorage, ADR-0007) 제거. persister 의 throttle(기본 1초)이 제거 직후
// 빈 캐시를 다시 쓸 수 있으나, 호출 시점이 queryClient.clear() 이후라 데이터가 없어 무해하다.
export const clearPersistedQueryCache = (): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(storageKeys.queryCache);
  } catch {
    // persist 캐시 정리는 베스트 에포트.
  }
};

// 로그아웃에서 호출하는 단일 진입점.
export const clearOfflineStorage = async (): Promise<void> => {
  clearPersistedQueryCache();
  await Promise.all([clearOfflineCaches(), clearIndexedDb()]);
};

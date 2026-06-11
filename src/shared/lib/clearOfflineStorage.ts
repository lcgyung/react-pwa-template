// 로그아웃·세션 종료 시 오프라인 잔존 데이터를 정리한다 — 교차출처 이미지/폰트 런타임 캐시 +
// IndexedDB. caches/indexedDB 미지원 환경(jsdom/SSR)에서도 안전하게 no-op 한다.
// 모든 정리는 베스트 에포트 — 실패해도 로그아웃 흐름을 막지 않는다.

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

// 로그아웃에서 호출하는 단일 진입점.
export const clearOfflineStorage = async (): Promise<void> => {
  await Promise.all([clearOfflineCaches(), clearIndexedDb()]);
};

// localStorage 키의 단일 출처 — 기록(app/providers/queryPersist)과 제거(shared/lib/clearOfflineStorage)
// 양쪽이 공유한다(키 문자열 드리프트 방지).
export const storageKeys = {
  // React Query 오프라인 persist 캐시(ADR-0007).
  queryCache: 'rq-offline-cache',
} as const;

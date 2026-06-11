import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { Query } from '@tanstack/react-query';

import { storageKeys } from '@/shared/config';

// 쿼리별 persist 옵트아웃 컨벤션: useQuery({ meta: { persist: false } }).
// app 레이어가 개별 feature 를 알지 않고도(FSD 결합 회피) 세션 의존 쿼리를 제외할 수 있다.
declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: { persist?: boolean };
  }
}

// 성공한 쿼리만 보존한다 — pending/error 를 복원하면 부팅 시 유령 로딩/에러 상태가 생긴다.
export const shouldPersistQuery = (query: Query) =>
  query.state.status === 'success' && query.meta?.persist !== false;

// PersistQueryClientProvider 옵션. 캐시는 localStorage — 토큰이 이미 localStorage 인 위협 모델
// (ADR-0004)과 동일 트레이드오프이며, buster(빌드타임 앱 버전)로 배포마다 구캐시를 무효화한다.
// 상세 결정 배경: ADR-0007.
export const createQueryPersistOptions = () => ({
  persister: createSyncStoragePersister({
    storage: typeof window === 'undefined' ? undefined : window.localStorage,
    key: storageKeys.queryCache,
  }),
  maxAge: 1000 * 60 * 60 * 24,
  buster: __APP_VERSION__,
  dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
});

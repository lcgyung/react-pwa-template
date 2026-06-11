# 0007. React Query 오프라인 persist (localStorage)

- 상태: 채택됨
- 날짜: 2026-06-11

## 맥락

ADR-0003 에 따라 `/api` 는 서비스 워커가 절대 캐시하지 않는다(`NetworkOnly`). 그 결과 앱 셸은
오프라인에서 뜨지만 **앱 데이터는 공백**이 된다 — 오프라인 재방문 시 이미 본 데이터조차 보여줄
수 없다. 서버 상태의 오프라인 연계는 SW 가 아니라 React Query 캐시 레이어에서 해결해야 한다.

## 결정

`@tanstack/react-query-persist-client` + `@tanstack/query-sync-storage-persister` 로 쿼리 캐시를
**localStorage** 에 persist 한다(`PersistQueryClientProvider`, `app/providers/queryPersist.ts`).

- **localStorage 선택**: 토큰이 이미 localStorage 에 있는 위협 모델(ADR-0004)과 동일한
  트레이드오프 — IndexedDB 로 옮겨도 XSS 노출 면에서 이득이 없다. 템플릿 데모 데이터는 KB 단위라
  5MB 한도와 무관하고, 동기 복원이라 부팅 레이스도 없다.
- **buster = 앱 버전**: vite `define` 으로 주입한 `__APP_VERSION__`(package.json version).
  배포 버전이 바뀌면 구 캐시가 자동 무효화된다.
- **maxAge 24h** + `gcTime: 24h`(QueryProvider): gcTime(기본 5분)이 maxAge 보다 짧으면 dehydrate
  대상에서 빠져 persist 가 조용히 무력화된다 — 반드시 maxAge 이상으로 유지한다.
- **success + `meta.persist !== false`** 쿼리만 보존: pending/error 는 복원하지 않고, 세션 의존
  쿼리(`useMe`)는 `meta: { persist: false }` 로 옵트아웃한다. app 레이어가 개별 feature 를 모르는
  meta 컨벤션이라 FSD 결합이 생기지 않는다.
- **로그아웃 정리**: 키(`storageKeys.queryCache`, `shared/config/storage.ts` 단일 출처)는
  `clearOfflineStorage`(`shared/lib`)가 제거한다. persister throttle(1초)이 제거 직후 빈 캐시를
  재기록할 수 있으나 `queryClient.clear()` 이후라 데이터가 없어 무해하다.

## 결과

- 오프라인 재방문 시 마지막 성공 데이터가 즉시 복원되고, 온라인 복귀 시 staleTime 정책대로
  재검증된다. 검증: `pnpm build && pnpm preview` → 오프라인 새로고침, 단위테스트
  `queryPersist.test.ts` / `clearOfflineStorage.test.ts`.
- 캐시 데이터가 localStorage 에 평문 저장된다 — ADR-0004 와 동일한 의도된 트레이드오프
  (프로덕션에서 민감 데이터가 커지면 httpOnly 쿠키 + 서버 세션으로 전환 권장).
- 대용량/구조화 데이터가 필요한 실전 앱은 `query-async-storage-persister` + IndexedDB(idb-keyval)
  로 교체한다 — 이 경우 `clearIndexedDb`(전체 IDB 삭제)와의 상호작용을 재검토할 것.

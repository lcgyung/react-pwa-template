# 0003. PWA 캐싱 전략 (precache + 런타임, API no-store)

- 상태: 채택됨
- 날짜: 2026-06-11

## 맥락

설치형·오프라인 PWA 는 앱 셸을 오프라인에서 띄워야 하지만, 인증이 섞인 동적 API 응답을 캐시하면
다른 사용자의 stale 데이터가 노출될 위험이 있다.

## 결정

`vite-plugin-pwa`(workbox `generateSW`)로:

- **precache**: 빌드 산출물(JS/CSS/HTML/아이콘 등)을 precache 하고, 내비게이션은 `navigateFallback`
  으로 `index.html` 에 폴백한다(SPA 오프라인 라우팅). `navigateFallbackDenylist: [/^\/api/]`.
- **런타임 캐싱**: 교차 출처 이미지·폰트만 `CacheFirst`(+expiration)로 캐시한다.
- **API no-store**: `/api` 는 `NetworkOnly` 로 절대 캐시하지 않는다.
- **업데이트**: `registerType: 'prompt'` — 새 버전 감지 시 PWABadge 가 사용자에게 새로고침을 받는다.

## 결과

- 검증: 서비스 워커는 `pnpm build && pnpm preview` 에서만 동작한다. 오프라인 동작은
  `e2e/offline.spec.ts`(Playwright)가 회귀 검사한다.
- 메모: Lighthouse 12 부터 **PWA 카테고리가 제거**되어 LHCI 어서션에는 PWA 점수가 없다. 설치
  가능성·SW 동작은 E2E 와 DevTools(Application 탭)로 확인한다.

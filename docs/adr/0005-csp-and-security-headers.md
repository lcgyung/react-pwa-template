# 0005. CSP 와 보안 헤더 (정적 nginx)

- 상태: 채택됨
- 날짜: 2026-06-11

## 맥락

프로덕션은 `nginx:1.27`(정적 서빙, `Dockerfile`)이 빌드 산출물(`dist`)을 서빙한다. 클릭재킹·
XSS·MIME 스니핑 등을 줄이려면 응답에 보안 헤더를 실어야 하는데, 이 앱은 **서비스 워커 2개**
(Workbox `sw.js` + MSW `mockServiceWorker.js`, 모두 동일출처), 교차출처 이미지/폰트 CDN 캐시
(Workbox `runtimeCaching`), 그리고 **런타임 `<style>` 주입**(Tailwind v4·sonner·Radix) + 인라인
스타일을 가진 `public/offline.html` 을 동시에 만족해야 한다. 정적 nginx 는 요청마다 nonce 를
생성해 주입할 수 없다.

## 결정

`nginx.conf` 의 `server` 블록에 CSP + `X-Frame-Options`·`X-Content-Type-Options`·`Referrer-Policy`·
`Permissions-Policy` 를 추가한다. nginx 는 `add_header` 가 있는 `location` 에서 server 상속을
끊으므로, `Cache-Control` 을 설정하는 `/assets/`·`= /sw.js`·`= /manifest.webmanifest` 에는 보안
헤더를 재선언한다.

CSP 주요 디렉티브와 근거:

- `script-src 'self'` / `worker-src 'self'` — 앱 번들과 두 서비스 워커(동일출처, `importScripts`
  포함)를 허용. 프로덕션 번들에 `eval` 이 없어 `'unsafe-eval'` 불필요.
- `style-src 'self' 'unsafe-inline'` — **의도된 트레이드오프**. 런타임 `<style>` 주입과
  `offline.html` 인라인 스타일 때문에 strict style-src 가 불가하고, 정적 nginx 는 per-response
  nonce 를 줄 수 없다. 향후 SSR/엣지 레이어 도입 시 nonce 또는 per-build style-hash 로 전환한다.
- `img-src`/`font-src 'self' https: data: blob:` — 교차출처 이미지/폰트 CDN(CacheFirst) + 인라인
  SVG·`data:` 아이콘.
- `connect-src 'self' https:` — axios → `VITE_API_BASE_URL` + 폰트/이미지 프리페치를 허용하되
  http 평문은 막는다(`upgrade-insecure-requests` 병행).
- `frame-ancestors 'none'` + `X-Frame-Options DENY` — 클릭재킹(레거시 브라우저 포함).

## 결과

- 장점: 프로덕션 응답이 기본적으로 클릭재킹·MIME 스니핑·과도한 권한·레퍼러 누출을 차단한다.
  Lighthouse Best-Practices(이미 0.9 error 게이트)에도 가점.
- 검증 한계: CI 의 `e2e`(Playwright)·`lighthouse` 는 `pnpm preview`/정적 dist 를 쓰고 **nginx 를
  거치지 않으므로 헤더가 검증되지 않는다.** 헤더·CSP 위반 여부는 `docker build && docker run` 으로
  **수동 검증**한다(DevTools Console 의 CSP violation 0건 + Application 탭 SW activated 확인).
- 배포 시 주의: `connect-src 'self' https:` 는 넓다. 실제 API/CDN 도메인으로 좁혀라. 또한
  템플릿 기본 API(`http://localhost:3000`, 평문)와 MSW 목을 함께 쓰는 도커 데모를 그대로
  띄우면 `connect-src`/`upgrade-insecure-requests` 와 충돌할 수 있다 — 실배포는 https 백엔드 +
  `VITE_ENABLE_MOCK=false` 를 전제로 한다([`SECURITY.md`](../../SECURITY.md)).
- 대안(Semgrep 류 정책 CSP 생성, helmet 식 동적 헤더)은 정적 nginx 단순성을 깨므로 채택하지 않음.

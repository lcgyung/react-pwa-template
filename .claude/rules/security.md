---
paths:
  - 'src/**'
  - 'nginx.conf'
  - 'vite.config.ts'
  - 'Dockerfile'
  - '.github/workflows/**'
  - '.gitleaks.toml'
---

# 보안 규칙

> 위협 모델·의도된 트레이드오프는 [`SECURITY.md`](../../SECURITY.md), 점검표는
> [`docs/secure-harness-react-shadcn-pwa.md`](../../docs/secure-harness-react-shadcn-pwa.md) 참고.

- **DOM XSS** — `eslint-plugin-no-unsanitized`가 `dangerouslySetInnerHTML`·`innerHTML` 등
  DOM XSS sink를 **error로 차단**한다(불가피하면 DOMPurify). `eslint-plugin-security`(휴리스틱, warn)도 켜져 있다.
- **오픈 리다이렉트 방지** — 리다이렉트 대상은 `@/shared/lib/url`의
  `isInternalPath`/`resolveInternalRedirect`로 내부 경로만 허용한다(로그인 후 복귀 경로 등).
- **CSP·보안 헤더** — 정본은 `nginx.conf`(CSP는 서비스 워커 호환, frame-ancestors/XFO/Referrer-Policy/
  Permissions-Policy 포함). 로컬 dev/preview는 CSP 없이 동작 — 의도된 부재이니 dev에 CSP를 추가하지 말 것.
  `style-src 'unsafe-inline'` 트레이드오프는 [ADR 0005](../../docs/adr/0005-csp-and-security-headers.md) 참고.
- **시크릿 스캔** — pre-commit(gitleaks)과 CI(gitleaks + dist 빌드 산출물 grep)가 이중으로 돈다.
  예외 경로는 `.gitleaks.toml`에서 관리한다.
- **토큰 저장** — 토큰은 localStorage(의도된 선택 — 프로덕션은 httpOnly 쿠키 권장, 백엔드 필요).
  트레이드오프는 [ADR 0004](../../docs/adr/0004-auth-token-storage.md) 참고. 로그아웃 시
  `clearOfflineStorage`(`@/shared/lib/clearOfflineStorage`)가 토큰·React Query 캐시에 더해 교차출처
  런타임 캐시·IndexedDB까지 정리한다(PWA 오프라인 캐시 잔존 방지).
- **빌드 위생** — 프로덕션 minify에서 `console.log/info/debug`·`debugger`를 제거한다
  (`console.error` 보존). ⚠️ 배포 전 `.env.production`의 `VITE_ENABLE_MOCK=false` — 기본값(true)으로
  빌드하면 MSW 목 인증(데모 계정)이 프로덕션 번들에 포함된다.
- **RBAC 한계** — 라우트 가드·메뉴 필터링은 프런트엔드(UX) 차원의 제어일 뿐이다.
  실제 데이터 권한은 백엔드에서 강제해야 한다.

# 시큐어 코딩 하네스 체크리스트 — React + shadcn/ui + PWA (App)

> 프론트엔드 공통 보안 + **PWA 특화 위협(서비스 워커·캐시·오프라인 저장)**을 함께 다룹니다.
> 진짜 보안 경계는 서버이며, 프론트는 추가 방어선 + 클라이언트 측 취약점 제거에 집중합니다.
> 우선순위: 🔴 필수 · 🟡 권장 · 🟢 선택
>
> **구현 상태**: 프론트 단독으로 가능한 항목은 적용 완료(아래 체크). 백엔드가 필요한 항목
> (httpOnly 쿠키·서버 검증·인증 갱신)과 후속 항목은 미체크 + 주석으로 표기하며, 배경은
> [`SECURITY.md`](../SECURITY.md) · [`docs/adr/0005`](adr/0005-csp-and-security-headers.md) 참고.
>
> **이 문서는 규칙이 아니라 현행 상태 점검표입니다** — 작업 규칙은
> [`.claude/rules/security.md`](../.claude/rules/security.md), 결정 배경은 [`docs/adr/`](adr/) 참고.

---

## 0. 보안 자동화 기반

- [x] 🔴 `eslint-plugin-security` + `eslint-plugin-no-unsanitized` + `eslint-plugin-react`
- [ ] 🔴 SAST — Semgrep / CodeQL CI 게이트 _(private 개인 저장소는 GHAS 미제공으로 CodeQL 미적용 — 공개 전환 또는 GHAS 필요. 워크플로 제거됨)_
- [x] 🔴 시크릿 스캔 — gitleaks (pre-commit + CI)
- [x] 🔴 SCA — `pnpm audit` / osv-scanner / Socket(공급망) _(audit high+ 차단 + osv 보고)_
- [x] 🔴 lockfile 커밋 + `--frozen-lockfile`
- [x] 🟡 의존성 자동 업데이트 (Renovate / Dependabot)
- [x] 🟢 SBOM 생성 _(CycloneDX, cdxgen — CI `sca` 잡, 비차단 아티팩트)_

## 1. XSS 방지

- [x] 🔴 `dangerouslySetInnerHTML` 원칙적 금지 — 불가피하면 DOMPurify _(현재 사용 0건, lint 강제)_
- [x] 🔴 `eslint-plugin-no-unsanitized`로 자동 탐지 _(method/property = error)_
- [ ] 🔴 사용자 입력을 `href`/`src`에 넣을 때 `javascript:` 스킴 차단 _(현재 동적 href/src 없음 — 도입 시 적용)_
- [ ] 🟡 마크다운/리치텍스트 sanitize (화이트리스트) _(현재 리치텍스트 없음)_
- [x] 🟡 `eval` / `new Function` 사용자 입력 금지 _(eslint-plugin-security detect-eval 경고)_
- [x] 🟢 shadcn/Tailwind는 className 조합 위주라 XSS 표면 작음 — 단, 동적 HTML 삽입은 동일 규칙

## 2. 시크릿 & 환경변수

- [x] 🔴 **프론트 번들에 비밀키 금지** — `VITE_` 접두는 전부 공개됨을 문서화 _(SECURITY.md §2)_
- [x] 🟡 빌드 산출물 시크릿 grep 검사 CI _(build 잡 dist 스캔)_

## 3. 인증 토큰 / 세션

- [ ] 🔴 토큰은 `httpOnly` 쿠키 권장 (XSS 탈취 방지) _(백엔드 필요 — 현재 localStorage, ADR-0004 / SECURITY.md §1)_
- [x] 🔴 로그아웃 시 토큰/세션 + **캐시·오프라인 저장 데이터까지** 정리 _(clearOfflineStorage)_
- [ ] 🟡 인증 갱신 흐름 + 실패 시 안전한 리다이렉트 _(안전 리다이렉트 완료, 갱신은 백엔드)_
- [x] 🟡 라우트 가드 (서버 인가가 진짜 경계)

## 4. CSP & 보안 헤더

- [x] 🔴 CSP — `script-src` 제한, **서비스 워커 동작과 호환되게 설정** _(nginx.conf, ADR-0005)_
- [x] 🔴 `frame-ancestors` (클릭재킹 방지) _(+ X-Frame-Options DENY)_
- [ ] 🟡 서드파티 스크립트 SRI _(현재 서드파티 인라인 스크립트 없음)_
- [x] 🟡 `Referrer-Policy`, `Permissions-Policy`

## 5. PWA 보안 — 서비스 워커

- [x] 🔴 **HTTPS 필수** — SW는 보안 컨텍스트에서만 동작 (로컬도 HTTPS) _(build && preview / 프로덕션 https)_
- [x] 🔴 SW 스코프 최소화 — 필요 경로로만 등록 _(SPA 라 scope '/' 가 최소 필요 범위)_
- [x] 🔴 **인증된 API 응답을 precache/영구 캐시에 넣지 않기** _(/api NetworkOnly + navigateFallbackDenylist)_
- [x] 🔴 캐싱 전략 명시 — 정적 자산만 cache-first, API는 network-first/no-store
- [x] 🟡 SW 업데이트 무결성 — 새 SW 활성화 흐름 제어, skipWaiting 신중히 _(registerType 'prompt', skipWaiting 미사용)_
- [x] 🟡 Workbox runtime 캐시에 민감 경로 제외 규칙 _(/api 제외)_
- [ ] 🟢 SW 코드도 SRI/번들 무결성 검증 대상에 포함 _(후속)_

## 6. PWA 보안 — 오프라인 저장 & 매니페스트

- [ ] 🔴 **IndexedDB/Cache/localStorage에 민감정보·시크릿·토큰 평문 저장 금지** _(토큰 localStorage 는 의도된 트레이드오프 — SECURITY.md §1)_
- [x] 🟡 오프라인 캐시 데이터에 만료/정리 정책 (로그아웃·세션 종료 시 삭제) _(expiration + clearOfflineStorage)_
- [x] 🟡 `manifest.json`에 민감정보 없음 확인, 아이콘/URL 검증
- [ ] 🟢 푸시 알림 — 페이로드 검증, 민감정보 알림 본문에 노출 금지 _(미구현 — 파리티 이후)_
- [ ] 🟢 백그라운드 동기화 큐에 민감 데이터 잔존 방지 _(미구현 — 파리티 이후)_

## 7. 안전한 데이터 흐름 / 라우팅

- [x] 🔴 오픈 리다이렉트 방지 — 대상 URL 화이트리스트 _(가드가 paths.\* 상수로만 리다이렉트)_
- [ ] 🔴 폼 검증 클라 + **서버 양쪽** _(클라 zod 완료, 서버는 백엔드)_
- [x] 🟡 API 타입 자동 생성(orval) — 응답 신뢰 경계 명확화 _(`pnpm gen:api`, ADR-0006)_
- [x] 🟡 prod 콘솔 로그/디버그 제거 _(esbuild pure/drop)_

## 8. CI/CD 보안 게이트

- [x] 🔴 PR 게이트 — lint(security) · 시크릿 · SCA _(SAST/CodeQL 은 GHAS 미제공으로 제외)_
- [ ] 🔴 브랜치 보호 + 필수 리뷰 _(CONTRIBUTING 문서화 — GitHub 저장소 설정 필요)_
- [x] 🟡 Lighthouse "Best Practices"(HTTPS·취약 라이브러리) 임계값 게이트 _(0.9 error)_
- [ ] 🟡 에러 트래킹 (Sentry) — PII 스크러빙 _(후속 — SECURITY.md §5)_
- [ ] 🟢 서명 커밋 + 빌드 산출물 시크릿 스캔 _(dist 스캔 완료, 서명 커밋 미도입)_

---

## 권장 셋업 순서

1. 보안 자동화 기반 (security ESLint·SAST·시크릿·SCA) → CI 게이트화
2. XSS 방어 + 시크릿/환경변수 노출 점검
3. 토큰 저장 전략 + CSP(서비스 워커 호환)
4. **PWA 핵심 — SW 캐싱 정책(인증 응답 캐시 금지) + HTTPS**
5. 오프라인 저장 보안(민감정보 평문 금지 + 로그아웃 정리)
6. Lighthouse Best Practices 게이트 + 에러 트래킹

# 보안 정책 (Security Policy)

이 문서는 **React PWA Template** 의 위협 모델, 의도된 보안 트레이드오프, 그리고 취약점 신고
절차를 정리합니다. 구현된 보안 자동화·게이트 목록은 [`CLAUDE.md`](CLAUDE.md) "보안" 절을,
시큐어 코딩 체크리스트는 [`docs/secure-harness-react-shadcn-pwa.md`](docs/secure-harness-react-shadcn-pwa.md)
를 참고하세요.

## 위협 모델 (요약)

- **진짜 보안 경계는 서버다.** 이 템플릿은 프론트엔드(설치형 PWA)이며, 프론트의 모든 통제는
  **추가 방어선**일 뿐 실제 인가의 경계가 아니다.
- **RBAC 는 UX 제어다.** 라우트 가드(`ProtectedRoute`/`RoleRoute`)와 역할 기반 메뉴 필터는
  화면 노출을 제어할 뿐, **실제 데이터 권한은 백엔드가 강제**해야 한다. 프론트 RBAC 만으로
  민감 데이터를 보호하지 마라.
- 프론트가 책임지는 범위: 클라이언트 측 취약점 제거(XSS 표면 최소화), 안전한 데이터 흐름
  (오픈 리다이렉트 차단·폼 검증), PWA 특화 위협(서비스 워커·캐시·오프라인 저장) 대응.

## 의도된 트레이드오프 / 알려진 한계

이 템플릿은 **백엔드가 없는(MSW 목) 프론트 보일러플레이트**다. 아래 항목은 의도적으로
프론트 기본값을 택했으며, 프로덕션에서는 백엔드와 함께 강화해야 한다.

### 1. 토큰 저장 — localStorage (XSS 노출 위험)

- 현재: `authStore`(`@/entities/session`, Zustand persist)가 토큰/유저를 **localStorage** 에
  보관한다. 새로고침 후 세션 유지를 위한 템플릿 기본 선택이며, **XSS 발생 시 토큰 탈취에
  노출**된다. 설계 배경은 [`docs/adr/0004-auth-token-storage.md`](docs/adr/0004-auth-token-storage.md).
- **프로덕션 권장: `httpOnly` 쿠키**(JS 접근 불가 → XSS 탈취 방지). 이는 **백엔드가 `Set-Cookie`
  를 발급**해야 하므로 이 템플릿(목 API)에서는 구현하지 않는다. 실제 백엔드 연동 시 토큰을
  쿠키로 옮기고 `authStore` persist 를 제거하라.

### 2. `VITE_*` 환경변수는 전부 공개된다

- `VITE_` 접두 변수는 **빌드 번들에 인라인**된다. 비밀키·토큰을 절대 넣지 마라. 현재 사용하는
  변수는 공개 가능한 값뿐이다(`VITE_API_BASE_URL`, `VITE_ENABLE_MOCK`). `.env.example` 참고.
- 부팅 시 `shared/config/env.ts` 가 zod 로 검증하고, CI 는 gitleaks(커밋) + dist 번들 grep
  (산출물)으로 시크릿 유출을 점검한다.

### 3. ⚠️ 프로덕션 배포 전 `VITE_ENABLE_MOCK=false` 필수

- `.env.production` 기본값은 `VITE_ENABLE_MOCK=true` 다 — 백엔드 없이도 즉시 데모가 동작하도록
  한 선택이며, 이 상태로 빌드하면 **프로덕션 번들에 MSW 목 인증(데모 계정 허용)이 포함**된다.
- **실배포 시 반드시 `.env.production` 의 `VITE_ENABLE_MOCK=false` 로 바꾸고** `VITE_API_BASE_URL`
  을 실제 백엔드 주소로 설정하라. 그렇지 않으면 누구나 데모 계정으로 로그인할 수 있다.

### 4. 백엔드가 필요해 이 템플릿에서 다루지 않는 항목

- **서버측 폼 검증** — 클라이언트(zod)는 UX·1차 방어일 뿐, 신뢰 경계는 서버다.
- **인증 갱신(refresh) 흐름** — 현재는 401 시 인증 초기화 + `/login` 리다이렉트만 한다(안전한
  실패). 리프레시 토큰 회전은 백엔드 설계가 선행돼야 한다.
- **CSP `connect-src` 좁히기** — `nginx.conf` 는 `connect-src 'self' https:` 로 넓게 두었다.
  배포 시 실제 API/CDN 도메인으로 좁혀라([`docs/adr/0005-csp-and-security-headers.md`](docs/adr/0005-csp-and-security-headers.md)).

### 5. 후속(🟢, 향후)

- 의존성 SBOM(CycloneDX) 생성 · 에러 트래킹(Sentry, PII 스크러빙) · 서드파티 스크립트 SRI ·
  서명 커밋 · 푸시/백그라운드 동기화 보안. 도입 시 체크리스트와 본 문서를 갱신한다.

## 취약점 신고 (Reporting a Vulnerability)

보안 취약점은 **공개 이슈로 올리지 마세요.** GitHub **Security Advisories**
(저장소 → Security → "Report a vulnerability")를 통해 비공개로 신고해 주세요. 다음을 포함하면
분류가 빠릅니다.

- 영향 범위와 재현 절차(가능하면 PoC)
- 영향받는 커밋/버전
- 예상 심각도

초기 응답 목표는 영업일 기준 **3일 이내**이며, 확인된 취약점은 합의된 일정에 따라 패치 후
공개합니다.

# 0004. 인증 토큰 저장과 axios 인증 브리지(옵션 B)

- 상태: 채택됨
- 날짜: 2026-06-11

## 맥락

토큰을 어디에 두고, 도메인을 모르는 `shared/api` 레이어가 어떻게 그 토큰을 요청에 실을지 정해야
한다. FSD 단방향 의존상 `shared` 는 `entities/session`(authStore)을 import 할 수 없다.

## 결정

- **저장**: `authStore`(`@/entities/session`, Zustand persist)에 `token`/`user` 를 보관한다(localStorage
  지속). 새로고침 후에도 세션이 유지된다.
- **주입(의존성 역전, 옵션 B)**: `shared/api/axiosInstance` 는 도메인 의존성이 0이며, 토큰
  getter·401 핸들러를 `configureAuthBridge()` 로 외부에서 주입받는다. 실제 주입은
  `src/app/config/configureAxios.ts` 가 하고, `app/App.tsx` 최상단의 side-effect import 가 이를
  실행한다. 요청 인터셉터가 토큰을 `Authorization` 헤더에 싣고, 응답 인터셉터가 401 에서 인증을
  초기화하고 `/login` 으로 보낸다.

## 결과

- 장점: `shared` 가 도메인을 모른 채로 인증을 처리해 FSD 경계를 지킨다.
- 위험: `configureAxios` side-effect import 를 제거하면 **타입 에러 없이** 토큰 주입·401 리다이렉트가
  조용히 무력화된다 — 제거 금지. import 정렬에서 위치가 보존되도록 정렬 장벽으로 둔다.
- 트레이드오프: localStorage 토큰은 XSS 에 노출될 수 있다. 실데이터 권한은 백엔드가 강제해야 하며,
  RBAC(라우트·메뉴 필터)는 프런트 UX 차원의 제어일 뿐이다.

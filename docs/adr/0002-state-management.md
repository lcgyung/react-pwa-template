# 0002. 서버 상태 TanStack Query · 클라이언트 상태 Zustand

- 상태: 채택됨
- 날짜: 2026-06-11

## 맥락

서버에서 온 데이터(사용자 목록 등)와 클라이언트 전역 상태(인증 토큰, 테마)는 수명·무효화·동기화
요구가 다르다. 하나의 스토어에 둘을 섞으면 캐시 무효화와 로딩/에러 처리가 손으로 굴러간다.

## 결정

- **서버 상태**는 TanStack Query(React Query)로만 다룬다. 컴포넌트는 axios 를 직접 부르지 않고 각
  feature 의 `model` 훅(`useUsers`, `useLogin` 등)을 거친다. 쿼리 키는 슬라이스별 `<도메인>Keys`
  객체로 정의한다.
- **클라이언트 전역 상태**는 Zustand 로 다룬다(`authStore`=token/user, `themeStore`=light/dark, 둘 다
  persist). 서버 데이터는 Zustand 에 넣지 않는다.

## 결과

- 장점: 캐싱·재요청·무효화는 Query 가, 단순 전역 토글은 Zustand 가 담당해 책임이 분리된다.
- 규칙: React 외부(axios 인증 브리지)에서는 `getAuthToken()`/`clearAuthState()` 헬퍼로 스토어에
  접근한다([ADR-0004](0004-auth-token-storage.md) 참고).

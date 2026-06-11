# 0006. API 타입 — orval + 샘플 OpenAPI 스펙

- 상태: Accepted
- 날짜: 2026-06-11

## 맥락

API 응답 타입을 손으로 정의하면 백엔드 스펙과 어긋날 위험이 있다(수동 fetch 타이핑 문제). 다만
이 템플릿은 실제 백엔드 없이 MSW 목으로 동작하므로 소비할 OpenAPI 스펙 소스가 없다.

형제 템플릿 react-admin-template 이 동일한 결정을 먼저 채택했고(거기서는 ADR 0004), 두 템플릿의
데이터 레이어 패턴을 일치시키기 위해 pwa-template 도 같은 방식을 따른다.

## 결정

목 엔드포인트를 기술한 **샘플 OpenAPI 스펙**(`openapi/pwa-api.yaml`)을 직접 작성하고, **orval**
(`orval.config.ts`, `pnpm gen:api`)로 타입과 타입 클라이언트를 생성한다. 생성물은
`src/shared/api/generated/` 에 떨어지며 **커밋**한다(오프라인·리뷰 가능, CI 에 codegen 스텝 불필요).

- 생성된 DTO 타입(`LoginRequest`/`LoginResponse`/`ApiError`)은 `@/shared/api` 배럴로 재노출해
  소비한다. `features/auth` 의 수동 DTO 정의는 제거했다.
- 도메인 모델(`User`/`Role`/`CreateUserInput`)의 **단일 출처는 계속 `entities/user`** 다. 생성
  타입과 구조가 동일하므로 전송 경계에서 무손실로 호환된다.
- 생성된 클라이언트(`getPwaApi(axiosInstance)`)는 우리 인터셉터(인증 브리지)가 붙은 인스턴스를
  받도록 되어 있어 채택은 가능하나, 이 템플릿의 1차 데이터 레이어는 손으로 쓴 React Query 훅으로
  유지한다. orval 의 react-query 훅·MSW 목 생성은 기존 훅/핸들러와 충돌하므로 **끄둔다**.
- 생성물은 lint/prettier/steiger 대상에서 제외한다(`eslint.config.js` ignores · `.prettierignore` ·
  `steiger.config.ts` ignores). `model` 은 FSD 예약 세그먼트명이라 스키마 폴더는 `schemas` 로 둔다.

## 대안

- openapi-typescript(타입만): 클라이언트를 만들지 않아 더 가볍지만, admin 과의 패턴 일치를 위해
  orval 을 택했다.
- 수동 타입 유지: 스펙과의 동기화 보장이 없다.

## 결과

- API DTO 가 스펙에서 생성되어 수동 타이핑이 사라지고, admin-template 과 데이터 레이어 패턴이 일치한다.
- `entities` 와 생성 타입이 구조적으로 중복되나, 도메인 단일 출처는 `entities` 로 명확히 둔다.
- 실제 백엔드 연동 시 `openapi/pwa-api.yaml` 을 백엔드 제공 스펙으로 교체하고 `pnpm gen:api` 한다.

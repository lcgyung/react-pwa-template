---
name: test-driven-development
description: 프로덕션 코드(컴포넌트·훅·유틸·feature api)를 새로 작성하거나 동작을 바꿀 때 테스트를 먼저 쓰는 RED-GREEN-REFACTOR 규율. 테스트 우선 워크플로가 필요할 때 사용.
---

# 테스트 주도 개발 (TDD)

## 철칙

**실패하는 테스트 없이 프로덕션 코드 없다.** 런타임 로직을 한 줄 쓰기 전에, 그 로직이 없어서
실패하는 테스트를 먼저 작성하고 **실패를 직접 관찰**한다.

## RED → GREEN → REFACTOR

1. **RED** — 원하는 동작을 기술하는 테스트를 작성하고 `pnpm test`로 돌려 **실패를 확인**한다.
   오타·import 누락이 아니라 _의도한 이유_(미구현)로 실패하는지 본다.
2. **GREEN** — 그 테스트를 통과시킬 **최소** 코드만 작성한다. 통과를 확인한다.
3. **REFACTOR** — 초록 상태를 유지하며 중복 제거·구조 개선. 매 단계 재실행한다.

## 이 프로젝트 정합 (정본: `.claude/rules/testing.md`)

- 네트워크는 직접 스텁하지 말고 **MSW 핸들러 경유**(`vitest.setup.ts`가 항상 기동).
  케이스별로 응답을 바꿔야 하면 `server.use()`로 오버라이드한다.
- 단일 파일은 `pnpm exec vitest run <경로>`, 단일 케이스는 `pnpm exec vitest run -t "<테스트명>"`.
- **타입 전용 슬라이스는 테스트 비대상**(실행 라인 0 — 커버리지 래칫 무영향). TDD 대상은 런타임
  로직이 있는 쪽: 컴포넌트·훅·`features/*/api`·`entities/session`(zustand 스토어) 류.
- 커버리지 래칫(`vite.config.ts` thresholds)은 **하향 금지**, 테스트를 추가하며 점진 상향.

## PWA 는 vitest 로 검증하지 않는다

서비스 워커·설치 프롬프트·오프라인 캐시는 jsdom 에서 동작하지 않는다. `useInstallPrompt` 처럼
**이벤트 리스너 로직만 훅 단위로** 테스트하고(`src/features/pwa-install/model/`), SW 실동작은
`e2e/offline.spec.ts`(Playwright + `pnpm build && pnpm preview`)가 담당한다.
`src/features/pwa-install/ui/**` 가 커버리지에서 제외된 이유가 이것이다.

## 흔한 변명 (= 위반)

- "나중에 테스트 추가하겠다" — tests-after 는 TDD 가 아니다.
- "수동으로 확인했다" — 회귀를 막지 못한다.
- "이미 구현을 다 짜놨다" — 테스트 없이 작성된 코드는 참고용으로도 남기지 말고 지운 뒤 RED 부터 다시.

## 게이트와의 관계

`gate.sh`의 `test:related`는 세션 종료 시 도는 **사후 백스톱**이다. 이 스킬은 그 앞단에서
"테스트 먼저"를 보장해 게이트가 빨간 채로 끝나지 않게 한다.

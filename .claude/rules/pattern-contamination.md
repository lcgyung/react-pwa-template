---
paths:
  - 'src/**'
---

# Pattern Contamination 제거 (ELEMENT 1)

같은 일을 하는 **경쟁 패턴**·**dead code**·**deprecated logic**·**미완성 마이그레이션**을 끈질기게 정리한다.
hook(`contamination-report.sh`)이 세션 시작 시 knip 오염 후보를 주입한다 — 아래는 그 후보를 다루는 규칙이다.

## 발견 시

- **경쟁 패턴** — 같은 일을 하는 방식이 둘 이상이면 **한 쪽을 표준으로 고정하고 나머지를 제거**한다.
  표준이 모호하면 추측하지 말고 사용자/리뷰어에게 확인한다.
- **dead code · deprecated logic** — 참조가 없는 컴포넌트/훅/유틸/export, 대체된 옛 구현은 제거한다.
- **미완성 마이그레이션** — 절반만 옮겨진 패턴은 한 방향으로 통일한다(되돌리지 말 것).
- **범위** — 정리는 **현재 작업이 건드린 슬라이스 내에서만**. 전체 코드베이스 일괄 정리는 작업 diff 에
  섞지 말고 전용 스윕(`/contamination-sweep`)으로 분리한다.

## 커밋 분리 (강제)

- 오염 정리는 기능 변경(`feat`/`fix`)과 **절대 섞지 않는다**. **단독 `chore(cleanup): ...` 커밋**으로 분리한다.
  (commitlint 가 Conventional Commits 의 `chore` 타입을 이미 강제한다.)

## False positive 가드 (삭제 전 확인)

knip 후보는 **정적 그래프 기준**이라 동적 로드/공개 API 의도를 못 본다. 아래는 unused 로 보여도 **삭제 금지**:

- **FSD 공개 API 배럴** — `index.ts`/`index.tsx` 의 re-export 는 소비처가 아직 없어도 의도된 공개 API 일 수 있다.
- **라우터 lazy 로드 컴포넌트**, **MSW 핸들러**(`src/app/mocks`), **Storybook 스토리**(`*.stories.tsx`), **vitest setup**.
- **PWA** — `virtual:pwa-register` 기반 SW 등록, `widgets/pwa-badge`, `features/pwa-install`,
  `shared/lib/reportWebVitals`(동적 import)는 정적 그래프에서 끊겨 보일 수 있다.
- **생성물 `src/shared/api/generated/**`**(orval) — 수정/삭제 금지(재생성은 `pnpm gen:api`).
- FSD 레이어/Public API 경계는 **steiger(`pnpm lint:fsd`)** 가 이미 강제한다 — 그 위반과 혼동하지 말 것.
- 후보가 정말 dead 인지 `git grep`/참조로 확인한 뒤 제거한다.

## 오염이 아닌 것 (고치지 말 것)

- **`app/config/configureAxios` side-effect import**(`App.tsx` 최상단) — 제거하면 타입 에러 없이
  토큰 주입·401 리다이렉트가 조용히 무력화된다(CLAUDE.md gotcha). **제거 금지.**
- **`shared/ui` 의 소비처 0 shadcn 프리미티브** — 이 리포는 보일러플레이트라 아직 이 앱이 쓰지 않는
  컴포넌트를 **키트 인벤토리**로 보유한다. `knip.json` 의 `entry` 가 `src/shared/ui/**` 를 공개 API 로
  선언해 unused 판정에서 빼는 이유가 이것이다. 커버리지 래칫이 낮은 주된 원인이기도 하지만
  그것도 삭제 근거가 아니다(`testing.md` 커버리지 ratchet 참조).
  - 프리미티브를 지우면 **그에만 의존하던 컴포넌트가 전이로 dead 판정**된다(예: 상위 컴포넌트 →
    `Dialog`). knip 을 두 번 돌리면 키트가 연쇄로 무너지니 특히 조심할 것.
- **`features/*` 의 래퍼 훅** — 생성 훅/DTO 를 감싸 side-effect(authStore persist·리다이렉트·캐시
  무효화)만 얹는 계층이라 중복이 아니다. ESLint `local/no-generated-api-outside-wrapper` 가 `ui/` 의
  생성 심볼 직접 import 를 막으므로 **래퍼는 게이트가 강제하는 필수 계층**이다 — "얇으니 지우자"는 오판이다.

---
paths:
  - 'src/**/*.test.ts'
  - 'src/**/*.test.tsx'
  - 'src/**/*.spec.ts'
  - 'src/**/*.spec.tsx'
  - 'src/app/mocks/**'
  - 'e2e/**'
  - 'vitest.setup.ts'
  - 'vite.config.ts'
  - 'playwright.config.ts'
---

# 테스트 & 목 API 규칙

> 강제의 정본은 `vite.config.ts`(vitest 설정·coverage 임계값) · `vitest.setup.ts` ·
> `playwright.config.ts`다 — 이 문서는 그 해설·요약이며, 충돌 시 설정이 우선한다.
>
> 테스트를 **코드보다 먼저** 쓰는 워크플로(RED-GREEN-REFACTOR)는
> `.claude/skills/test-driven-development` 스킬이 담당한다. 이 rule 은 그 테스트가
> **무엇을 / 어떻게**(MSW 경유·커버리지 래칫) 돌아야 하는지의 정본이다.

## 목 API (MSW)

- `VITE_ENABLE_MOCK=true` 일 때 `src/main.tsx`가 MSW 워커를 기동한다.
- 핸들러는 `src/app/mocks/handlers.ts`(로그인/로그아웃/me/users), 시드 데이터는 `src/app/mocks/data.ts`.
- 테스트에서는 `src/app/mocks/server.ts`(setupServer)를 `vitest.setup.ts`가 기동한다 —
  테스트에서 네트워크를 직접 스텁하지 말고 MSW 핸들러를 경유한다.
- 데모 계정과 환경 변수(`VITE_ENABLE_MOCK` / `VITE_API_BASE_URL`)는 `README.md` 와 `.env.example` 참고.

## 실행

```bash
pnpm test                        # vitest run (jsdom) — e2e/ 는 제외
pnpm exec vitest run src/app/router/guards.test.tsx   # 단일 파일
pnpm exec vitest run -t "redirects to /login"         # 테스트명(-t)으로 단일 케이스
pnpm test:related <파일...>      # 변경 파일 관련 테스트만 (Stop 게이트·pre-commit 이 사용)
pnpm test:coverage               # 커버리지 임계값 강제 (pnpm verify·CI 가 사용)
pnpm test:e2e                    # Playwright (preview 기준) — 오프라인 시나리오 포함
```

## PWA 테스트 주의

- 서비스 워커·설치 프롬프트는 `pnpm dev`에서 동작하지 않는다. PWA 동작 검증은
  `pnpm build && pnpm preview`로만 한다.
- 오프라인 동작(네트워크 차단 후 캐시 응답)은 `e2e/`의 Playwright 스펙으로 검증한다.

## 커버리지 ratchet

- `pnpm test:coverage`(v8)가 `vite.config.ts`의 임계값을 강제하고 **CI 의 test 스텝**이 이를 사용한다.
  로컬 게이트(Stop `gate.sh` · pre-commit)는 `vitest related`(변경 파일 관련 테스트만, 커버리지 미포함)로
  빠르게 검증하므로 **전체 커버리지 ratchet 은 CI 에서만 강제**된다.
- 임계값은 현재 베이스라인 바로 아래로 고정돼 있고, 테스트를 추가하며 PR마다 **점진 상향**한다.
  **하향 금지.**
- **분모가 바뀌는 변경**(coverage provider 메이저 업, exclude 목록 조정)으로 수치가 흔들리면
  하향이 아니라 **재보정**이다 — 반드시 근거를 `vite.config.ts` 주석에 남긴다(현행 주석의
  v8 4.x 전수 계측 재보정 사례 참조).
- **`shared/ui` shadcn 키트는 소비처 없이도 분모에 남는다.** 이 리포는 보일러플레이트라 아직 이 앱이
  쓰지 않는 프리미티브를 인벤토리로 보유한다(`knip.json` 의 `entry` 가 `src/shared/ui/**` 를 공개
  API 로 선언하는 이유). 래칫이 낮아 보이는 주된 원인이지만 **낮다고 컴포넌트를 지우지 말 것** —
  `pattern-contamination.md` 의 "오염이 아닌 것" 참조.

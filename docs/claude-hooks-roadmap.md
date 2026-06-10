# Claude Code 자동화 — 로드맵 / 잔여 작업(TODO)

> `.claude/`(settings·hooks·skills·agents) 자동화의 **현황과 남은 로드맵**을 담는다. 구현
> 완료분은 코드에 반영돼 있고, 아래 TODO는 별도 컨텍스트에서 진행한다. 자매 프로젝트
> `react-admin-template` 와 동일한 자동화 골격을 공유하되, **PWA 전용 항목**이 더해진다.

## 구현 완료 (`.claude/`)

- **SessionStart** — 브랜치 + shadcn/Tailwind v4·PWA 규칙(테마 토큰 / `cn()` / label·aria 접근성) 주입.
- **PreToolUse(Bash) 가드** — `rm -rf /|~|$HOME`, force push, `reset --hard` 차단.
- **PostToolUse 포맷** — 변경 `*.ts/*.tsx` 에 `pnpm exec prettier --write`(Tailwind 클래스 정렬 포함) + `eslint --fix`, `*.{css,scss,json,md}` 에 prettier.
- **PostToolUse `check-pwa.sh`(PWA 전용)** — PWA 관련 파일 변경 시 manifest 필수 필드(name/short_name/start_url/display/icons) 검증. 누락 시 exit 2.
- **Stop 게이트(부분)** — `pnpm exec tsc -b --noEmit`(Vite project references) + `pnpm exec eslint .`. 실패 시 exit 2 로 피드백.
- **code-review 스킬 + code-reviewer 서브에이전트** — git diff 기반 React + shadcn/UI + PWA 리뷰.

## 잔여 / TODO

- [ ] **`/tdd` 스킬** (RED→GREEN→REFACTOR 안내) — `.claude/skills/tdd/SKILL.md`. `code-review`
      스킬과 같은 컨벤션. 기존 테스트 예시 참조: `src/utils/format.test.ts`(유닛),
      `src/routes/guards.test.tsx`(가드), `src/pages/LoginPage.test.tsx`(컴포넌트+MSW).
      "RED 상태로 턴 종료 금지" 명시.
- [ ] **Stop 게이트에 vitest 추가** — 현재 `tsc + eslint`만. `pnpm exec vitest run --silent`
      포함. **`stop_hook_active` 무한루프 가드를 반드시 동반**(아래 가드레일 참고).
- [ ] **Stop 게이트에 `prettier --check` 추가** — 현재 누락. ⚠️ **현재 트리에 미포맷
      파일(약 17개)이 있으므로, 게이트를 켜기 전에 `pnpm format` 으로 선(先)포맷**해야 막히지
      않는다.
- [ ] **(백로그) coverage 임계값 ratchet** — "작업마다 테스트 존재"까지 _기계적_ 강제.
      `vitest run --coverage` + thresholds(`@vitest/coverage-v8` 필요). 현재 테스트가 적어
      임계값은 낮게 시작 → 점진 상향. 잔여 3건과 별개의 후속 항목.
- [ ] **문서 동기화** — 게이트 변경 후 `CLAUDE.md` 의 Stop 게이트 설명 갱신.

## 메모 / 가드레일

- **무한루프 가드(필수)** — 현 `gate.sh` 는 stdin/`stop_hook_active` 를 검사하지 않는다.
  테스트 게이트를 붙이면 쉽게 못 고치는 실패(플레이키·환경·의도적 RED)가 `exit 2` 로 반복될
  수 있으므로, 게이트 시작부에서 stdin을 읽어 `stop_hook_active == true` 면 즉시 `exit 0`.
- **전체 트리 검사 주의** — `eslint .`/`prettier --check .` 는 세션이 안 건드린 기존 이슈에도
  막힌다. 특히 **prettier는 현재 미포맷 파일이 있어** 먼저 `pnpm format` 으로 정리해야 한다
  (eslint·tsc 는 현재 클린).
- **게이트의 한계** — 게이트는 "회귀 방지"지 _미작성_ 테스트는 못 잡는다. 커버리지 밖 로직은
  통과해도 버그가 있을 수 있으므로 `/tdd`(소프트 유도) + coverage ratchet(하드 강제)로 보완.
- **성능 튜닝** — 전체 `vitest run` 유지(현재 ~1.5초). 느려지면(>~10s) `vitest related --run`
  으로 변경분 관련 테스트만 도는 튜닝 고려.
- **타입체크 모드** — Vite project references 구조라 `tsc --noEmit` 대신 **`tsc -b --noEmit`**
  를 쓴다(산출물 없이 참조 프로젝트까지 검사).
- **PWA 확인** — Service Worker·설치 동작은 `pnpm dev` 가 아니라 `pnpm build && pnpm preview`
  에서만 동작한다. `check-pwa.sh` 가 manifest 필드를 1차 검증하지만, 실제 SW/오프라인은 빌드
  미리보기로 확인한다.
- **커밋 안전망** — husky/lint-staged(`*.{ts,tsx}` → eslint --fix + prettier)는 커밋 시점
  안전망으로 유지(편집·종료 게이트와 보완).

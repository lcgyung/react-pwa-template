# Claude Code 훅 자동화 — 구현 현황 및 잔여 작업

> 구현 완료분은 `.claude/`(settings·hooks·skills·agents)에 반영되어 있다. 이 문서는 상태 기록이며,
> 기존 블루프린트(react-admin-template 의 구 `docs/tdd-workflow.md` 설계 공유) 대비
> **미구현/부분 구현** 항목을 잔여 작업으로 남긴다. 잔여 작업은 별도 컨텍스트에서 진행한다.

## 구현 완료 (`.claude/`)

- **SessionStart** — 브랜치 + shadcn 규칙(cn() 클래스 병합 / CSS 변수 토큰 / components/ui 과수정 지양) + PWA 규칙 주입.
- **PreToolUse(Bash) 가드** — `rm -rf /|~|$HOME`, force push, `reset --hard` 차단.
- **PostToolUse 포맷** — 변경 `*.ts/*.tsx` 에 prettier + `eslint --fix`(**Tailwind 클래스 정렬 포함**, prettier-plugin-tailwindcss), `*.{css,json,md,webmanifest}` 에 prettier.
- **PostToolUse check-pwa** — manifest/SW/vite.config 변경 시 `vite.config.ts` 의 VitePWA manifest 필수 필드(name/short_name/start_url/display/icons) 점검.
- **Stop 게이트(부분)** — `pnpm exec tsc -b --noEmit`(Vite project references) + `pnpm exec eslint .`. 실패 시 exit 2 로 피드백.
- **code-review 스킬 + code-reviewer 서브에이전트** — git diff 기반 React+shadcn+PWA 리뷰.

## 잔여 (블루프린트 대비 미구현/부분 — 다른 컨텍스트에서 진행)

- [ ] **`/tdd` 스킬** (RED→GREEN→REFACTOR 안내) — 미구현.
- [ ] **Stop 게이트에 테스트 추가** — 현재 `tsc + lint`만. 블루프린트 목표는 `test → lint → prettier --check`.
      유닛/컴포넌트(`vitest run`)를 게이트에 포함(관련 테스트만 도는 튜닝 고려).
- [ ] **Stop 게이트에 `prettier --check` 추가**.

## 메모

- husky/lint-staged 는 **커밋 시점 안전망**으로 유지(편집·종료 게이트와 보완).
- `prettier-plugin-tailwindcss` 설치 + `.prettierrc.json` 등록 완료 → 포맷 시 Tailwind 클래스 자동 정렬 동작.
- PWA 설치 가능성/오프라인은 빌드 후 Lighthouse 로 별도 검증(CI 권장, 훅 부적합).

#!/usr/bin/env bash
# Stop: 타입체크 + 린트 + 포맷 + 테스트 + FSD 경계 게이트. 실패 시 exit 2 → Claude가 계속 수정
# 단계 정의의 정본은 package.json scripts(`pnpm verify` 와 동일 단계) — 여기선 스크립트를 호출만
# 한다. 단, `pnpm verify` 자체는 && 체인이라 첫 실패에서 멈추므로 직접 쓰지 않고, 전 단계를 모두
# 실행해 에러를 집계하는 이 구조를 유지한다(Claude가 한 번에 전부 고치도록).
set -uo pipefail

# 무한루프 가드: 이미 Stop 훅이 차단해 재시도 중이면 통과시킨다.
INPUT=$(cat 2>/dev/null || true)
if printf '%s' "$INPUT" | jq -e '.stop_hook_active == true' >/dev/null 2>&1; then
  exit 0
fi

# 모드별 하네스 제어: plan 모드는 코드 변경이 없으므로 풀 verify 스킵(약한 제어 — 사람이 계획만
# 검토 중). 그 외(default·acceptEdits·bypassPermissions)는 아래 풀 게이트를 그대로 강하게 실행.
if printf '%s' "$INPUT" | jq -e '.permission_mode == "plan"' >/dev/null 2>&1; then
  exit 0
fi

# cwd 가드: tsc -b/eslint/vitest/steiger 는 repo 루트 전제. 하위 디렉터리 실행 시 거짓 실패 방지.
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}" || exit 0

ERR=""

if ! pnpm typecheck >/tmp/cc_tsc.log 2>&1; then
  ERR+="[typecheck 실패]\n$(tail -n 40 /tmp/cc_tsc.log)\n\n"
fi

if ! pnpm lint >/tmp/cc_eslint.log 2>&1; then
  ERR+="[lint 실패]\n$(tail -n 40 /tmp/cc_eslint.log)\n\n"
fi

if ! pnpm format:check >/tmp/cc_prettier.log 2>&1; then
  ERR+="[format 실패 — pnpm format 으로 정리]\n$(tail -n 20 /tmp/cc_prettier.log)\n\n"
fi

# `pnpm test --silent` 는 --silent 가 pnpm 자체 플래그와 모호하므로 vitest 를 직접 호출한다.
if ! pnpm exec vitest run --silent >/tmp/cc_vitest.log 2>&1; then
  ERR+="[test 실패]\n$(tail -n 40 /tmp/cc_vitest.log)\n\n"
fi

if ! pnpm lint:fsd >/tmp/cc_steiger.log 2>&1; then
  ERR+="[FSD 경계 위반 — steiger]\n$(tail -n 40 /tmp/cc_steiger.log)\n\n"
fi

if [ -n "$ERR" ]; then
  printf "%b" "$ERR" >&2
  exit 2
fi
exit 0

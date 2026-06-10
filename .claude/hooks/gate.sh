#!/usr/bin/env bash
# Stop: 타입체크 + 린트 + 포맷 + 테스트 + FSD 경계 게이트. 실패 시 exit 2 → Claude가 계속 수정
# Vite project references 구조이므로 `tsc -b`(빌드 모드)로 타입체크. --noEmit 로 산출물 없이 검사.
set -uo pipefail

# 무한루프 가드: 이미 Stop 훅이 차단해 재시도 중이면 통과시킨다.
INPUT=$(cat 2>/dev/null || true)
if printf '%s' "$INPUT" | jq -e '.stop_hook_active == true' >/dev/null 2>&1; then
  exit 0
fi

# cwd 가드: tsc -b/eslint/vitest/steiger 는 repo 루트 전제. 하위 디렉터리 실행 시 거짓 실패 방지.
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}" || exit 0

ERR=""

if ! pnpm exec tsc -b --noEmit >/tmp/cc_tsc.log 2>&1; then
  ERR+="[typecheck 실패]\n$(tail -n 40 /tmp/cc_tsc.log)\n\n"
fi

if ! pnpm exec eslint . >/tmp/cc_eslint.log 2>&1; then
  ERR+="[lint 실패]\n$(tail -n 40 /tmp/cc_eslint.log)\n\n"
fi

if ! pnpm exec prettier --check . >/tmp/cc_prettier.log 2>&1; then
  ERR+="[format 실패 — pnpm format 으로 정리]\n$(tail -n 20 /tmp/cc_prettier.log)\n\n"
fi

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

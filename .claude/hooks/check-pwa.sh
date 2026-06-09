#!/usr/bin/env bash
# PostToolUse(PWA): manifest/서비스워커 관련 파일이 변경됐을 때만 manifest 필수 필드 점검.
# 무거운 빌드/lighthouse 는 하지 않는다(피드백만).
#
# 이 템플릿은 vite-plugin-pwa 를 쓰므로 정적 manifest 파일이 public/ 에 없고,
# manifest 는 vite.config.ts 의 VitePWA({ manifest: {...} }) 가 빌드시 생성한다.
# 따라서 1순위로 정적 manifest(있으면 jq 검증), 없으면 vite.config 의 manifest 블록을 점검한다.
set -uo pipefail
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
case "$FILE" in
  *manifest*|*sw.*|*service-worker*|*vite.config.*) : ;;
  *) exit 0 ;;
esac

REQUIRED="name short_name start_url display icons"
MISSING=""

# 1) 정적 manifest 가 있으면 그것을 jq 로 검증
MF=$(ls public/manifest.webmanifest public/manifest.json 2>/dev/null | head -n1)
if [ -n "$MF" ]; then
  for k in $REQUIRED; do
    jq -e --arg k "$k" 'has($k)' "$MF" >/dev/null 2>&1 || MISSING+="$k "
  done
else
  # 2) vite-plugin-pwa: vite.config.* 의 manifest 키 존재만 가볍게 확인
  VC=$(ls vite.config.ts vite.config.js vite.config.mjs 2>/dev/null | head -n1)
  [ -z "$VC" ] && exit 0
  # `name` 은 `short_name` 과 구분 위해 단어 경계 사용
  grep -qE '[^_]name:' "$VC"   || grep -qE '^[[:space:]]*name:' "$VC" || MISSING+="name "
  grep -qE 'short_name:' "$VC" || MISSING+="short_name "
  grep -qE 'start_url:' "$VC"  || MISSING+="start_url "
  grep -qE 'display:' "$VC"    || MISSING+="display "
  grep -qE 'icons:' "$VC"      || MISSING+="icons "
fi

if [ -n "$MISSING" ]; then
  echo "[PWA manifest 경고] 누락 필드: $MISSING — 설치 가능성에 영향" >&2
  exit 2   # 피드백을 Claude에게 전달해 보강 유도
fi
exit 0

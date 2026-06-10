#!/usr/bin/env bash
# SessionStart: 현재 브랜치/규칙을 컨텍스트로 주입
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
jq -n --arg b "$BRANCH" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: ("현재 브랜치: \($b)\nFSD 규칙: 레이어 단방향 의존(app>pages>widgets>features>entities>shared)만 허용, 같은 레이어 슬라이스 간 import 금지(예외: entities @x). 슬라이스 간 import는 index.ts Public API 경유(shared/ui 프리미티브는 파일 직접 import 허용). 새 코드는 해당 슬라이스의 ui/api/model/lib/config 세그먼트에 배치.\nshadcn 규칙: 클래스 병합은 cn()(@/shared/lib/cn), 디자인 토큰(CSS 변수) 사용, shared/ui 프리미티브 원본 과수정 지양.\nPWA: manifest 필수 필드 유지, 서비스워커 오프라인 fallback 유지.")
  }
}'

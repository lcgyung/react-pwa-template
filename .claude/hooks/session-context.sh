#!/usr/bin/env bash
# SessionStart: 현재 브랜치/규칙을 컨텍스트로 주입
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
jq -n --arg b "$BRANCH" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: ("현재 브랜치: \($b)\nshadcn 규칙: 클래스 병합은 cn(), 디자인 토큰(CSS 변수) 사용, components/ui 원본 과수정 지양.\nPWA: manifest 필수 필드 유지, 서비스워커 오프라인 fallback 유지.")
  }
}'

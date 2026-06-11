#!/usr/bin/env bash
# SessionStart: 현재 브랜치를 컨텍스트로 주입 (정적 규칙은 CLAUDE.md·.claude/rules 가 담당)
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
jq -n --arg b "$BRANCH" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: ("현재 브랜치: \($b)\n\n[출력 언어] 응답·커밋·PR 은 한글로 작성(코드 식별자·`feat:` 등 프리픽스는 원문 유지).")
  }
}'

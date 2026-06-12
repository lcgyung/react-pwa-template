# Contributing

이 저장소에 기여할 때의 브랜치 전략·커밋 컨벤션·버전 규칙입니다. 코드 작업 규칙(FSD 경계,
UI 규약 등)은 [`CLAUDE.md`](CLAUDE.md)를 참고하세요.

## 브랜치 전략

- `main` — 릴리스(보호) 브랜치. 직접 푸시 금지, PR로만 병합합니다.
- `dev` — 통합 브랜치. 기능 작업이 모이는 기본 작업 라인입니다.
- 작업 브랜치 — 용도에 따라 `feat/*`, `fix/*`, `chore/*`, `docs/*` 등으로 분기합니다.
- 모든 변경은 **PR을 경유**하며, CI(lint → lint:fsd → test → build) 통과를 전제로 병합합니다.

## 커밋 & PR 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/)를 따릅니다.

```text
<type>(<scope>): <subject>
```

- `type`: `feat`(기능) · `fix`(버그) · `chore`(잡무) · `docs`(문서) · `refactor` · `test` · `build` · `ci` 등.
- `scope`: 선택. 변경 범위(예: `auth`, `pwa`, `fsd`).
- 예: `feat(auth): 리프레시 토큰 로테이션 추가`, `chore: v0.1.0 초기 릴리스 설정`.
- **언어**: 타입 프리픽스(`feat`·`fix` 등)는 영문 유지, **제목(subject)·본문은 한글**로 작성
  ([CLAUDE.md](CLAUDE.md) 출력 언어 규칙).

커밋 시 Husky + lint-staged가 변경 파일에 `eslint --fix` + `prettier`를 자동 적용합니다.

## 버전 규칙 (SemVer)

[Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다 — `MAJOR.MINOR.PATCH`.

- **MAJOR** — 하위 호환이 깨지는 변경.
- **MINOR** — 하위 호환되는 기능 추가.
- **PATCH** — 하위 호환되는 버그 수정.

릴리스 절차: `package.json`의 `version` 갱신 → [`CHANGELOG.md`](CHANGELOG.md)에 항목 추가 →
`dev → main` PR 병합 → `main`에서 `vX.Y.Z` 태그 푸시 및 GitHub Release 생성(릴리스 노트는
CHANGELOG 해당 항목과 일치).

## 로컬 검증

PR 전 아래가 모두 통과해야 합니다(Stop 게이트가 자동 검사).

```bash
pnpm lint        # eslint
pnpm lint:fsd    # FSD 레이어 경계 (Steiger)
pnpm test        # vitest
pnpm build       # tsc -b + vite build
```

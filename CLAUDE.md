# CLAUDE.md

이 문서는 Claude Code(claude.ai/code)가 이 리포지토리에서 작업할 때 참고하는 가이드입니다.

**React PWA Template** — React + TypeScript + Vite 기반 PWA(설치형·오프라인) 템플릿. 기능 목록·
기술 스택·빠른 시작·데모 계정 등 개요는 [`README.md`](README.md)를 참고하세요. 형제 템플릿인
**react-admin-template** 과 동일한 톤·구조·도구 체계를 따르며, 차이는 UI(Shadcn/UI +
Tailwind CSS v4)와 PWA(vite-plugin-pwa) 부분뿐입니다.

**문서 계층** — 이 문서는 "지도 + 불변 경고"만 담는다. 주제별 상세 규칙의 단일 출처는
[`.claude/rules/`](.claude/rules/)(편집 파일 경로에 따라 자동 주입: `fsd-architecture` ·
`code-style` · `testing` · `security` · `slice-blueprint` · `pattern-contamination`), 결정 배경은 [`docs/adr/`](docs/adr/),
현행 점검표는 `docs/harness-*.md`. **같은 내용을 여러 문서에 중복 기술하지 말고 링크로 대체할 것.**

## 출력 언어 (한글 통일)

Claude Code 의 모든 **응답·커밋 메시지·PR(제목·본문)** 은 한글로 작성한다. 한영 혼용을 피하고
한글로 통일한다. 단, **코드 식별자·타입·로그 문자열 등 코드 자체**와 **Conventional Commits 타입
프리픽스(`feat:`·`fix:` 등)**, 외부 고유명사·기술 용어는 원문(영문) 그대로 둔다.

## Node 버전 / 패키지 매니저

- **Node 24** 타깃. 버전을 올릴 때는 네 곳을 함께 맞춘다: `.nvmrc` · `package.json` `engines.node` ·
  CI `node-version` · Dockerfile base 이미지. `@types/node` 는 admin-template 과 동일하게 `^25`(현행
  메이저)로 둔다 — 갓 발행된 메이저는 dependabot cooldown·pnpm `minimumReleaseAge` 게이트가 자동 소킹한다.
- **pnpm** 사용(npm/yarn 금지). pnpm 10+ 는 의존성 빌드 스크립트를 기본 차단하며, `esbuild`/`msw`
  허용 설정은 `pnpm-workspace.yaml`(`onlyBuiltDependencies`)에 있다.

## 자주 쓰는 명령어

```bash
pnpm dev                         # 개발 서버 (5173) — PWA(SW/설치)는 여기서 동작 안 함
pnpm build                       # tsc -b 타입체크 + vite build (SW/매니페스트 생성)
pnpm preview                     # 빌드 산출물 미리보기 — PWA 검증은 build && preview 로만
pnpm lint                        # eslint .
pnpm lint:fsd                    # FSD 레이어 경계 검사 (Steiger) — 위반 시 CI/게이트 하드 실패
pnpm format                      # prettier --write .
pnpm knip                        # dead code/unused export 탐지 (Pattern Contamination)
pnpm gen:api                     # OpenAPI 스펙(openapi/pwa-api.yaml) → API 타입 생성 (orval, 생성물 커밋)
pnpm gen:slice                   # FSD feature/entity 슬라이스 골격 생성 (plop, slice-blueprint 정본대로)

pnpm test                        # 단위/컴포넌트 테스트 (vitest run, jsdom)
pnpm test:watch                  # watch 모드
pnpm exec vitest run src/app/router/guards.test.tsx   # 단일 파일
pnpm exec vitest run -t "redirects to /login"         # 테스트명(-t)으로 단일 케이스

pnpm typecheck                   # 타입체크 단독 (tsc -b --noEmit, project references)
pnpm verify                      # typecheck + lint + format:check + lint:fsd + test:coverage (전체 정본, 빌드 제외)
pnpm verify:full                 # verify + build — 체크리스트의 "단일 명령" 전체 게이트

# 스코프 실행 — 훅·pre-commit 이 쓰는 파일 단위 변형(사람이 직접 쓸 일은 드물다)
pnpm lint:files <파일...>        # eslint --no-warn-ignored
pnpm format:check:files <파일...> # prettier --check --ignore-unknown
pnpm test:related <파일...>      # 변경 파일 관련 테스트만 (커버리지 미포함)

pnpm storybook                   # Storybook (6006)
pnpm build-storybook             # 정적 Storybook 빌드
```

테스트는 별도 커스텀 스크립트 없이 위의 Vitest 표준 단일 실행 방식을 사용하세요.

**검증 계층** — 같은 `package.json` scripts 를 단일 출처로 공유하되 스코프가 다르다.

| 시점            | 무엇이                     | 스코프                                                                       |
| --------------- | -------------------------- | ---------------------------------------------------------------------------- |
| Edit/Write 직후 | `format-changed-file.sh`   | 그 파일만 (prettier + eslint --fix)                                          |
| 턴 종료 (Stop)  | `gate.sh`                  | tsc·steiger 는 전체, eslint·prettier·vitest 는 **세션이 바꾼 파일만**        |
| 커밋            | `.husky/pre-commit`        | gitleaks(staged) → lint-staged → typecheck → lint:fsd → test:related(staged) |
| PR 전 (수동)    | `pnpm verify`              | 전체 5종 정본 (커버리지 포함)                                                |
| CI              | `.github/workflows/ci.yml` | `verify` 파리티 + build + gitleaks · sca · lighthouse · e2e                  |

커버리지 ratchet 은 **CI 에서만 전체 강제**된다 — 로컬 게이트는 `vitest related`(커버리지 미포함)로
빠르게 돈다.

## 프로젝트 구조 (FSD 6레이어)

경로 별칭: `@/*` → `src/*` (`tsconfig`, `vite.config.ts` 양쪽에 설정).
[Feature-Sliced Design 2.x](https://feature-sliced.design) 정석 6레이어를 따릅니다.

```text
src
├── app                       # 앱 전역 설정 (레이어=슬라이스, 세그먼트만 둠)
│   ├── providers/            #   AppProviders(+PWABadge 마운트), QueryProvider(+queryPersist)
│   ├── router/               #   router.tsx + ProtectedRoute/RoleRoute 가드
│   ├── mocks/                #   MSW handlers/data/browser/server
│   ├── styles/               #   index.css — Tailwind v4 엔트리 + Shadcn 테마(CSS 변수)
│   ├── config/               #   configureAxios.ts — axios 인증 브리지 주입 (제거 금지)
│   └── App.tsx
├── pages                     # 라우트 화면 — {login,dashboard,users,forbidden,not-found}
├── widgets                   # 페이지 독립 합성 UI — main-layout, auth-layout, pwa-badge(SW 알림)
├── features                  # 사용자 액션·기능 — auth, users, theme (각 api/model/ui + index.ts)
├── entities                  # 도메인 모델 — user(User/Role, @x/session), session(authStore)
├── shared                    # 도메인 무관 인프라 — api(axiosInstance), ui(Shadcn), lib, config
├── main.tsx                  # 루트 유지 — index.html 진입점
└── vite-env.d.ts             # 루트 유지 — ambient 타입(PWA client 포함)
```

PWA 정적 리소스(매니페스트 아이콘 등)는 `public/`에 둡니다.

- **FSD 규칙 핵심**: 레이어 단방향 의존(`app > pages > widgets > features > entities > shared`) ·
  같은 레이어 슬라이스 간 import 금지(entities `@x` 예외) · 슬라이스 간 import 는 `index.ts` 배럴
  경유. 전체 규칙은 [`.claude/rules/fsd-architecture.md`](.claude/rules/fsd-architecture.md) —
  `pnpm lint:fsd`(Steiger)가 CI·Stop 게이트에서 하드 강제.
- **새 슬라이스**: `pnpm gen:slice`(plop)로 골격을 정본대로 생성 — 정본은
  [`.claude/rules/slice-blueprint.md`](.claude/rules/slice-blueprint.md). 생성 직후엔 미참조라
  steiger 가 `fsd/insignificant-slice` 로 막으니 상위(페이지 등)에서 import 해 연결한다.

## UI (Shadcn/UI + Tailwind v4)

- **Tailwind v4 는 CSS-first** — `tailwind.config.js` 없음. `@tailwindcss/vite` 플러그인 +
  `src/app/styles/index.css`(`@theme inline`, `:root`/`.dark` CSS 변수)로 구성.
- Shadcn 컴포넌트는 `src/shared/ui`(평면 파일), 추가는 `pnpm dlx shadcn@latest add <name>`
  (`components.json`: style `new-york`). 스타일·`cn()`·다크모드·a11y 컨벤션은
  [`.claude/rules/code-style.md`](.claude/rules/code-style.md) 참고.
- 플레이스홀더 매니페스트 아이콘은 `scripts/gen-icons.mjs`(의존성 없는 PNG 생성기)로 재생성.

## 아키텍처 / 상태 관리

- **서버 상태** → React Query(feature 훅 경유, 컴포넌트에서 axios 직접 호출 금지). **전역
  클라이언트 상태** → Zustand(`entities/session`·`features/theme`). **폼** → RHF + Zod.
- **API DTO** 는 손으로 타이핑하지 말고 `pnpm gen:api`(orval)로 생성·커밋
  ([ADR-0006](docs/adr/0006-api-types-orval.md)). 도메인 모델 단일 출처는 `entities/user`.
- RQ 쿼리 캐시는 localStorage 에 오프라인 persist
  ([ADR-0007](docs/adr/0007-react-query-offline-persist.md)) — 세션 의존 쿼리는
  `meta: { persist: false }` 로 옵트아웃.
- ⚠️ **axios 인증 브리지**: `app/App.tsx` 최상단의 side-effect import
  (`import '@/app/config/configureAxios'`)를 제거하면 **타입 에러 없이 토큰 주입·401 리다이렉트가
  조용히 무력화**된다 — 제거 금지.
- 상세 규칙(인터셉터·persist 함정·인증/RBAC)은
  [`.claude/rules/fsd-architecture.md`](.claude/rules/fsd-architecture.md), 결정 배경은
  [ADR-0002](docs/adr/0002-state-management.md)·[ADR-0004](docs/adr/0004-auth-token-storage.md).
- **인증 & RBAC**: 역할 `'admin' | 'manager' | 'user'`, `/users` 는 admin/manager 만. 라우트 가드·
  메뉴 필터링은 프런트(UX) 차원 — 실제 데이터 권한은 백엔드에서 강제해야 한다.
- **목 API(MSW)**: 핸들러·테스트 서버 구성은 [`.claude/rules/testing.md`](.claude/rules/testing.md),
  데모 계정·환경 변수는 `README.md` 와 `.env.example` 참고.

## PWA

- ⚠️ SW·설치 프롬프트는 `pnpm dev` 에서 **동작하지 않는다** — PWA 검증은 항상
  `pnpm build && pnpm preview` 로만.
- `vite-plugin-pwa`(`vite.config.ts`)가 SW/매니페스트 생성. 업데이트 전략은
  `registerType: 'prompt'` — 새 버전 알림·오프라인 안내 UI 는 `widgets/pwa-badge`.
- SW 는 `/api` 를 캐시하지 않는다([ADR-0003](docs/adr/0003-pwa-caching-strategy.md)) — 앱 데이터의
  오프라인 연계는 RQ persist 담당(ADR-0007).
- web-vitals 수집(옵트인): `VITE_WEB_VITALS_ENDPOINT` 설정 시 `shared/lib/reportWebVitals` 가
  CWV 를 sendBeacon 으로 전송(동적 import 라 메인 번들 미포함).

## 코드 컨벤션

- 강제의 정본은 `eslint.config.js`(+`tsconfig` strict)·`steiger.config.ts` — 해설·요약은
  [`.claude/rules/code-style.md`](.claude/rules/code-style.md)(네이밍·import 정렬·queryKey 객체·
  default export 금지·a11y 등, admin-template 과 동일 체계).
- 커밋: Husky pre-commit 이 gitleaks(staged) → lint-staged(자동 포맷) → `typecheck` → `lint:fsd` →
  `test:related`(staged `src`) 순으로 돈다. 메시지는 commitlint(Conventional Commits) — `feat:` 등
  타입 프리픽스 없으면 커밋 거부. **`--no-verify` 금지.**
- 테스트 커버리지 ratchet: `vite.config.ts` 임계값을 CI 가 강제 — **하향 금지**, 테스트를 추가하며
  점진 상향([`.claude/rules/testing.md`](.claude/rules/testing.md)).

## Claude Code 자동화 (`.claude/`)

`.claude/settings.json` 이 훅을 등록한다. 코드를 만질 때 아래 동작을 전제로 한다.

- **SessionStart** → `session-context.sh`(현재 브랜치 주입) + `contamination-report.sh`(knip 으로 dead code/unused export 후보를 "오염 맵"으로 주입 — 탐지·인지 전용, `CC_CONTAMINATION_REPORT=1`. 캐시·타임아웃·미설치 시 비차단. 정책 정본 `.claude/rules/pattern-contamination.md`) + `autocommit-baseline.sh`(세션 시작 시점 dirty 파일의 내용 해시를 `$(git rev-parse --git-dir)/cc_autocommit/<sid>.baseline` 에 기록 — 아래 Stop 게이트의 세션 스코프 계산이 이를 전제하므로 `CC_AUTOCOMMIT` 토글과 무관하게 항상 기록된다).
- **정적 규칙(`.claude/rules/`)** → 파일별 `paths` 글롭으로 자동 주입. 강제의 정본은
  `eslint.config.js`/`steiger.config.ts`/`tsconfig` 이며 rules 문서는 해설(충돌 시 설정 우선).
- **PreToolUse(Bash)** → `guard-bash.sh`: 파괴적 명령(`rm -rf /`, force push, `reset --hard`)을 차단.
  acceptEdits/bypassPermissions 모드에서는 추가 규칙(`git clean -f`, `curl|sh` 파이프 실행,
  `git checkout/restore .`)을 강화 — 사용자 확인이 줄어드는 모드일수록 훅이 보상 통제.
  `permission_mode`를 못 읽으면(빈/미지 값) 강화 규칙을 적용한다 — 판단 불가 시 강하게(fail-closed).
- **PostToolUse(Edit/Write)** → `format-changed-file.sh`(`eslint --fix` + `prettier`) +
  `check-pwa.sh`(매니페스트/SW 설정 검증).
- **Stop** → `gate.sh`: **세션 스코프 게이트**. SessionStart baseline 대비 내용 해시 diff 로 "이번
  세션이 바꾼 파일"을 가려내고, 그 파일에만 `lint:files`·`format:check:files`·`test:related` 를
  건다(같은 브랜치의 무관한 WIP 가 게이트를 막지 않는다). 파일 단위로 쪼갤 수 없는 `typecheck`(tsc -b)와
  `lint:fsd`(steiger)는 전체 실행·전체 차단. 검사는 **병렬 실행 + 명령별 타임아웃**
  (`CC_GATE_TIMEOUT`, 기본 180초)이며 로그는 `mktemp -d` 로 세션별 격리한다. 실패 시 라벨별 에러를
  집계해 `exit 2` 로 계속 수정을 유도한다. 세션 변경이 0건이거나 plan 모드면 스킵하고,
  `stop_hook_active` 재호출은 무한루프 가드가 통과시킨다.
  baseline 이 없으면(SessionStart 미실행 등) 보수적으로 **전체 5종**(`typecheck`·`lint`·`format:check`·
  `lint:fsd`·`test:coverage`)으로 폴백한다.
- **자동 커밋 넛지**(옵트인 `CC_AUTOCOMMIT=1`, settings.json env) — 게이트가 green 이면 미커밋 세션
  파일을 알린다. 세션 시작 시 clean 이던 파일 = **own**(커밋 유도), 이미 dirty 였던 파일 =
  **overlap**(병렬/기존 작업과 겹침 → 보류하고 `AskUserQuestion` 으로 확인). 훅은 **직접 커밋하지
  않는다**(한글 Conventional Commits 메시지 품질·판단은 Claude 몫). 보호 브랜치
  (`CC_AUTOCOMMIT_PROTECT`, 기본 `main master`)에서는 넛지하지 않는다.
- `.claude/agents/code-reviewer.md` + 스킬 6종: `code-review`(FSD 경계·PWA 점검 포함) ·
  `contamination-sweep`(전체 코드베이스 정기 스윕 — 전용 세션) · `test-driven-development`(RED-GREEN-REFACTOR) ·
  `systematic-debugging`(근본 원인 4단계) · `receiving-code-review`(리뷰 받는 쪽 규율) ·
  `writing-plans`(승인된 계획을 `docs/plans/` 에 기록).

## 보안

- 상세 규칙은 [`.claude/rules/security.md`](.claude/rules/security.md), 위협 모델·취약점 신고는
  [`SECURITY.md`](SECURITY.md), 현행 점검표는
  [`docs/secure-harness-react-shadcn-pwa.md`](docs/secure-harness-react-shadcn-pwa.md), 헤더/CSP·
  토큰 저장 결정은 [ADR-0005](docs/adr/0005-csp-and-security-headers.md)·ADR-0004.
- ⚠️ **배포 전 `.env.production` 의 `VITE_ENABLE_MOCK=false`** — 기본값(true)으로 빌드하면 MSW 목
  인증(데모 계정)이 프로덕션 번들에 포함된다(SECURITY.md §3).

## 배포 (인프라)

- `Dockerfile`(빌드 → `nginx:1.27` 서빙) + `nginx.conf`(SPA fallback · SW no-cache · 보안 헤더,
  ADR-0005)로 프로덕션 컨테이너 구성.
- CI(`.github/workflows/ci.yml`): `build` 잡(typecheck → lint → lint:fsd → test(coverage) →
  build → dist 시크릿 grep) + 병렬 잡 `gitleaks` · `sca`(pnpm audit + osv) · `lighthouse` · `e2e`.

## 로드맵

- [x] **admin 파리티 도달** — 보일러플레이트 · FSD 마이그레이션(Steiger 하드 강제) · 하네스 갭
      보완(`pnpm verify` · RQ persist · web-vitals) 완료.
- [x] **하네스 역반영(momori)** — 파생 리포(`momori-parent-web`·`momori-landing-web`)에서 다듬어진
      하네스를 역반영: Stop 게이트 세션 스코프화(병렬·타임아웃·자동 커밋 넛지) · pre-commit 강화 ·
      CI `format:check` · 생성 API 래퍼 격리 룰 · 색 토큰 강제 · `tsconfig.base.json` · 스킬 4종
      (`test-driven-development`·`systematic-debugging`·`receiving-code-review`·`writing-plans`).
      PWA 설정은 불변으로 보존. 잔여 백로그: Sentry 🟡 · coverage 임계값 점진 상향.
- [ ] **하네스 문서 계층화 역적용** — 얇은 CLAUDE.md + rules 단일 소유 구조를 react-admin-template
      에도 적용.
- [ ] **파리티 이후** — Push Notification · Offline Data Sync · i18n · Social Login.

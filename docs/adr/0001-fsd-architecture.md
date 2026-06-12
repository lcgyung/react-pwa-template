# 0001. Feature-Sliced Design 6레이어 채택

- 상태: 채택됨
- 날짜: 2026-06-11

## 맥락

화면·기능·도메인·인프라가 뒤섞이면 폴더가 비대해지고 의존 방향이 흐트러진다. 형제 템플릿
react-admin-template 과 톤·구조를 통일할 일관된 경계 규칙이 필요했다.

## 결정

[Feature-Sliced Design 2.x](https://feature-sliced.design) 정석 6레이어
(`app > pages > widgets > features > entities > shared`)를 따른다. 레이어 단방향 의존, 슬라이스 간
Public API(배럴) 경유, 같은 레이어 슬라이스 간 import 금지(예외: entities `@x` 크로스임포트)를
규칙으로 둔다. 세그먼트는 "왜"(`ui/api/model/lib/config`)로 명명한다.

## 결과

- 장점: 의존 방향이 한눈에 보이고, 슬라이스 단위로 추가·삭제·이동이 쉽다.
- 강제: `pnpm lint:fsd`(Steiger, `steiger.config.ts`)가 경계를 검사하고 CI·Stop 게이트에서 하드
  실패시킨다. 규칙은 [CLAUDE.md](../../CLAUDE.md) "FSD 의존성 / Public API 규칙" 절에 정리한다.
- 비용: 작은 기능도 슬라이스+세그먼트+배럴 보일러플레이트를 요구한다(의도된 트레이드오프).

---
name: code-review
description: React + shadcn/ui + PWA 변경에 대한 리뷰 기준. Tailwind/클래스 병합, shadcn 컴포넌트 규약, 접근성, PWA 설정을 점검할 때 사용.
---

# React + shadcn/ui + PWA 코드 리뷰 기준

## Tailwind / shadcn

- 클래스 병합에 cn()을 쓰는가. 임의값([...])과 매직 넘버 남용이 없는가.
- 색/간격은 디자인 토큰(CSS 변수, theme)으로 가는가.
- components/ui의 생성 컴포넌트를 불필요하게 직접 수정하지 않았는가(확장은 래퍼로).

## 접근성 (a11y)

- Radix 기반 컴포넌트의 aria/포커스 트랩/키보드 동작을 깨지 않았는가.
- 색만으로 정보 전달하지 않는가.

## PWA

- manifest 필수 필드(name/short_name/start_url/display/icons) 유지.
- 서비스워커 캐싱 전략이 명확하고 오프라인 fallback이 있는가.
- 정적 자산 캐싱이 배포 시 stale 되지 않도록 버전/해시 처리하는가.

## 일반

- 타입 안전성, 불필요한 리렌더, 안정적 key.

## 출력 형식

- blocker / warning / nit 로 분류, 파일·라인·근거·수정안 제시.

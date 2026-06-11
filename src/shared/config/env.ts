import { z } from 'zod';

// import.meta.env 를 zod 로 검증한다 — 오타·누락을 부팅 시점에 명확한 에러로 조기 차단한다.
// 테스트/CI 에서 값이 없어도 기본값으로 통과하도록 default 를 둔다(값 부재로 throw 금지).
export const envSchema = z.object({
  // 백엔드 베이스 URL — 빈 문자열이면 axios 가 동일 출처(상대경로)로 요청한다.
  VITE_API_BASE_URL: z.string().default(''),
  // MSW 목 API 활성화 여부. 'true' 일 때만 워커를 기동한다(main.tsx).
  VITE_ENABLE_MOCK: z.enum(['true', 'false']).default('false'),
});

export type Env = z.infer<typeof envSchema>;

// import.meta.env 를 검증해 반환한다. 실패 시 어떤 변수가 왜 틀렸는지 드러내고 조기 종료한다.
export const parseEnv = (source: unknown): Env => {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`환경 변수(VITE_*) 검증 실패:\n${issues}`);
  }
  return result.data;
};

export const env = parseEnv(import.meta.env);

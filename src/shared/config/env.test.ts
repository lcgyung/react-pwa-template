import { describe, expect, it } from 'vitest';

import { env, envSchema, parseEnv } from './env';

describe('env', () => {
  it('빈 입력에 기본값을 적용한다', () => {
    const result = envSchema.parse({});
    expect(result.VITE_API_BASE_URL).toBe('');
    expect(result.VITE_ENABLE_MOCK).toBe('false');
    expect(result.VITE_WEB_VITALS_ENDPOINT).toBe('');
  });

  it('유효한 값을 그대로 통과시키고 알려지지 않은 키는 무시한다', () => {
    const result = parseEnv({
      VITE_API_BASE_URL: 'http://api.example.com',
      VITE_ENABLE_MOCK: 'true',
      MODE: 'test',
    });
    expect(result.VITE_API_BASE_URL).toBe('http://api.example.com');
    expect(result.VITE_ENABLE_MOCK).toBe('true');
  });

  it('잘못된 enum 값은 명확한 에러로 거부한다', () => {
    expect(() => parseEnv({ VITE_ENABLE_MOCK: 'yes' })).toThrow(/VITE_ENABLE_MOCK/);
  });

  it('런타임 env 객체를 노출한다', () => {
    expect(env).toHaveProperty('VITE_API_BASE_URL');
    expect(['true', 'false']).toContain(env.VITE_ENABLE_MOCK);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';

import { reportWebVitals } from './reportWebVitals';

interface MetricLike {
  name: string;
  value: number;
  id: string;
}
type ReportHandler = (metric: MetricLike) => void;

const handlers = vi.hoisted(() => ({
  onCLS: vi.fn<(onReport: (metric: { name: string; value: number; id: string }) => void) => void>(),
  onFCP: vi.fn<(onReport: (metric: { name: string; value: number; id: string }) => void) => void>(),
  onINP: vi.fn<(onReport: (metric: { name: string; value: number; id: string }) => void) => void>(),
  onLCP: vi.fn<(onReport: (metric: { name: string; value: number; id: string }) => void) => void>(),
  onTTFB:
    vi.fn<(onReport: (metric: { name: string; value: number; id: string }) => void) => void>(),
}));

vi.mock('web-vitals', () => handlers);

const ENDPOINT = 'https://example.com/vitals';

const registeredReporter = (): ReportHandler => {
  const report = handlers.onLCP.mock.calls[0]?.[0];
  if (!report) throw new Error('onLCP 핸들러가 등록되지 않았습니다.');
  return report;
};

describe('reportWebVitals', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('5개 핵심 메트릭(CLS/FCP/INP/LCP/TTFB) 핸들러를 모두 등록한다', async () => {
    await reportWebVitals(ENDPOINT);

    for (const handler of Object.values(handlers)) {
      expect(handler).toHaveBeenCalledTimes(1);
    }
  });

  it('endpoint 가 있으면 sendBeacon 으로 메트릭을 전송한다', async () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', { sendBeacon });

    await reportWebVitals(ENDPOINT);
    registeredReporter()({ name: 'LCP', value: 1234, id: 'v1' });

    expect(sendBeacon).toHaveBeenCalledWith(ENDPOINT, expect.stringContaining('LCP'));
  });

  it('sendBeacon 실패 시 fetch keepalive 로 폴백한다', async () => {
    vi.stubGlobal('navigator', { sendBeacon: vi.fn().mockReturnValue(false) });
    const fetchMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('fetch', fetchMock);

    await reportWebVitals(ENDPOINT);
    registeredReporter()({ name: 'LCP', value: 1, id: 'v1' });

    expect(fetchMock).toHaveBeenCalledWith(
      ENDPOINT,
      expect.objectContaining({ method: 'POST', keepalive: true }),
    );
  });
});

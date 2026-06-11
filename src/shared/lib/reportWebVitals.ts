import { env } from '@/shared/config';

interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
}

// Core Web Vitals 수집(옵트인) — VITE_WEB_VITALS_ENDPOINT 가 설정되면 sendBeacon 으로 전송하고,
// 없으면 dev 에서만 콘솔에 남긴다(프로덕션 minify 가 console.info 를 제거하므로 이중 안전).
// web-vitals 는 동적 import — 메인 청크에 포함되지 않고 수집이 켜진 경우에만 로드된다(~2KB).
export const reportWebVitals = async (
  endpoint: string = env.VITE_WEB_VITALS_ENDPOINT,
): Promise<void> => {
  if (!endpoint && !import.meta.env.DEV) return;

  const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import('web-vitals');

  const report = (metric: WebVitalMetric) => {
    if (!endpoint) {
      console.info('[web-vitals]', metric.name, metric.value);
      return;
    }
    const body = JSON.stringify({ name: metric.name, value: metric.value, id: metric.id });
    // sendBeacon 은 페이지 이탈 중에도 전송이 보장된다. 미지원/큐 초과 시 fetch keepalive 폴백.
    if (navigator.sendBeacon?.(endpoint, body)) return;
    void fetch(endpoint, { method: 'POST', body, keepalive: true }).catch(() => {
      // 측정 전송은 베스트 에포트 — 실패가 앱 동작에 영향을 주지 않는다.
    });
  };

  onCLS(report);
  onFCP(report);
  onINP(report);
  onLCP(report);
  onTTFB(report);
};

import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * 서비스 워커 업데이트 알림 (registerType: 'prompt').
 * - offlineReady: 오프라인 사용 준비 완료 안내.
 * - needRefresh: 새 버전 감지 → 사용자가 '새로고침'을 누르면 updateServiceWorker(true) 로 적용.
 *
 * 자체 Tailwind 스타일로 작성되어 Shadcn/UI 도입 전에도 독립 동작한다.
 * 동작 확인은 `pnpm build && pnpm preview` 에서만 가능하다(dev 미지원).
 */
export function PWABadge() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div
      role="alert"
      aria-labelledby="pwa-badge-message"
      className="fixed right-4 bottom-4 z-50 max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <p id="pwa-badge-message" className="text-sm text-gray-800 dark:text-gray-100">
        {needRefresh
          ? '새 버전이 있습니다. 새로고침하여 업데이트하세요.'
          : '앱이 오프라인에서 사용할 준비가 되었습니다.'}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        {needRefresh && (
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500"
          >
            새로고침
          </button>
        )}
        <button
          type="button"
          onClick={close}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

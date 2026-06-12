import { useEffect, useState } from 'react';

// beforeinstallprompt 는 표준 lib.dom 타입에 없어 직접 선언한다(Chromium 계열에서만 발생).
interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt: () => Promise<void>;
}

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // iOS Safari 는 beforeinstallprompt 를 발생시키지 않는다 → canInstall 은 false 로 유지된다.
    const onBeforeInstall = (event: Event) => {
      event.preventDefault(); // 브라우저 기본 미니 인포바를 막고 노출 시점을 우리가 제어한다.
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferredPrompt(null);

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null); // 네이티브 프롬프트는 한 번만 사용할 수 있다.
  };

  return { canInstall: deferredPrompt !== null, promptInstall };
};

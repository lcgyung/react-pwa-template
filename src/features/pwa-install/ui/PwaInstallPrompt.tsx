import { Download } from 'lucide-react';

import { Button } from '@/shared/ui/button';

import { useInstallPrompt } from '../model/useInstallPrompt';

// 설치 가능한 브라우저(Chromium 계열)에서만 노출되는 설치 버튼.
// PWABadge(우하단)와 겹치지 않도록 좌하단에 고정한다.
export const PwaInstallPrompt = () => {
  const { canInstall, promptInstall } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button onClick={promptInstall} className="shadow-lg">
        <Download />앱 설치
      </Button>
    </div>
  );
};

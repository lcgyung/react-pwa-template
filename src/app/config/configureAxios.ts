import { clearAuthState, getAuthToken } from '@/entities/session';
import { configureAuthBridge } from '@/shared/api';
import { paths } from '@/shared/config';

// axios 인증 브리지 부트스트랩(옵션 B — 의존성 역전).
// shared/api 는 도메인을 모르므로, 여기서 토큰 getter 와 401 핸들러를 주입한다.
// 미주입 시 토큰 주입·401 리다이렉트가 조용히 무력화된다 — 이 모듈의 side-effect import 를 제거 금지.
configureAuthBridge({
  getToken: getAuthToken,
  onUnauthorized: () => {
    clearAuthState();
    if (window.location.pathname !== paths.login) {
      window.location.href = paths.login;
    }
  },
});

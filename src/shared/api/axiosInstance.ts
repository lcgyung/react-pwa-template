import axios from 'axios';

// 인증 브리지(의존성 역전): shared 레이어는 도메인(entities)을 모른다.
// 앱 부트스트랩에서 configureAuthBridge 로 실제 구현을 주입한다 — 미주입 시 no-op.
type AuthBridge = {
  getToken: () => string | null;
  onUnauthorized: () => void;
};

let getToken: AuthBridge['getToken'] = () => null;
let onUnauthorized: AuthBridge['onUnauthorized'] = () => {};

export const configureAuthBridge = (bridge: AuthBridge) => {
  getToken = bridge.getToken;
  onUnauthorized = bridge.onUnauthorized;
};

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: 저장된 토큰을 Authorization 헤더에 주입.
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 이면 주입된 핸들러로 위임(인증 초기화 + 로그인 리다이렉트).
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// vite define 으로 주입되는 앱 버전(package.json version) — RQ persist buster 로 사용(ADR-0007).
// eslint-disable-next-line @typescript-eslint/naming-convention -- vite define 전역 상수는 dunder 컨벤션
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENABLE_MOCK: string;
  readonly VITE_WEB_VITALS_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

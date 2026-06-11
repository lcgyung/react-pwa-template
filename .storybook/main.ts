import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (cfg) => {
    // PWA 플러그인은 Storybook 빌드에 불필요하며 서비스 워커 생성으로 충돌할 수 있어 제외한다.
    const plugins = ((cfg.plugins ?? []) as unknown[]).flat(Infinity) as Array<{
      name?: string;
    } | null>;
    cfg.plugins = plugins.filter((p) => !p?.name?.includes('pwa'));
    return cfg;
  },
};

export default config;

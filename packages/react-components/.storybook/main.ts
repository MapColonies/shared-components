import { mergeConfig } from 'vite';
import cesium from 'vite-plugin-cesium';
import commonConfig from '../../../.storybook/main';

const config = {
  ...commonConfig,
  staticDirs: [...(commonConfig.staticDirs as string[]), '../public'],
  core: {
    builder: '@storybook/builder-vite',
  },
  stories: ['../src/**/*.stories.@(js|ts|tsx|mdx)'],
  addons: ['@storybook/addon-storysource'],
  viteFinal: async (config: Record<string, unknown>) => {
    const conf = await (commonConfig as any).viteFinal(config);

    return mergeConfig(config, {
      ...conf,
      base: '',
      plugins: [cesium({ cesiumBuildPath: '../../node_modules/cesium/Build/Cesium' })],
    });
  },
};

module.exports = config;

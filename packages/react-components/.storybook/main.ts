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
  async viteFinal(config: Record<string, string>) {
    return mergeConfig(config, {
      base: '',
      plugins: [cesium({ cesiumBuildPath: '../../node_modules/cesium/Build/Cesium' })],
    });
  },
};

module.exports = config;

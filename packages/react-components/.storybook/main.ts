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
  addons: ['@storybook/addon-essentials', '@storybook/addon-knobs', 'storybook-addon-mock'],
  viteFinal: async (config: Record<string, unknown>) => {
    const conf = await (commonConfig as any).viteFinal(config);

    return mergeConfig(config, {
      ...conf,
      base: '',
      // Cesium is installed in the main node_modules folder, need to configure the routes for cesium vite plugin.
      plugins: [cesium({ cesiumBuildPath: '../../node_modules/cesium/Build/Cesium', cesiumBuildRootPath: '../../node_modules/cesium/Build' })],
    });
  },
};

module.exports = config;

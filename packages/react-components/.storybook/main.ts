import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import cesium from 'vite-plugin-cesium';
import commonConfig from '../../../.storybook/main';

const config: StorybookConfig = {
  ...(commonConfig as StorybookConfig),
  staticDirs: [...((commonConfig.staticDirs ?? []) as string[]), '../public'],
  stories: ['../src/**/*.stories.@(js|ts|tsx|mdx)'],
  // @storybook/addon-storysource is not yet compatible with Storybook 10.
  // TODO: Re-add when addon-storysource releases a Storybook 10-compatible version.
  addons: [...((commonConfig.addons ?? []) as string[])],
  viteFinal: async (config) => {
    const base = await (commonConfig.viteFinal as NonNullable<StorybookConfig['viteFinal']>)(config);

    return mergeConfig(base, {
      base: '',
      plugins: [
        cesium({
          cesiumBuildPath: '../../node_modules/cesium/Build/Cesium',
          cesiumBuildRootPath: '../../node_modules/cesium/Build',
        }),
      ],
    });
  },
};

export default config;

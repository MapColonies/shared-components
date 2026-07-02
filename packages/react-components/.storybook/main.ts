import { fileURLToPath } from 'url';
import path from 'path';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import cesium from 'vite-plugin-cesium';
import commonConfig from '../../../.storybook/main.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  ...(commonConfig as StorybookConfig),
  staticDirs: [path.resolve(__dirname, '../../../public'), path.resolve(__dirname, '../public')],
  stories: ['../src/**/*.stories.@(js|ts|tsx|mdx)'],
  // @storybook/addon-storysource is not yet compatible with Storybook 10.
  // TODO: Re-add when addon-storysource releases a Storybook 10-compatible version.
  addons: [...((commonConfig.addons ?? []) as string[])],
  viteFinal: async (config) => {
    // Drop dts plugin — it breaks Storybook's build (not needed for stories)
    config.plugins = (config.plugins ?? []).filter((p) => {
      const name = p && typeof p === 'object' && 'name' in p ? String((p as { name: unknown }).name) : '';
      return !name.includes('dts');
    });

    // Relativize outDir so vite-plugin-cesium doesn't mis-join two absolute paths
    const root = config.root ?? process.cwd();
    if (config.build?.outDir && path.isAbsolute(config.build.outDir)) {
      config.build.outDir = path.relative(root, config.build.outDir);
    }

    const base = await (commonConfig.viteFinal as NonNullable<StorybookConfig['viteFinal']>)(config);

    return mergeConfig(base, {
      base: '',
      plugins: [cesium()],
      optimizeDeps: {
        // Exclude cesium packages — they are too large to pre-bundle (Vite 8 dev
        // server fails to parse the resulting file). They are served raw instead.
        // All CJS transitive deps of @cesium/engine and @cesium/widgets are listed
        // in `include` so Vite pre-bundles them with ESM wrappers before any raw
        // Cesium source file imports them.
        exclude: ['cesium', '@cesium/engine', '@cesium/widgets'],
        include: [
          'autolinker',
          'bitmap-sdf',
          'dompurify',
          'draco3d/draco_decoder_nodejs.js',
          'earcut',
          'grapheme-splitter',
          'jsep',
          'kdbush',
          'ktx-parse',
          'lerc',
          'mersenne-twister',
          'meshoptimizer',
          'nosleep.js',
          'pako/lib/inflate.js',
          'protobufjs/dist/minimal/protobuf.js',
          'rbush',
          'topojson-client',
          'urijs',
        ],
      },
    });
  },
};

export default config;

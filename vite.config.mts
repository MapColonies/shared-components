import path from 'path';
import { PluginOption, defineConfig, UserConfig, loadEnv } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import pluginReact from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint2';
import dts from 'vite-plugin-dts';

const isExternal = (id: string) => !id.startsWith('.') && !path.isAbsolute(id);

export const getBaseConfig = ({ plugins = [] as PluginOption[], lib, additionalConfig = {} as UserConfig }) => {
  return defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
      plugins: [
        pluginReact(),
        eslintPlugin({
          cache: false,
          include: ['./src/components/**/*.ts', './src/components/**/*.tsx'],
          exclude: ['/virtual:/', '/node_modules/'],
        }),
        dts({
          include: ['src'],
          tsconfigPath: 'tsconfig-build.json',
          rollupTypes: true,
        }),
        cssInjectedByJsPlugin(),
        ...plugins,
      ],
      build: {
        lib,
        rollupOptions: {
          external: isExternal,
          output: {
            globals: {
              cesium: 'Cesium',
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
      },
      define: {
        'process.env': env,
        CESIUM_BASE_URL: JSON.stringify(env.CESIUM_BASE_URL),
      },
      ...additionalConfig,
    };
  });
};

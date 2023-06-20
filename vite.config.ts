import path from 'path';
import { PluginOption, defineConfig, UserConfigExport } from 'vite';
import pluginReact from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint';

const isExternal = (id: string) => !id.startsWith('.') && !path.isAbsolute(id);

export const getBaseConfig = ({ plugins = [] as PluginOption[], lib, additionalConfig = {} as UserConfigExport }) =>
  defineConfig({
    plugins: [
      pluginReact(),
      eslintPlugin({
        cache: false,
        include: ['./packages/**/*'],
        exclude: [],
      }),
      ...plugins,
    ],
    build: {
      lib,
      rollupOptions: {
        external: isExternal,
        output: {
          globals: {
            react: 'React',
          },
        },
      },
    },
    ...additionalConfig
  });

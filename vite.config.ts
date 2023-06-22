import path from 'path';
import { PluginOption, defineConfig, UserConfigExport, loadEnv } from 'vite';
import pluginReact from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint';
import dts from 'vite-plugin-dts';

const isExternal = (id: string) => !id.startsWith('.') && !path.isAbsolute(id);

export const getBaseConfig = ({ plugins = [] as PluginOption[], lib, additionalConfig = {} as UserConfigExport }) => {
  
  return defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      plugins: [
        pluginReact(),
        eslintPlugin({
          cache: false,
          include: ['./src/components/**/*'],
          exclude: [],
        }),
        dts({
          insertTypesEntry: true,
          include: ['src/components']
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
      define: {
        'process.env': env
      },
      ...additionalConfig
    }
  });
}
  
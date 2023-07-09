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
        // Important if using react <18.
        // pluginReact({ jsxRuntime: 'classic' }),
        pluginReact(),
        eslintPlugin({
          cache: false,
          include: ['./src/components/**/*.ts|tsx'],
          exclude: ["/virtual:/", "/node_modules/"],
        }),
        dts({
          insertTypesEntry: true,
          include: ['src/components'],
          tsConfigFilePath: 'tsconfig-build.json'
        }),
        ...plugins,
      ],
      build: {
        lib,
        rollupOptions: {
          external: isExternal,
          output: {
            globals: {
              cesium: "Cesium",
              react: 'React',
              "react-dom": "ReactDOM",
            },
          },
        },
      },
      define: {
        'process.env': env,
        'CESIUM_BASE_URL': JSON.stringify(env.CESIUM_BASE_URL)
      },
      ...additionalConfig
    }
  });
}
  
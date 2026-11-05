import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// Node-safe build of the capability adapters only: no React, no Cesium, no CSS. `zod` stays external.
export default defineConfig({
  publicDir: false,
  plugins: [
    dts({
      include: ['src/bridge'],
      exclude: ['src/bridge/**/*.spec.ts', 'src/bridge/**/*.drift.ts'],
      tsconfigPath: 'tsconfig-build.json',
      entryRoot: 'src/bridge',
    } as any),
  ],
  build: {
    outDir: 'dist/bridge',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/bridge/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format: string) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
    },
    rollupOptions: {
      external: (id: string) => !id.startsWith('.') && !path.isAbsolute(id),
    },
  },
});

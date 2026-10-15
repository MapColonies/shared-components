import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// Node-safe build of the zod schemas only: no React, no Cesium, no CSS. `zod` stays external.
export default defineConfig({
  publicDir: false,
  plugins: [
    dts({
      include: ['src/schemas'],
      exclude: ['src/schemas/**/*.spec.ts', 'src/schemas/**/*.drift.ts'],
      tsconfigPath: 'tsconfig-build.json',
      entryRoot: 'src/schemas',
    } as any),
  ],
  build: {
    outDir: 'dist/schemas',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/schemas/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format: string) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
    },
    rollupOptions: {
      external: (id: string) => !id.startsWith('.') && !path.isAbsolute(id),
    },
  },
});

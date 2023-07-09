import * as path from 'path';
import { getBaseConfig } from '../../vite.config';
import { LibraryOptions } from 'vite';

export default getBaseConfig({
  lib: {
    // Important if using react <18.
    // pluginReact({ jsxRuntime: 'classic' }),
    entry: path.resolve(__dirname, 'src/index.ts'),
    name: 'reactComponents',
    formats: ['es', 'umd'],

    // fileName: '@map-colonies/react-components',
    fileName: (format: string) => `@map-colonies/react-components.${format}.js`,

  } as LibraryOptions
});

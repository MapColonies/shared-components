import * as path from 'path';
import { getBaseConfig } from '../../vite.config';
import { LibraryOptions } from 'vite';

export default getBaseConfig({
  lib: {
    entry: path.resolve(__dirname, 'src/index.ts'),
    name: 'reactComponents',
    fileName: '@map-colonies/react-components',
  } as LibraryOptions,
});

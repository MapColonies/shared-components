import * as path from 'path';
import { getBaseConfig } from '../../vite.config';

export default getBaseConfig({
  lib: {
    entry: path.resolve(__dirname, 'src/index.ts'),
    name: 'reactUiComponents',
    fileName: '@map-colonies/react-core',
  },
  additionalConfig: {
    resolve: {
      alias: {
        '@doc-utils': path.resolve(__dirname, 'src/components/doc-utils'),
        '@rmwc': path.resolve(__dirname, 'src/components'),
      },
    },
  },
});

import { fileURLToPath } from 'url';
import path from 'path';
import type { StorybookConfig } from '@storybook/react-vite';
import commonConfig from '../../../.storybook/main.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  ...(commonConfig as StorybookConfig),
  staticDirs: [path.resolve(__dirname, '../../../public')],
  stories: ['../src/components/**/*.stories.@(js|jsx|ts|tsx)'],
};

export default config;

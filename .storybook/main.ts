import type { StorybookConfig } from '@storybook/react-vite';
import { createLogger } from 'vite';

const logger = createLogger();
const originalWarning = logger.warn;
logger.warn = (msg, options) => {
  if (msg.includes('node_modules') && msg.includes('?inline')) return;
  originalWarning(msg, options);
};

const config: StorybookConfig = {
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  stories: [],
  viteFinal: async (config) => {
    return {
      ...config,
      customLogger: logger,
    };
  },
};

export default config;

import type { StorybookConfig } from '@storybook/react-vite';
import { createLogger } from 'vite';

// Customization of logger in order to "hide" warnings from 3rd parties in field of CSS includes [ '.css?inline' CSS (as example) ]
const logger = createLogger();
const originalWarning = logger.warn;
logger.warn = (msg, options) => {
  if (msg.includes('node_modules') && msg.includes('?inline')) return;
  originalWarning(msg, options);
};

const config = {
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-knobs',
    'storybook-addon-mock',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../../../public'],
  viteFinal: async (config: Record<string, unknown>) => {
    const configAdditions = {
      ...config,
      customLogger: logger,
    };

    return configAdditions;
  },
} as unknown as StorybookConfig;

export default config;

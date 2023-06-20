import type { StorybookConfig } from '@storybook/react-vite';
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
  // docs: {
  //   autodocs: true,
  // },
} as StorybookConfig;

export default config;

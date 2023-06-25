import commonConfigs from '../../../.storybook/main';

const config = {
  ...commonConfigs,
  stories: ['../src/components/**/*.stories.@(js|jsx|ts|tsx)'],
};

export default config;

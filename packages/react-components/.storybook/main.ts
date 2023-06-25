import commonConfigs from '../../../.storybook/main';

const config = {
  ...commonConfigs,
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)']
};

export default config;

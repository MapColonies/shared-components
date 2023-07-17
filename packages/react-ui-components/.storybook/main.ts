import commonConfig from '../../../.storybook/main';

const config = {
  ...commonConfig,
  staticDirs: [...(commonConfig.staticDirs as string[])],
  stories: ['../src/components/**/*.stories.@(js|jsx|ts|tsx)'],
};

export default config;

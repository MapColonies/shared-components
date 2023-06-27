import type { StorybookViteConfig } from "@storybook/builder-vite";
import commonConfig from '../../../.storybook/main';

const config: StorybookViteConfig = {
  ...commonConfig,
  core: {
    builder: "@storybook/builder-vite"
  },
  stories: ["../src/**/*.stories.@(js|ts|tsx|mdx)"],
  addons: [{
    name: "@storybook/addon-essentials",
    options: {
      backgrounds: false
    }
  }, "@storybook/addon-storysource"],
  framework: "@storybook/react"
};
module.exports = config;
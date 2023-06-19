import type { StorybookConfig } from "@storybook/react-vite";
const config = {
    addons: [
      {
        name: "@storybook/preset-scss",
        options: {
          cssLoaderOptions: {
            importLoaders: 1,
            modules: {
              mode: "local",
              auto: true,
              localIdentName: "[name]__[local]___[hash:base64:5]",
              exportGlobals: true,
            },
          },
        },
      },
      "@storybook/addon-styling",
      "@storybook/addon-links",
      "@storybook/addon-essentials",
      "@storybook/addon-interactions",
      "@storybook/addon-knobs",
      "storybook-addon-mock",
    ],
    framework: {
      name: "@storybook/react-vite",
      options: {},
    },
    // docs: {
    //   autodocs: true,
    // },
} as StorybookConfig;


export default config;

import type { StorybookConfig } from "@storybook/react-vite";

const config = {
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
        "@storybook/addon-knobs",
        "storybook-addon-mock"
    ],
    framework: {
        name: "@storybook/react-vite",
        options: {}
    },
    staticDirs: ["../../../public"],
    viteFinal: async (config: Record<string, unknown>) => {
        const configAdditions = {
            ...config,
            CESIUM_BASE_URL: "http://localhost:9010/"
        };

        return configAdditions;
    }
} as unknown as StorybookConfig;

export default config;

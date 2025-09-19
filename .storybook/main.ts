import type { StorybookConfig } from '@storybook-vue/nuxt';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(js|jsx|ts|tsx)",
    "../components/**/*.mdx",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    {
      name: '@storybook/addon-styling-webpack',
      options: {
        rules: [
          {
            test: /\.css$/,
            sideEffects: true,
            use: [
              "style-loader",
              {
                loader: "css-loader",
                options: { importLoaders: 1 },
              },
              {
                loader: "postcss-loader",
                options: {
                  implementation: require("postcss"),
                },
              },
            ],
          },
        ],
      }
    }
  ],
  framework: {
    name: "@storybook-vue/nuxt",
    options: {}
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '~': path.resolve(__dirname, '../'),
        '@': path.resolve(__dirname, '../'),
      };
    }
    return config;
  },
};
export default config;
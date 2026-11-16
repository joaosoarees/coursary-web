import type { StorybookConfig } from '@storybook/react-vite';
import type { PluginOption } from 'vite';

const isReactRouter = (plugin: PluginOption) =>
  typeof plugin === 'object' &&
  plugin !== null &&
  'name' in plugin &&
  plugin.name.startsWith('react-router');

const withoutReactRouter = (plugins: PluginOption[]): PluginOption[] =>
  plugins.flatMap((plugin) => {
    if (Array.isArray(plugin)) {
      return withoutReactRouter(plugin);
    }

    return isReactRouter(plugin) ? [] : [plugin];
  });

const config: StorybookConfig = {
  stories: ['../app/**/*.mdx', '../app/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes'],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  // The React Router plugin builds the app from its routes, which a story never has. It also
  // silenced the "use client" of every Radix module, which the bundle drops anyway.
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: withoutReactRouter(viteConfig.plugins ?? []),
    build: {
      ...viteConfig.build,
      rolldownOptions: {
        ...viteConfig.build?.rolldownOptions,
        onwarn: (warning, defaultHandler) => {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
            warning.message.includes('use client')
          ) {
            return;
          }

          defaultHandler(warning);
        },
      },
    },
  }),
};

export default config;

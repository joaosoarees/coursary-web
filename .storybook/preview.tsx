import '@fontsource-variable/atkinson-hyperlegible-next/wght.css';
import '@fontsource-variable/bricolage-grotesque/wght.css';
import '../app/app.css';

import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview, ReactRenderer } from '@storybook/react-vite';

const preview: Preview = {
  decorators: [
    // A docs page draws every story on its own white page, which the body's colour never reaches.
    (Story, { viewMode }) =>
      viewMode === 'docs' ? (
        <div className="rounded-md bg-background p-6 text-foreground">
          <Story />
        </div>
      ) : (
        <Story />
      ),
    withThemeByClassName<ReactRenderer>({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
    }),
  ],
  parameters: {
    layout: 'centered',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  tags: ['autodocs'],
};

export default preview;

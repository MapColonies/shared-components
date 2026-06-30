import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    options: {
      storySort: (a, b) => {
        return a.title === b.title ? 0 : a.id.localeCompare(b.id, { numeric: true });
      },
    },
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;

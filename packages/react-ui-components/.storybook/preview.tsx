import React from 'react';

import { themes } from '@storybook/theming';
import { ThemeProvider, Themes } from '../src/components/theme';
import { useDarkMode } from 'storybook-dark-mode';
import { Preview } from '@storybook/react';

export default {
  parameters: [
    {
      docs: {
        theme: themes.dark,
      },
    },
  ],
  decorators: [
    (story) => {
      const prefersDarkMode = useDarkMode();
      const theme = prefersDarkMode ? Themes.darkTheme : Themes.lightTheme;

      return (
        <ThemeProvider options={theme}>
          <div className="mdc-typography" style={{ padding: '24px', height: '100%', background: 'var(--mdc-theme-background)' }}>
            {story()}
          </div>
        </ThemeProvider>
      );
    },
  ],
} as Preview;

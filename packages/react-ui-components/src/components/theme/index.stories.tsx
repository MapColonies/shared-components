import React from 'react';

import { ThemePropT } from '@rmwc/types';
import type { Meta, StoryObj } from '@storybook/react';
import { Theme, themeOptions } from './';
import './styles.js';

const meta: Meta<typeof Theme> = {
  component: Theme,
};

type Story = StoryObj<typeof Theme>;

const themeStyle = {
    padding: '16px',
    margin: '16px',
    display: 'inline-block',
    width: '96px',
    height: '96px',
    verticalAlign: 'top'
  };

export const themeStory: Story = {
  render: () => (
    <>
      <div style={{ backgroundColor: '#ddd' }}>
        {themeOptions.map((theme, i) => (
          <Theme use={theme as ThemePropT} style={themeStyle} key={i}>
            {theme}
          </Theme>
        ))}
      </div>
    </>
  ),
};

export default meta;

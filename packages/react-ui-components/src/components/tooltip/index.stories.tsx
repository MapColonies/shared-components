import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from '../icon-button';
import { Tooltip } from './';
import './styles.js';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
};

type Story = StoryObj<typeof Tooltip>;

export const tooltipStory: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 20 }}>
      <Tooltip content="Cookies">
        <IconButton icon="star_border" />
      </Tooltip>

      <Tooltip content="Pizza">
        <IconButton icon="favorite_border" />
      </Tooltip>

      <Tooltip content="Icecream">
        <IconButton icon="mood" />
      </Tooltip>
    </div>
  ),
};

export default meta;

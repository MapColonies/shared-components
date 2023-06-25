import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './';

const meta: Meta<typeof IconButton> = {
  component: IconButton,
};

type Story = StoryObj<typeof IconButton>;

export const iconButtonStory: Story = {
  render: () => (
    <>
      <IconButton icon="favorite_border" onIcon="favorite" />
      <IconButton icon="favorite" onIcon="favorite" disabled />
    </>
  ),
};

export default meta;

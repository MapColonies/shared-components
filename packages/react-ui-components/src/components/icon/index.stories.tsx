import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './';
import './styles.js';

const meta: Meta<typeof Icon> = {
  component: Icon,
};

type Story = StoryObj<typeof Icon>;

export const iconStory: Story = {
  render: () => (
    <>
      <Icon icon="favorite" />
      <Icon icon="favorite_outline" />
      <Icon icon={{ icon: 'star', strategy: 'ligature' }} />
      <div>
        {/* 18px */}
        <Icon icon={{ icon: 'favorite', size: 'xsmall' }} />
        {/* 20px */}
        <Icon icon={{ icon: 'favorite', size: 'small' }} />
        {/* 24px */}
        <Icon icon={{ icon: 'favorite', size: 'medium' }} />
        {/* 36px */}
        <Icon icon={{ icon: 'favorite', size: 'large' }} />
        {/* 48px */}
        <Icon icon={{ icon: 'favorite', size: 'xlarge' }} />
      </div>
    </>
  ),
};

export default meta;

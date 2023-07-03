import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './';
import './styles';

const meta: Meta<typeof Button> = {
  component: Button,
};

type Story = StoryObj<typeof Button>;

export const primary: Story = {
  render: () => (
    <Button ripple={false} raised trailingIcon="home">
      Primary Button
    </Button>
  ),
};

export const disabled: Story = {
  render: () => (
    <Button ripple={false} outlined trailingIcon="home" disabled>
      Disabled Button
    </Button>
  ),
};

export default meta;

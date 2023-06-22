import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@map-colonies/react-core';

const meta: Meta<typeof Button> = {
  component: Button,
};

type Story = StoryObj<typeof Button>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const primary: Story = {
  render: () => <Button ripple={false} raised trailingIcon="home">Primary Button</Button>,
};

export const disabled: Story = {
  render: () => <Button ripple={false} outlined trailingIcon="home" disabled>Disabled Button</Button>,
};

export default meta;
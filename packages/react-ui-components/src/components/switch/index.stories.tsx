import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './';

const meta: Meta<typeof Switch> = {
  component: Switch,
};

type Story = StoryObj<typeof Switch>;

export const switchStory: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 20}}>
      <Switch label="Basic" />
      <Switch defaultChecked label="Default checked" />
      <Switch disabled label="Disabled" />
      <Switch disabled defaultChecked label="Disabled" />
    </div>
  ),
};

export default meta;

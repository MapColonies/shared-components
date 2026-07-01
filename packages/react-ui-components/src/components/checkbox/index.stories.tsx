import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './';
import './styles.js';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
};

type Story = StoryObj<typeof Checkbox>;

export const checkboxStory: Story = {
  render: () => (
    <>
      <Checkbox label="un-controlled" />
      <Checkbox label="Always On" checked />
      <Checkbox label="Always Off" checked={false} />
      <Checkbox label="Disabled" checked={false} disabled />
    </>
  ),
};

export default meta;

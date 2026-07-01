import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './';
import './styles.js';

const meta: Meta<typeof Select> = {
  component: Select,
};

type Story = StoryObj<typeof Select>;

export const selectStory: Story = {
  render: () => (
    <>
      <Select label="Standard" options={['Cookies', 'Pizza', 'Icecream']} />
      <Select label="Outlined" outlined options={['Cookies', 'Pizza', 'Icecream']} />
      <Select label="Enhanced" enhanced options={['Cookies', 'Pizza', 'Icecream']} />
      <Select
        label="With Icon"
        defaultValue="Pizza"
        helpText="Choose your favorite snack..."
        icon="favorite"
        options={['Cookies', 'Pizza', 'Icecream']}
      />
    </>
  ),
};

export default meta;

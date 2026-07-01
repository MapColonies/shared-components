import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from './';
import './styles.js';

const meta: Meta<typeof TextField> = {
  component: TextField,
};

type Story = StoryObj<typeof TextField>;

export const textFieldStory: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TextField icon="search" trailingIcon="close" label="icon..." />
      {/* If you need full control over the icon, you can pass the icon as options with your own props. Dont forget the TabIndex to make it clickable*/}
      <TextField
        label="trailingIcon..."
        trailingIcon={{
          icon: 'close',
          tabIndex: 0,
          onClick: () => console.log('Clear'),
        }}
      />
      <TextField invalid label="Invalid..." value="#@!$" />
      <TextField label="Validate Pattern" pattern="[A-Za-z]{3}" />
    </div>
  ),
};

export const textAreaStory: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TextField
        textarea
        label="textarea..."
        rows={8}
        maxLength={20}
        characterCount
        resizeable
        helpText={{
          persistent: true,
          validationMsg: true,
          children: 'The field is required',
        }}
      />
    </div>
  ),
};

export default meta;

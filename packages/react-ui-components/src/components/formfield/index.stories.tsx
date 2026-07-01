import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './';
import './styles.js';

const meta: Meta<typeof FormField> = {
  component: FormField,
};

type Story = StoryObj<typeof FormField>;

export const formFieldStory: Story = {
  render: () => (
    <>
      <FormField>
        <input type="checkbox" id="input" />
        <label htmlFor="input">Input Label</label>
      </FormField>
    </>
  ),
};

export default meta;

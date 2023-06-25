import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Fab } from './';

const meta: Meta<typeof Fab> = {
  component: Fab,
};

type Story = StoryObj<typeof Fab>;

export const fabStory: Story = {
  render: () => (
    <>
      <Fab icon="add" label="Create" />
      <Fab trailingIcon="add" label="Create" />
      <Fab label="Label only" />
      <Fab icon="favorite" />
      <Fab icon="favorite" mini />

      <Fab icon="favorite_outline" theme={['primaryBg', 'onPrimary']} />
      <Fab icon="delete" style={{ backgroundColor: 'var(--mdc-theme-error)' }} theme={['onError']} />
    </>
  ),
};

export default meta;

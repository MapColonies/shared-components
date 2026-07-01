import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LinearProgress } from './';
import './styles.js';

const meta: Meta<typeof LinearProgress> = {
  component: LinearProgress,
};

type Story = StoryObj<typeof LinearProgress>;

export const linearProgressStory: Story = {
  render: () => (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <LinearProgress />
        <LinearProgress progress={0.5} />
        <LinearProgress progress={0.6} buffer={0.8} />
        <LinearProgress progress={0.2} reversed />
      </div>
    </>
  ),
};

export default meta;

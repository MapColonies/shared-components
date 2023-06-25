import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { CircularProgress } from './';

const meta: Meta<typeof CircularProgress> = {
  component: CircularProgress,
};

type Story = StoryObj<typeof CircularProgress>;

export const circularProgressStory: Story = {
  render: () => (
    <>
      <CircularProgress size="xsmall" />
      <CircularProgress size="small" />
      <CircularProgress size="medium" />
      <CircularProgress size="large" />
      <CircularProgress size="xlarge" />
    </>
  ),
};

export const circularProgressManualStory: Story = {
  render: () => (
    <>
      <CircularProgress progress={0.3} />
      <CircularProgress progress={0.6} />
      <CircularProgress progress={0.9} />
    </>
  ),
};

export default meta;

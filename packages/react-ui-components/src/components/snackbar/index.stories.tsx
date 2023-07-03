import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { Snackbar, SnackbarAction } from './';
import './styles.js';

const meta: Meta<typeof Snackbar> = {
  component: Snackbar,
};

type Story = StoryObj<typeof Snackbar>;

const SnackbarExample: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Snackbar
        open={open}
        onClose={(): void => setOpen(false)}
        message="This is a new message"
        dismissesOnAction
        action={<SnackbarAction label="Dismiss" onClick={(): void => console.log('Click Me')} />}
      />

      <Button raised label="Show snackbar" onClick={(): void => setOpen(!open)} />
    </>
  );
};

export const snackbarStory: Story = {
  render: () => (
    <>
      <SnackbarExample />
    </>
  ),
};

export default meta;

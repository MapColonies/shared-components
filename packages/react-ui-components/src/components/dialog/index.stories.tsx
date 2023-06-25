import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { DialogButton } from '@rmwc/dialog';
import { Button } from '../button';
import { Dialog, DialogActions, DialogContent, DialogQueue, DialogTitle, createDialogQueue } from './';

const meta: Meta<typeof Dialog> = {
  component: Dialog,
};

type Story = StoryObj<typeof Dialog>;

// Create dialog queue at some root of the application
const { dialogs, alert, confirm, prompt } = createDialogQueue();

const StandardDialog: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Dialog
        open={open}
        onClose={(): void => {
          
          setOpen(false);
        }}
      >
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogContent>This is a standard dialog.</DialogContent>
        <DialogActions>
          <DialogButton action="close">Cancel</DialogButton>
          <DialogButton action="accept" isDefaultAction>
            Sweet!
          </DialogButton>
        </DialogActions>
      </Dialog>

      <Button raised onClick={(): void => setOpen(true)}>
        Open standard Dialog
      </Button>
    </>
  );
};

const DialogQueueExample: React.FC = () => {

  const [response, setResponse] = React.useState<string | boolean>('___');

  const fireAlert = async (): Promise<void> => alert({ title: 'Hello!' }).then((res: boolean) => setResponse(res));

  const fireConfirm = async (): Promise<void> => confirm({}).then((res: boolean) => setResponse(res));

  const firePrompt = async (): Promise<void> => prompt({ inputProps: { outlined: true } }).then((res: boolean) => setResponse(res));

  return (
    <div>
      <Button label="Alert" onClick={(): void => void fireAlert()} />
      <Button label="Confirm" onClick={(): void => void fireConfirm()} />
      <Button label="Prompt" onClick={(): void => void void firePrompt()} />
      <Button
        label="In Sequence"
        onClick={(): void => {
          void fireAlert();
          void fireConfirm();
          void firePrompt();
        }}
      />

      <p>
        Response: <b>{String(response)}</b>
      </p>
      <DialogQueue dialogs={dialogs} />
    </div>
  );
};

export const dialogStory: Story = {
  render: () => (
    <>
      <StandardDialog />
    </>
  ),
};

export const dialogQueueStory: Story = {
  render: () => (
    <>
      <DialogQueueExample />
    </>
  ),
};

export default meta;

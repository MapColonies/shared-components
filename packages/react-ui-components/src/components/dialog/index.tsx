/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { PropsWithChildren } from 'react';
import {
  DialogProps as RMWCDialogProps,
  Dialog as RMWCDialog,
  DialogTitleProps as RMWCDialogTitleProps,
  DialogTitle as RMWCDialogTitle,
  DialogContentProps as RMWCDialogContentProps,
  DialogContent as RMWCDialogContent,
  DialogActionsProps as RMWCDialogActionsProps,
  DialogActions as RMWCDialogActions,
  DialogQueueProps as RMWCDialogQueueProps,
  DialogQueue as RMWCDialogQueue,
  createDialogQueue as RMWCCreateDialogQueue,
} from '@rmwc/dialog';

import '@rmwc/dialog/styles';

export interface DialogProps extends React.ComponentProps<typeof RMWCDialog> {}
export interface DialogContentProps extends React.ComponentProps<typeof RMWCDialogContent> {}
export interface DialogTitleProps extends React.ComponentProps<typeof RMWCDialogTitle> {}
export interface DialogActionsProps extends React.ComponentProps<typeof RMWCDialogActions> {}
export interface DialogQueueProps extends React.ComponentProps<typeof RMWCDialogQueue> {}

export const Dialog: React.FC<DialogProps> = React.forwardRef<any, DialogProps>((props, ref) => {
  return <RMWCDialog ref={ref} {...props} />;
});

export const DialogTitle: React.FC<DialogTitleProps> = React.forwardRef<any, DialogTitleProps>((props, ref) => {
  return <RMWCDialogTitle ref={ref} {...props} />;
});

export const DialogContent: React.FC<DialogContentProps> = React.forwardRef<any, DialogContentProps>((props, ref) => {
  return <RMWCDialogContent ref={ref} {...props} />;
});

export const DialogActions: React.FC<DialogActionsProps> = React.forwardRef<any, DialogActionsProps>((props, ref) => {
  return <RMWCDialogActions ref={ref} {...props} />;
});

export const createDialogQueue = RMWCCreateDialogQueue;

export const DialogQueue: React.FC<RMWCDialogQueueProps> = (props) => {
  return <RMWCDialogQueue {...props} />;
};

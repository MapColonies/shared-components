/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Dialog as RMWCDialog,
  DialogTitle as RMWCDialogTitle,
  DialogContent as RMWCDialogContent,
  DialogActions as RMWCDialogActions,
  DialogQueueProps as RMWCDialogQueueProps,
  DialogQueue as RMWCDialogQueue,
  createDialogQueue as RMWCCreateDialogQueue,
} from '@rmwc/dialog';
import { ExtractProps } from '../typeHelpers';


export interface DialogProps extends ExtractProps<typeof RMWCDialog> {}
export interface DialogContentProps extends ExtractProps<typeof RMWCDialogContent> {}
export interface DialogTitleProps extends ExtractProps<typeof RMWCDialogTitle> {}
export interface DialogActionsProps extends ExtractProps<typeof RMWCDialogActions> {}
export interface DialogQueueProps extends ExtractProps<typeof RMWCDialogQueue> {}

export const Dialog = React.forwardRef<any, DialogProps>((props, ref) => {
  return <RMWCDialog ref={ref} {...props} />;
});

export const DialogTitle = React.forwardRef<any, DialogTitleProps>((props, ref) => {
  return <RMWCDialogTitle ref={ref} {...props} />;
});

export const DialogContent = React.forwardRef<any, DialogContentProps>((props, ref) => {
  return <RMWCDialogContent ref={ref} {...props} />;
});

export const DialogActions = React.forwardRef<any, DialogActionsProps>((props, ref) => {
  return <RMWCDialogActions ref={ref} {...props} />;
});

export const createDialogQueue = RMWCCreateDialogQueue;

export const DialogQueue: React.FC<RMWCDialogQueueProps> = (props) => {
  return <RMWCDialogQueue {...props} />;
};

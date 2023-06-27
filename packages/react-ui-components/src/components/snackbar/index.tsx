/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Snackbar as RMWCSnackbar,
  SnackbarAction as RMWCSnackbarAction,
  SnackbarQueue as RMWCSnackbarQueue,
  createSnackbarQueue as RMWCCreateSnamebarQueue
} from '@rmwc/snackbar';

import {HTMLProps} from '@rmwc/types';

import "@rmwc/snackbar/styles";

export interface SnackbarProps extends React.ComponentProps<typeof RMWCSnackbar> {};
export interface SnackbarActionProps extends React.ComponentProps<typeof RMWCSnackbarAction> {}
export interface SnackbarQueueProps extends React.ComponentProps<typeof RMWCSnackbarQueue> {}

export const createSnackbarQueue = RMWCCreateSnamebarQueue;

export const Snackbar: React.FC<SnackbarProps> = React.forwardRef<any, SnackbarProps>((props, ref) => {
  return <RMWCSnackbar ref={ref} {...props} />;
});

export const SnackbarAction: React.FC<SnackbarActionProps> = React.forwardRef<any, SnackbarActionProps>((props, ref) => {
  return <RMWCSnackbarAction ref={ref} {...props} />;
});

export const SnackbarQueue: React.FC<SnackbarQueueProps & HTMLProps> = (props) => {
  return <RMWCSnackbarQueue {...props} />;
};
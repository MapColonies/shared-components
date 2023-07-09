/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Snackbar as RMWCSnackbar,
  SnackbarAction as RMWCSnackbarAction,
  SnackbarQueue as RMWCSnackbarQueue,
  createSnackbarQueue as RMWCCreateSnackbarQueue,
} from '@rmwc/snackbar';

import { HTMLProps } from '@rmwc/types';


import { ExtractProps } from '../typeHelpers';

export interface SnackbarProps extends ExtractProps<typeof RMWCSnackbar> {}
export interface SnackbarActionProps extends ExtractProps<typeof RMWCSnackbarAction> {}
export interface SnackbarQueueProps extends ExtractProps<typeof RMWCSnackbarQueue> {}

export const createSnackbarQueue = RMWCCreateSnackbarQueue;

export const Snackbar: React.FC<SnackbarProps> = React.forwardRef<any, SnackbarProps>((props, ref) => {
  return <RMWCSnackbar ref={ref} {...props} />;
});

export const SnackbarAction: React.FC<SnackbarActionProps> = React.forwardRef<any, SnackbarActionProps>((props, ref) => {
  return <RMWCSnackbarAction ref={ref} {...props} />;
});

export const SnackbarQueue: React.FC<SnackbarQueueProps & HTMLProps> = (props) => {
  return <RMWCSnackbarQueue {...props} />;
};

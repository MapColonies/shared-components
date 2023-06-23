/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  SnackbarProps as RMWCSnackbarProps,
  Snackbar as RMWCSnackbar,
  SnackbarActionProps as RMWCSnackbarActionProps,
  SnackbarAction as RMWCSnackbarAction,
  SnackbarQueueProps as RMWCSnackbarQueueProps,
  SnackbarQueue as RMWCSnackbarQueue,
} from '@rmwc/snackbar';

import {HTMLProps} from '@rmwc/types';

import "@rmwc/snackbar/styles";

export interface SnackbarProps extends RMWCSnackbarProps {}
export interface SnackbarActionProps extends RMWCSnackbarActionProps {}
export interface SnackbarQueueProps extends RMWCSnackbarQueueProps {}

export const Snackbar: React.FC<SnackbarProps> = React.forwardRef<any, SnackbarProps>((props, ref) => {
  return <RMWCSnackbar ref={ref} {...props} />;
});

export const SnackbarAction: React.FC<SnackbarActionProps> = React.forwardRef<any, SnackbarActionProps>((props, ref) => {
  return <RMWCSnackbarAction ref={ref} {...props} />;
});

export const SnackbarQueue: React.FC<SnackbarQueueProps & HTMLProps> = (props) => {
  return <RMWCSnackbarQueue {...props} />;
};

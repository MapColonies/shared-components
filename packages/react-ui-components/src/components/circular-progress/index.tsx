/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { CircularProgress as RMWCCircularProgress } from '@rmwc/circular-progress';
import { ExtractProps } from '../typeHelpers';

export interface CircularProgressProps extends ExtractProps<typeof RMWCCircularProgress> {}

export const CircularProgress = React.forwardRef<any, CircularProgressProps>((props, ref) => {
  return <RMWCCircularProgress ref={ref} {...props} />;
}) as React.ForwardRefExoticComponent<CircularProgressProps>;

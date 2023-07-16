/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { LinearProgress as RMWCLinearProgress } from '@rmwc/linear-progress';
import { ExtractProps } from '../typeHelpers';

export interface LinearProgressProps extends ExtractProps<typeof RMWCLinearProgress> {}

export const LinearProgress = React.forwardRef<any, LinearProgressProps>((props, ref) => {
  return <RMWCLinearProgress ref={ref} {...props} />;
}) as React.ForwardRefExoticComponent<LinearProgressProps>;

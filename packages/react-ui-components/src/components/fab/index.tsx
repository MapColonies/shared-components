/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Fab as RMWCFab } from '@rmwc/fab';
import { ExtractProps } from '../typeHelpers';

export interface FabProps extends ExtractProps<typeof RMWCFab> {}

export const Fab = React.forwardRef<any, FabProps>((props, ref) => {
  return <RMWCFab ref={ref} {...props} />;
}) as React.ForwardRefExoticComponent<FabProps>;

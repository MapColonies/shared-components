/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { LinearProgressProps as RMWCLinearProgressProps, LinearProgress as RMWCLinearProgress} from '@rmwc/linear-progress';
import '@rmwc/linear-progress/styles';

export interface LinearProgressProps extends RMWCLinearProgressProps {};

export const LinearProgress: React.FC<LinearProgressProps> = React.forwardRef<any, LinearProgressProps>((props, ref) => {

return <RMWCLinearProgress ref={ref} {...props} />

});
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { CircularProgress as RMWCCircularProgress} from '@rmwc/circular-progress';
import '@rmwc/circular-progress/styles';

export interface CircularProgressProps extends React.ComponentProps<typeof RMWCCircularProgress> {};

export const CircularProgress: React.FC<CircularProgressProps> = React.forwardRef<any, CircularProgressProps>((props, ref) => {

return <RMWCCircularProgress ref={ref} {...props} />

});
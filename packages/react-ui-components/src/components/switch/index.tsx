/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { SwitchProps as RMWCSwitchProps, Switch as RMWCSwitch} from '@rmwc/switch';
import "@rmwc/switch/styles";


export interface SwitchProps extends React.ComponentProps<typeof RMWCSwitch> {};

export const Switch: React.FC<SwitchProps> = React.forwardRef<any, SwitchProps>((props, ref) => {

return <RMWCSwitch ref={ref} {...props} />

});
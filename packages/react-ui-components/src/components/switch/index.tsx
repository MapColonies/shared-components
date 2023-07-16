import { forwardRef } from 'react';
import { SwitchHTMLProps, SwitchProps as RMWCSwitchProps, Switch as RMWCSwitch } from '@rmwc/switch';

import { ExtractProps } from '../typeHelpers';

type SwitchPropsWithHtml = SwitchHTMLProps & RMWCSwitchProps;

export interface SwitchProps extends ExtractProps<typeof RMWCSwitch> {}

export const Switch = forwardRef<any, SwitchProps & SwitchPropsWithHtml>((props, ref) => {
  return <RMWCSwitch ref={ref} {...props} />;
}) as React.ForwardRefExoticComponent<SwitchProps & SwitchPropsWithHtml>;

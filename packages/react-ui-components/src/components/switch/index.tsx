import React from 'react';
import { SwitchHTMLProps, SwitchProps as RMWCSwitchProps, Switch as RMWCSwitch } from '@rmwc/switch';
import '@rmwc/switch/styles';

import { ExtractProps } from '../typeHelpers';

type SwitchPropsWithHtml = SwitchHTMLProps & RMWCSwitchProps;

export interface SwitchProps extends ExtractProps<typeof RMWCSwitch> {}

export const Switch: React.FC<SwitchProps & SwitchPropsWithHtml> = (props) => {
  return <RMWCSwitch ref={props.ref} {...props} />;
};

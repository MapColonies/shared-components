import React, { PropsWithChildren } from 'react';
import { RMWCProvider as Provider, RMWCProviderProps } from '@rmwc/provider';

export interface ProviderProps extends React.ComponentProps<typeof Provider> {}

export const RMWCProvider: React.FC<PropsWithChildren<ProviderProps & RMWCProviderProps>> = (props) => {
  return <Provider {...props} />;
};

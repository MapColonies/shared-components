import React from 'react';
import { RMWCProvider as Provider, RMWCProviderProps } from '@rmwc/provider';
import '@rmwc/provider/styles';

export interface ProviderProps extends React.ComponentProps<typeof Provider> {}

export const RMWCProvider: React.FC<ProviderProps & RMWCProviderProps> = (props) => {
  return <Provider {...props} />;
};

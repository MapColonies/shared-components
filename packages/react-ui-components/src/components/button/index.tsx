/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button as RMWCButton} from '@rmwc/button';

import '@rmwc/button/styles';

type BtnProps =  React.ComponentProps<typeof RMWCButton>;

export interface ButtonProps extends BtnProps{};

export const Button: React.FC<ButtonProps> = (props) => {
  return <RMWCButton {...props} />
};


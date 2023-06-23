/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ButtonProps as RMWCButtonProps,Button as RMWCButton, ButtonHTMLProps as RMWCButtonHTMLProps} from '@rmwc/button';

import '@rmwc/button/styles';

type BtnProps =  RMWCButtonProps & RMWCButtonHTMLProps;

export interface ButtonProps extends BtnProps{};

export const Button: React.FC<ButtonProps> = (props) => {
  return <RMWCButton {...props} />
};


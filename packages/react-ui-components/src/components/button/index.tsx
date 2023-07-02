/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ButtonHTMLProps, ButtonProps as RMWCButtonProps, Button as RMWCButton } from '@rmwc/button';
import '@rmwc/button/styles';
import { ExtractProps } from '../typeHelpers';

type ButtonPropsWithHtml = ButtonHTMLProps & RMWCButtonProps;

export interface ButtonProps extends ExtractProps<typeof RMWCButton> {}

export const Button: React.FC<ButtonProps & ButtonPropsWithHtml> = (props) => {
  return <RMWCButton ref={props.ref} {...props} />;
};

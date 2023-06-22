import React from 'react';
import { ButtonProps as RMWCButtonProps,Button as RMWCButton} from '@rmwc/button';
import '@material/button/dist/mdc.button.css';

export interface ButtonProps extends RMWCButtonProps {};

export const Button: React.FC<ButtonProps> = React.forwardRef<any, ButtonProps>((props, ref) => {
  
  return <RMWCButton ref={ref} {...props} />

});


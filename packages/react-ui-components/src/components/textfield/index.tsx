/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef } from 'react';
import { TextFieldHTMLProps, TextFieldProps as RMWCTextFieldProps, TextField as RMWCTextField } from '@rmwc/textfield';
import { ExtractProps } from '../typeHelpers';

type TextFieldPropsWithHtml = TextFieldHTMLProps & RMWCTextFieldProps;

export interface TextFieldProps extends ExtractProps<typeof RMWCTextField> {}

export const TextField = forwardRef<any, TextFieldProps & TextFieldPropsWithHtml>((props, ref) => {
  return <RMWCTextField ref={ref} {...props} />;
});

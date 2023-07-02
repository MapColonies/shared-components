/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { TextFieldHTMLProps, TextFieldProps as RMWCTextFieldProps, TextField as RMWCTextField } from '@rmwc/textfield';
import '@rmwc/textfield/styles';
import { ExtractProps } from '../typeHelpers';

type TextFieldPropsWithHtml = TextFieldHTMLProps & RMWCTextFieldProps;

export interface TextFieldProps extends ExtractProps<typeof RMWCTextField> {}

export const TextField: React.FC<TextFieldProps & TextFieldPropsWithHtml> = (props) => {
  return <RMWCTextField ref={props.ref} {...props} />;
};

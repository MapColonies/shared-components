/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { TextFieldProps as RMWCTextfieldProps, TextField as RMWCTextfield} from '@rmwc/textfield';
import '@rmwc/textfield/styles'

export interface TextfieldProps extends RMWCTextfieldProps {};

export const Textfield: React.FC<TextfieldProps> = React.forwardRef<any, TextfieldProps>((props, ref) => {

return <RMWCTextfield ref={ref} {...props} />

});
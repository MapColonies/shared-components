/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { TextField as RMWCTextfield } from '@rmwc/textfield';
import '@rmwc/textfield/styles'

export interface TextfieldProps extends React.ComponentProps<typeof RMWCTextfield> {};

export const TextField: React.FC<TextfieldProps> = React.forwardRef<any, TextfieldProps>((props, ref) => {

return <RMWCTextfield ref={ref} {...props} />

});
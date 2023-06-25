/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {Checkbox as RMWCCheckbox} from '@rmwc/checkbox';
import '@rmwc/checkbox/styles'

export interface CheckboxProps extends  React.ComponentProps<typeof RMWCCheckbox>{};

export const Checkbox: React.FC<CheckboxProps> = React.forwardRef<any, CheckboxProps>((props, ref) => {

return <RMWCCheckbox ref={ref} {...props} />

});
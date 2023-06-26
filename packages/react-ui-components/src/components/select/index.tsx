/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Select as RMWCSelect } from '@rmwc/select';
import "@rmwc/select/styles";

export interface SelectProps extends React.ComponentProps<typeof RMWCSelect> {};

export const Select: React.FC<SelectProps> = React.forwardRef<any, SelectProps>((props, ref) => {

return <RMWCSelect ref={ref} {...props} />

});
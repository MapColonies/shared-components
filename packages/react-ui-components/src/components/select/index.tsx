/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Select as RMWCSelect, FormattedOption as RMWCFormattedOption } from '@rmwc/select';
import "@rmwc/select/styles";

export interface FormattedOption extends RMWCFormattedOption {};
export interface SelectProps extends React.ComponentProps<typeof RMWCSelect> {};

export const Select: React.FC<SelectProps> = React.forwardRef<any, SelectProps>((props, ref) => {

return <RMWCSelect ref={ref} {...props} />

});
import { forwardRef } from 'react';
import { SelectHTMLProps, SelectProps as RMWCSelectProps, Select as RMWCSelect, FormattedOption as RMWCFormattedOption } from '@rmwc/select';
import { ExtractProps } from '../typeHelpers';

type SelectPropsWithHtml = SelectHTMLProps & RMWCSelectProps;

export interface SelectProps extends ExtractProps<typeof RMWCSelect> {}
export type FormattedOption = RMWCFormattedOption;

export const Select = forwardRef<any, SelectProps & SelectPropsWithHtml>((props, ref) => {
  return <RMWCSelect ref={ref} {...props} />;
}) as React.ForwardRefExoticComponent<SelectProps & SelectPropsWithHtml>;

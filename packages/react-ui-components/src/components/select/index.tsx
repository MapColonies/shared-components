import React from 'react';
import { SelectHTMLProps, SelectProps as RMWCSelectProps, Select as RMWCSelect, FormattedOption as RMWCFormattedOption } from '@rmwc/select';
import { ExtractProps } from '../typeHelpers';

type SelectPropsWithHtml = SelectHTMLProps & RMWCSelectProps;

export interface SelectProps extends ExtractProps<typeof RMWCSelect> {}
export type FormattedOption = RMWCFormattedOption;

export const Select: React.FC<SelectProps & SelectPropsWithHtml> = (props) => {
  return <RMWCSelect ref={props.ref} {...props} />;
};

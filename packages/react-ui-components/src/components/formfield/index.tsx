import React from 'react';
import { FormFieldProps as RMWCFormFieldProps, FormField as RMWCFormField } from '@rmwc/formfield';
import { ExtractProps } from '../typeHelpers';

export interface FormFieldProps extends ExtractProps<typeof RMWCFormField> {}

export const FormField: React.FC<FormFieldProps & RMWCFormFieldProps> = (props) => {
  return <RMWCFormField ref={props.ref} {...props} />;
};

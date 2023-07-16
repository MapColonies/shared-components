import React, { forwardRef } from 'react';
import { FormFieldProps as RMWCFormFieldProps, FormField as RMWCFormField } from '@rmwc/formfield';
import { ExtractProps } from '../typeHelpers';

export interface FormFieldProps extends ExtractProps<typeof RMWCFormField> {}

export const FormField = forwardRef<any, FormFieldProps & RMWCFormFieldProps>((props, ref) => {
  return <RMWCFormField ref={ref} {...props} />;
}) as React.ForwardRefExoticComponent<FormFieldProps & RMWCFormFieldProps>;

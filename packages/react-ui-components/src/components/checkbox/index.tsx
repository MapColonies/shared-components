/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef } from 'react';
import { CheckboxHTMLProps, CheckboxProps as RMWCCheckboxProps, Checkbox as RMWCCheckbox } from '@rmwc/checkbox';
import { ExtractProps } from '../typeHelpers';

type CheckboxPropsWithHtml = CheckboxHTMLProps & RMWCCheckboxProps;

export interface CheckboxProps extends ExtractProps<typeof RMWCCheckbox> {}

export const Checkbox = forwardRef<any, CheckboxProps & CheckboxPropsWithHtml>((props, ref) => {
  return <RMWCCheckbox ref={ref} {...props} />;
});

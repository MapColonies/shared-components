/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { CheckboxHTMLProps, CheckboxProps as RMWCCheckboxProps, Checkbox as RMWCCheckbox } from '@rmwc/checkbox';
import '@rmwc/checkbox/styles';
import { ExtractProps } from '../typeHelpers';

type CheckboxPropsWithHtml = CheckboxHTMLProps & RMWCCheckboxProps;

export interface CheckboxProps extends ExtractProps<typeof RMWCCheckbox> {}

export const Checkbox: React.FC<CheckboxProps & CheckboxPropsWithHtml> = (props) => {
  return <RMWCCheckbox ref={props.ref} {...props} />;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef } from 'react';
import { IconButtonHTMLProps, IconButton as RMWCIconButton, IconButtonProps as RMWCIconButtonProps } from '@rmwc/icon-button';
import { ExtractProps } from '../typeHelpers';

type IconButtonPropsWithHtml = IconButtonHTMLProps & RMWCIconButtonProps;
export interface IconButtonProps extends ExtractProps<typeof RMWCIconButton> {}

export const IconButton = forwardRef<any, IconButtonProps & IconButtonPropsWithHtml>((props, ref) => {
  return <RMWCIconButton ref={ref} {...props} />;
}) as React.ForwardRefExoticComponent<IconButtonProps & IconButtonPropsWithHtml>;

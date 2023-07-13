/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef } from 'react';
import { IconHTMLProps, Icon as RMWCIcon, IconProps as RMWCIconProps } from '@rmwc/icon';
import { ExtractProps } from '../typeHelpers';

type IconPropsWithHtml = IconHTMLProps & RMWCIconProps;

export interface IconProps extends ExtractProps<typeof RMWCIcon> {}

export const Icon = forwardRef<any, IconProps & IconPropsWithHtml>((props, ref) => {
  return <RMWCIcon ref={ref} {...props} />;
});

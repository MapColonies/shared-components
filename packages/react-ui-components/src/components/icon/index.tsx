/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { IconHTMLProps, Icon as RMWCIcon, IconProps as RMWCIconProps } from '@rmwc/icon';
import '@rmwc/icon/styles';
import { ExtractProps } from '../typeHelpers';

type IconPropsWithHtml = IconHTMLProps & RMWCIconProps;

export interface IconProps extends ExtractProps<typeof RMWCIcon> {}

export const Icon: React.FC<IconProps & IconPropsWithHtml> = (props) => {
  return <RMWCIcon ref={props.ref} {...props} />;
};

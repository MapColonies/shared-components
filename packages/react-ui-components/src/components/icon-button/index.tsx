/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { IconButtonHTMLProps, IconButton as RMWCIconButton, IconButtonProps as RMWCIconButtonProps } from '@rmwc/icon-button';
import '@rmwc/icon-button/styles';
import { ExtractProps } from '../typeHelpers';

type IconButtonPropsWithHtml = IconButtonHTMLProps & RMWCIconButtonProps;
export interface IconButtonProps extends ExtractProps<typeof RMWCIconButton> {}

export const IconButton: React.FC<IconButtonProps & IconButtonPropsWithHtml> = (props) => {
  return <RMWCIconButton ref={props.ref} {...props} />;
};

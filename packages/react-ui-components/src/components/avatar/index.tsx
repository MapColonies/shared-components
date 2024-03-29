/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Avatar as RMWCAvatar,
  AvatarGroup as RMWCAvatarGroup,
  AvatarCountProps as RMWCAvatarCountProps,
  AvatarCount as RMWCAvatarCount,
} from '@rmwc/avatar';

import { ExtractProps } from '../typeHelpers';

export interface AvatarProps extends ExtractProps<typeof RMWCAvatar> {}
export interface AvatarGroupProps extends ExtractProps<typeof RMWCAvatarGroup> {}
export interface AvatarCountProps extends ExtractProps<typeof RMWCAvatarCount> {}

export const Avatar = React.forwardRef<any, AvatarProps>((props, ref) => {
  return <RMWCAvatar ref={ref} {...props} />;
}) as React.ForwardRefExoticComponent<AvatarProps>;

export const AvatarGroup = React.forwardRef<any, AvatarGroupProps>((props, ref) => {
  return <RMWCAvatarGroup ref={ref} {...props}></RMWCAvatarGroup>;
}) as React.ForwardRefExoticComponent<AvatarGroupProps>;

export const AvatarCount = React.forwardRef<any, AvatarCountProps & RMWCAvatarCountProps>((props, ref) => {
  return <RMWCAvatarCount ref={ref} {...props} />;
}) as React.ForwardRefExoticComponent<AvatarCountProps & RMWCAvatarCountProps>;

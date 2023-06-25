/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { PropsWithChildren } from 'react';
import {
  AvatarProps as RMWCAvatarProps,
  Avatar as RMWCAvatar,
  AvatarGroupProps as RMWCAvatarGroupProps,
  AvatarGroup as RMWCAvatarGroup,
  AvatarCountProps as RMWCAvatarCountProps,
  AvatarCount as RMWCAvatarCount,
} from '@rmwc/avatar';
import '@rmwc/avatar/styles';

export interface AvatarProps extends RMWCAvatarProps {}
export interface AvatarGroupProps extends PropsWithChildren<RMWCAvatarGroupProps> {}
export interface AvatarCountProps extends RMWCAvatarCountProps {}

export const Avatar: React.FC<AvatarProps> = React.forwardRef<any, AvatarProps>((props, ref) => {
  return <RMWCAvatar ref={ref} {...props} />;
});

export const AvatarGroup: React.FC<AvatarGroupProps> = React.forwardRef<any, AvatarGroupProps>((props, ref) => {
  return <RMWCAvatarGroup ref={ref} {...props}></RMWCAvatarGroup>;
});

export const AvatarCount: React.FC<AvatarCountProps> = React.forwardRef<any, AvatarCountProps>((props, ref) => {
  return <RMWCAvatarCount ref={ref} {...props} />;
});

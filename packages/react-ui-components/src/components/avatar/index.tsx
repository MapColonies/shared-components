/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Avatar as RMWCAvatar,
  AvatarGroup as RMWCAvatarGroup,
  AvatarCountProps as RMWCAvatarCountProps,
  AvatarCount as RMWCAvatarCount,
} from '@rmwc/avatar';
import '@rmwc/avatar/styles';

export interface AvatarProps extends React.ComponentProps<typeof RMWCAvatar> {}
export interface AvatarGroupProps extends React.ComponentProps<typeof RMWCAvatarGroup> {}
export interface AvatarCountProps extends React.ComponentProps<typeof RMWCAvatarCount> {}

export const Avatar: React.FC<AvatarProps> = React.forwardRef<any, AvatarProps>((props, ref) => {
  return <RMWCAvatar ref={ref} {...props} />;
});

export const AvatarGroup: React.FC<AvatarGroupProps> = React.forwardRef<any, AvatarGroupProps>((props, ref) => {
  return <RMWCAvatarGroup ref={ref} {...props}></RMWCAvatarGroup>;
});

export const AvatarCount: React.FC<AvatarCountProps & RMWCAvatarCountProps> = React.forwardRef<any, AvatarCountProps & RMWCAvatarCountProps>(
  (props, ref) => {
    return <RMWCAvatarCount ref={ref} {...props} />;
  }
);

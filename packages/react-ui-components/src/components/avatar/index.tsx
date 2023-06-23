/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { AvatarProps as RMWCAvatarProps, Avatar as RMWCAvatar} from '@rmwc/avatar';
import '@rmwc/avatar/styles'

export interface AvatarProps extends RMWCAvatarProps {};

export const Avatar: React.FC<AvatarProps> = React.forwardRef<any, AvatarProps>((props, ref) => {

return <RMWCAvatar ref={ref} {...props} />

});
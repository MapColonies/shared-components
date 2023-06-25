/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { IconProps as RMWCIconProps, Icon as RMWCIcon} from '@rmwc/icon';
import '@rmwc/icon/styles'

export interface IconProps extends React.ComponentProps<typeof RMWCIcon> {};

export const Icon: React.FC<IconProps> = React.forwardRef<any, IconProps>((props, ref) => {

return <RMWCIcon ref={ref} {...props} />

});


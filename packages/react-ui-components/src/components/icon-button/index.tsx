/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {IconButton as RMWCIconButton} from '@rmwc/icon-button';
import '@rmwc/icon-button/styles'

export interface IconButtonProps extends React.ComponentProps<typeof RMWCIconButton> {};

export const IconButton: React.FC<IconButtonProps> = React.forwardRef<any, IconButtonProps>((props, ref) => {

return <RMWCIconButton ref={ref} {...props} />

});
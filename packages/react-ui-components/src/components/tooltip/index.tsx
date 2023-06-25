import React from 'react';
import {Tooltip as RMWCTooltip } from '@rmwc/tooltip';
import '@rmwc/tooltip/styles'

export interface TooltipProps extends React.ComponentProps<typeof RMWCTooltip> {};

export const Tooltip: React.FC<TooltipProps> = props => {

return <RMWCTooltip {...props} />

};
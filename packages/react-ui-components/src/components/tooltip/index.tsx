import React from 'react';
import { TooltipProps as RMWCTooltipProps, Tooltip as RMWCTooltip } from '@rmwc/tooltip';
import '@rmwc/tooltip/styles';

export interface TooltipProps extends RMWCTooltipProps {}

export const Tooltip: React.FC<TooltipProps> = (props) => {
  return <RMWCTooltip {...props} />;
};

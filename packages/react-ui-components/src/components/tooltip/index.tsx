import React from 'react';
import { Tooltip as RMWCTooltip } from '@rmwc/tooltip';
import '@rmwc/tooltip/styles';
import { ExtractProps } from '../typeHelpers';

export interface TooltipProps extends ExtractProps<typeof RMWCTooltip> {}

export const Tooltip: React.FC<TooltipProps> = (props) => {
  return <RMWCTooltip {...props} />;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { TypographyProps as RMWCTypographyProps, Typography as RMWCTypography} from '@rmwc/typography';
import '@rmwc/typography/styles'

export interface TypographyProps extends RMWCTypographyProps {};

export const Typography: React.FC<TypographyProps> = React.forwardRef<any, TypographyProps>((props, ref) => {

return <RMWCTypography ref={ref} {...props} />

});
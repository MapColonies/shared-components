/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {Typography as RMWCTypography, TypographyProps as RMWCTypographyProps} from '@rmwc/typography';
import '@rmwc/typography/styles'

export interface TypographyProps extends React.ComponentProps<typeof RMWCTypography> {};

export const Typography: React.FC<TypographyProps & RMWCTypographyProps> = React.forwardRef<any, TypographyProps & RMWCTypographyProps>((props, ref) => {

return <RMWCTypography ref={ref} {...props} />

});
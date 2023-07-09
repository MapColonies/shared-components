/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef } from 'react';
import { Typography as RMWCTypography, TypographyProps as RMWCTypographyProps, TypographyHTMLProps, TypographyT } from '@rmwc/typography';

import { ExtractProps } from '../typeHelpers';

type TypographyPropsWithHtml = TypographyHTMLProps & RMWCTypographyProps;

interface CustomTypographyProps extends Omit<TypographyPropsWithHtml, 'tag' | 'use'> {
  use?: TypographyT;
  tag?: React.ElementType<any>;
}
export interface TypographyProps extends ExtractProps<typeof RMWCTypography> {}

export const Typography = forwardRef<any, TypographyProps & CustomTypographyProps>((props, ref) => {
  return <RMWCTypography ref={ref} {...props} tag={props.tag ?? 'span'} use={props.use ?? ''} />;
});

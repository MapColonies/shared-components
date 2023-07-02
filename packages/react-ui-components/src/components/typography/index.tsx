/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Typography as RMWCTypography, TypographyProps as RMWCTypographyProps, TypographyHTMLProps, TypographyT } from '@rmwc/typography';
import '@rmwc/typography/styles';

import { ExtractProps } from '../typeHelpers';

type TypographyPropsWithHtml = TypographyHTMLProps & RMWCTypographyProps;

interface CustomTypographyProps extends Omit<TypographyPropsWithHtml, 'tag' | 'use'> {
  use?: TypographyT;
  tag?: React.ElementType<any>;
}
export interface TypographyProps extends ExtractProps<typeof RMWCTypography> {}

export const Typography: React.FC<TypographyProps & CustomTypographyProps> = (props) => {
  return <RMWCTypography {...props} tag={props.tag ?? 'span'} use={props.use ?? 'body1'} />;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ThemeProps as RMWCThemeProps, Theme as RMWCTheme} from '@rmwc/theme';
import '@rmwc/theme/styles'

export interface ThemeProps extends RMWCThemeProps {};

export const Theme: React.FC<ThemeProps> = React.forwardRef<any, ThemeProps>((props, ref) => {

return <RMWCTheme ref={ref} {...props} />

});

//TODO: ADD CUSTOM THEME BRIDGING
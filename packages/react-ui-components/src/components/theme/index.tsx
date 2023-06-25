/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Theme as RMWCTheme, ThemeProps as RMWCThemeProps, ThemeProvider as RMWCThemeProvider, ThemeProviderProps as RMWCThemeProviderProps } from '@rmwc/theme';
import '@rmwc/theme/styles';

export interface ThemeProps extends React.ComponentProps<typeof RMWCTheme> {}
export interface ThemeProviderProps extends React.ComponentProps<typeof RMWCThemeProvider> {}

export * from './themes';
export * from './theme-options';

export const Theme: React.FC<ThemeProps & RMWCThemeProps> = React.forwardRef<any, ThemeProps & RMWCThemeProps>((props, ref) => {
  return <RMWCTheme ref={ref} {...props} />;
});

export const ThemeProvider: React.FC<ThemeProviderProps & RMWCThemeProviderProps> = React.forwardRef<any, ThemeProviderProps & RMWCThemeProviderProps>((props, ref) => {
  return <RMWCThemeProvider ref={ref} {...props} />;
});

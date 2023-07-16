/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Theme as RMWCTheme,
  ThemeProps as RMWCThemeProps,
  ThemeProvider as RMWCThemeProvider,
  ThemeProviderProps as RMWCThemeProviderProps,
} from '@rmwc/theme';
import { Themes } from './themes';
import { ExtractProps } from '../typeHelpers';

export interface ThemeProps extends ExtractProps<typeof RMWCTheme> {}
export interface ThemeProviderProps extends ExtractProps<typeof RMWCThemeProvider> {}

export * from './themes';
export * from './theme-options';
export interface IOptions {
  [key: string]: any; // string
  custom?: { [key: string]: any };
}

export const ThemeContext = React.createContext(Themes.darkTheme as IOptions);

export function useTheme(): IOptions {
  const theme = React.useContext(ThemeContext) as IOptions;

  // if (process.env.NODE_ENV !== 'production') {
  //   React.useDebugValue(theme);
  // }

  return theme;
}

export const Theme = React.forwardRef<any, ThemeProps & RMWCThemeProps>((props, ref) => {
  return <RMWCTheme ref={ref} {...props} />;
});

export const ThemeProvider = React.forwardRef<any, ThemeProviderProps & RMWCThemeProviderProps>((props, ref) => {
  return (
    <ThemeContext.Provider value={props.options}>
      <RMWCThemeProvider ref={ref} {...props} />
    </ThemeContext.Provider>
  );
}) as React.ForwardRefExoticComponent<ThemeProps & RMWCThemeProps>;

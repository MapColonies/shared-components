import React from 'react';
import { Theme, createTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const useMappedMuiTheme = (theme: { [key: string]: string }): Theme => {
  const prefersDarkMode = theme.type === 'dark';

  return React.useMemo(() => mapMcToMuiTheme(theme, prefersDarkMode), [prefersDarkMode, theme]);
};

const mapMcToMuiTheme = (mcTheme: { [key: string]: string }, prefersDarkMode = false): Theme => {
  return createTheme({
    palette: {
      type: prefersDarkMode ? 'dark' : 'light',
      primary: {
        main: mcTheme.primary,
      },
      secondary: {
        main: mcTheme.secondary,
      },
      error: {
        main: mcTheme.error,
      },
      background: {
        default: mcTheme.surface,
        paper: mcTheme.background,
      },
      text: {
        primary: prefersDarkMode ? mcTheme.textPrimaryOnDark : mcTheme.textPrimaryOnLight,
        secondary: prefersDarkMode ? mcTheme.textSecondaryOnDark : mcTheme.textSecondaryOnLight,
      },
    },
  });
};

const useMappedCesiumTheme = (theme: { [key: string]: string }): any => {
  return React.useMemo(() => {
    return {
      ...theme,
      'cesium-background-color': 'rgba(38, 38, 38, 0.75)',
      'cesium-color': '#EDFFFF',
      'cesium-service-error': theme['--mdc-theme-error'] ?? '#EC3713',
      'cesium-checkbox-color': '#1A73E8',
      'cesium-checkbox-width': '12px',
      'cesium-checkbox-height': '12px',
      'cesium-container-border-radius': '4px',
      'cesium-font-size': '10pt',
    };
  }, [theme]);
};

export { useMediaQuery, useMappedMuiTheme, mapMcToMuiTheme, useMappedCesiumTheme };
/* primary: '#24aee9',
secondary: '#e539ff',
error: '#b00020',
background: '#212121',
surface: '#37474F',
onPrimary: 'rgba(255,255,255,.87)',
onSecondary: 'rgba(0,0,0,0.87)',
onSurface: 'rgba(255,255,255,.87)',
onError: '#fff',
textPrimaryOnBackground: 'rgba(255, 255, 255, 1)',
textSecondaryOnBackground: 'rgba(255, 255, 255, 0.7)',
textHintOnBackground: 'rgba(255, 255, 255, 0.5)',
textDisabledOnBackground: 'rgba(255, 255, 255, 0.5)',
textIconOnBackground: 'rgba(255, 255, 255, 0.5)',
textPrimaryOnLight: 'rgba(0, 0, 0, 0.87)',
textSecondaryOnLight: 'rgba(0, 0, 0, 0.54)',
textHintOnLight: 'rgba(0, 0, 0, 0.38)',
textDisabledOnLight: 'rgba(0, 0, 0, 0.38)',
textIconOnLight: 'rgba(0, 0, 0, 0.38)',
textPrimaryOnDark: 'white',
textSecondaryOnDark: 'rgba(255, 255, 255, 0.7)',
textHintOnDark: 'rgba(255, 255, 255, 0.5)',
textDisabledOnDark: 'rgba(255, 255, 255, 0.5)',
textIconOnDark: 'rgba(255, 255, 255, 0.5)', */

/* --mdc-theme-primary: #3f51b5;
--mdc-theme-primary-light: #a4addf;
--mdc-theme-primary-dark: #6f7dcd;
--mdc-theme-secondary: #ff4081;
--mdc-theme-secondary-light: #ff87b0;
--mdc-theme-secondary-dark: #f80054;
--mdc-theme-background: #fff;
--mdc-theme-text-primary-on-primary: white;
--mdc-theme-text-secondary-on-primary: rgba(255, 255, 255, 0.7);
--mdc-theme-text-hint-on-primary: rgba(255, 255, 255, 0.5);
--mdc-theme-text-disabled-on-primary: rgba(255, 255, 255, 0.5);
--mdc-theme-text-icon-on-primary: rgba(255, 255, 255, 0.5);
--mdc-theme-text-primary-on-primary-light: rgba(0, 0, 0, 0.87);
--mdc-theme-text-secondary-on-primary-light: rgba(0, 0, 0, 0.54);
--mdc-theme-text-hint-on-primary-light: rgba(0, 0, 0, 0.38);
--mdc-theme-text-disabled-on-primary-light: rgba(0, 0, 0, 0.38);
--mdc-theme-text-icon-on-primary-light: rgba(0, 0, 0, 0.38);
--mdc-theme-text-primary-on-primary-dark: white;
--mdc-theme-text-secondary-on-primary-dark: rgba(255, 255, 255, 0.7);
--mdc-theme-text-hint-on-primary-dark: rgba(255, 255, 255, 0.5);
--mdc-theme-text-disabled-on-primary-dark: rgba(255, 255, 255, 0.5);
--mdc-theme-text-icon-on-primary-dark: rgba(255, 255, 255, 0.5);
--mdc-theme-text-primary-on-secondary: white;
--mdc-theme-text-secondary-on-secondary: rgba(255, 255, 255, 0.7);
--mdc-theme-text-hint-on-secondary: rgba(255, 255, 255, 0.5);
--mdc-theme-text-disabled-on-secondary: rgba(255, 255, 255, 0.5);
--mdc-theme-text-icon-on-secondary: rgba(255, 255, 255, 0.5);
--mdc-theme-text-primary-on-secondary-light: rgba(0, 0, 0, 0.87);
--mdc-theme-text-secondary-on-secondary-light: rgba(0, 0, 0, 0.54);
--mdc-theme-text-hint-on-secondary-light: rgba(0, 0, 0, 0.38);
--mdc-theme-text-disabled-on-secondary-light: rgba(0, 0, 0, 0.38);
--mdc-theme-text-icon-on-secondary-light: rgba(0, 0, 0, 0.38);
--mdc-theme-text-primary-on-secondary-dark: white;
--mdc-theme-text-secondary-on-secondary-dark: rgba(255, 255, 255, 0.7);
--mdc-theme-text-hint-on-secondary-dark: rgba(255, 255, 255, 0.5);
--mdc-theme-text-disabled-on-secondary-dark: rgba(255, 255, 255, 0.5);
--mdc-theme-text-icon-on-secondary-dark: rgba(255, 255, 255, 0.5);
--mdc-theme-text-primary-on-background: rgba(0, 0, 0, 0.87);
--mdc-theme-text-secondary-on-background: rgba(0, 0, 0, 0.54);
--mdc-theme-text-hint-on-background: rgba(0, 0, 0, 0.38);
--mdc-theme-text-disabled-on-background: rgba(0, 0, 0, 0.38);
--mdc-theme-text-icon-on-background: rgba(0, 0, 0, 0.38);
--mdc-theme-text-primary-on-light: rgba(0, 0, 0, 0.87);
--mdc-theme-text-secondary-on-light: rgba(0, 0, 0, 0.54);
--mdc-theme-text-hint-on-light: rgba(0, 0, 0, 0.38);
--mdc-theme-text-disabled-on-light: rgba(0, 0, 0, 0.38);
--mdc-theme-text-icon-on-light: rgba(0, 0, 0, 0.38);
--mdc-theme-text-primary-on-dark: white;
--mdc-theme-text-secondary-on-dark: rgba(255, 255, 255, 0.7);
--mdc-theme-text-hint-on-dark: rgba(255, 255, 255, 0.5);
--mdc-theme-text-disabled-on-dark: rgba(255, 255, 255, 0.5);
--mdc-theme-text-icon-on-dark: rgba(255, 255, 255, 0.5); */

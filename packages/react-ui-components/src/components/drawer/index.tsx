/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Drawer as RMWCDrawer,
  DrawerHeader as RMWCDrawerHeader,
  DrawerTitle as RMWCDrawerTitle,
  DrawerSubtitle as RMWCDrawerSubtitle,
  DrawerContent as RMWCDrawerContent,
} from '@rmwc/drawer';

import { ExtractProps } from '../typeHelpers';

export interface DrawerProps extends ExtractProps<typeof RMWCDrawer> {}
export interface DrawerHeaderProps extends ExtractProps<typeof RMWCDrawerHeader> {}
export interface DrawerTitleProps extends ExtractProps<typeof RMWCDrawerTitle> {}
export interface DrawerSubtitleProps extends ExtractProps<typeof RMWCDrawerSubtitle> {}
export interface DrawerContentProps extends ExtractProps<typeof RMWCDrawerContent> {}

export const Drawer = React.forwardRef<any, DrawerProps>((props, ref) => {
  return <RMWCDrawer ref={ref} {...props} />;
});

export const DrawerHeader = React.forwardRef<any, DrawerHeaderProps>((props, ref) => {
  return <RMWCDrawerHeader ref={ref} {...props} />;
});

export const DrawerTitle = React.forwardRef<any, DrawerTitleProps>((props, ref) => {
  return <RMWCDrawerTitle ref={ref} {...props} />;
});

export const DrawerSubtitle = React.forwardRef<any, DrawerSubtitleProps>((props, ref) => {
  return <RMWCDrawerSubtitle ref={ref} {...props} />;
});

export const DrawerContent = React.forwardRef<any, DrawerContentProps>((props, ref) => {
  return <RMWCDrawerContent ref={ref} {...props} />;
});

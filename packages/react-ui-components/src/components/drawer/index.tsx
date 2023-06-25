/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Drawer as RMWCDrawer,
  DrawerHeader as RMWCDrawerHeader,
  DrawerTitle as RMWCDrawerTitle,
  DrawerSubtitle as RMWCDrawerSubtitle,
  DrawerContent as RMWCDrawerContent
} from '@rmwc/drawer';
import '@rmwc/drawer/styles';

export interface DrawerProps extends React.ComponentProps<typeof RMWCDrawer> {}
export interface DrawerHeaderProps extends React.ComponentProps<typeof RMWCDrawerHeader> {}
export interface DrawerTitleProps extends React.ComponentProps<typeof RMWCDrawerTitle>{}
export interface DrawerSubtitleProps extends React.ComponentProps<typeof RMWCDrawerSubtitle> {}
export interface DrawerContentProps extends React.ComponentProps<typeof RMWCDrawerContent> {}

export const Drawer: React.FC<DrawerProps> = React.forwardRef<any, DrawerProps>((props, ref) => {
  return <RMWCDrawer ref={ref} {...props} />;
});

export const DrawerHeader: React.FC<DrawerHeaderProps> = React.forwardRef<any, DrawerHeaderProps>((props, ref) => {
  return <RMWCDrawerHeader ref={ref} {...props} />;
});

export const DrawerTitle: React.FC<DrawerTitleProps> = React.forwardRef<any, DrawerTitleProps>((props, ref) => {
  return <RMWCDrawerTitle ref={ref} {...props} />;
});

export const DrawerSubtitle: React.FC<DrawerSubtitleProps> = React.forwardRef<any, DrawerSubtitleProps>((props, ref) => {
  return <RMWCDrawerSubtitle ref={ref} {...props} />;
});

export const DrawerContent: React.FC<DrawerContentProps> = React.forwardRef<any, DrawerContentProps>((props, ref) => {
  return <RMWCDrawerContent ref={ref} {...props} />;
});

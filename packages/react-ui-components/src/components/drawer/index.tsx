/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  DrawerProps as RMWCDrawerProps,
  Drawer as RMWCDrawer,
  DrawerHeader as RMWCDrawerHeader,
  DrawerTitle as RMWCDrawerTitle,
  DrawerSubtitle as RMWCDrawerSubtitle,
  DrawerContent as RMWCDrawerContent,
  DrawerHeaderProps as RMWCDrawerHeaderProps,
  DrawerTitleProps as RMWCDrawerTitleProps,
  DrawerSubtitleProps as RMWCDrawerSubtitleProps,
  DrawerContentProps as RMWCDrawerContentProps,
} from '@rmwc/drawer';
import '@rmwc/drawer/styles';

export interface DrawerProps extends RMWCDrawerProps {}
export interface DrawerHeaderProps extends RMWCDrawerHeaderProps {}
export interface DrawerTitleProps extends RMWCDrawerTitleProps {}
export interface DrawerSubtitleProps extends RMWCDrawerSubtitleProps {}
export interface DrawerContentProps extends RMWCDrawerContentProps {}

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

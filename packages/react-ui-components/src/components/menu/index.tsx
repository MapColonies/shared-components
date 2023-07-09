/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef } from 'react';
import {
  Menu as RMWCMenu,
  MenuItem as RMWCMenuItem,
  MenuSurfaceAnchor as RMWCMenuSurfaceAnchor,
  MenuSurface as RMWCMenuSurface,
  MenuSurfaceProps as RMWCMenuSurfaceProps,
  MenuHTMLProps,
} from '@rmwc/menu';

import { ExtractProps } from '../typeHelpers';

export interface MenuProps extends ExtractProps<typeof RMWCMenu> {}
export interface MenuItemProps extends ExtractProps<typeof RMWCMenuItem> {}
export interface MenuSurfaceProps extends ExtractProps<typeof RMWCMenuSurface> {}
export interface MenuSurfaceAnchorProps extends ExtractProps<typeof RMWCMenuSurfaceAnchor> {}

export const Menu = forwardRef<any, MenuProps & MenuHTMLProps & RMWCMenuSurfaceProps>((props, ref) => {
  return <RMWCMenu ref={ref} {...props} />;
});

export const MenuItem= forwardRef<any, MenuItemProps & MenuHTMLProps>((props, ref) => {
  return <RMWCMenuItem ref={ref} {...props} />;
});

export const MenuSurface = forwardRef<any, MenuSurfaceProps & MenuHTMLProps>((props, ref) => {
  return <RMWCMenuSurface ref={ref} {...props} />;
});

export const MenuSurfaceAnchor = forwardRef<any, MenuSurfaceAnchorProps & MenuHTMLProps>((props, ref) => {
  return <RMWCMenuSurfaceAnchor ref={ref} {...props} />;
});

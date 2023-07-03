/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
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

export const Menu: React.FC<MenuProps & MenuHTMLProps & RMWCMenuSurfaceProps> = (props) => {
  return <RMWCMenu ref={props.ref} {...props} />;
};

export const MenuItem: React.FC<MenuItemProps & MenuHTMLProps> = (props) => {
  return <RMWCMenuItem ref={props.ref} {...props} />;
};

export const MenuSurface: React.FC<MenuSurfaceProps & MenuHTMLProps> = (props) => {
  return <RMWCMenuSurface ref={props.ref} {...props} />;
};

export const MenuSurfaceAnchor: React.FC<MenuSurfaceAnchorProps & MenuHTMLProps> = (props) => {
  return <RMWCMenuSurfaceAnchor ref={props.ref} {...props} />;
};

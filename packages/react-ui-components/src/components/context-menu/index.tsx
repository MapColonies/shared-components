/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Menu as ContexifyMenu,
  Item as ContexifyMenuItem,
  Separator as ContexifySeparator,
  Submenu as ContexifySubMenu,
  useContextMenu as ContexifyUseContextMenu,
  ItemProps,
  SeparatorProps,
  MenuProps as ContexifyMenuProps,
  SubMenuProps,
} from 'react-contexify';

export interface ContextMenuTheme {
  menuZIndex?: string;
  menuMinWidth?: string;

}

// Contexify has theme props ('light' or 'dark')
export interface ContextMenuProps extends Omit<ContexifyMenuProps, 'theme'> {
  theme?: ContextMenuTheme;
}

const contextifyThemeMap: Record<keyof ContextMenuTheme, string> = {
  menuMinWidth: '--contexify-menu-minWidth',
  menuZIndex: '--contexify-zIndex',
};

export const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  const {theme, ...contextifyProps} = props;
  const overriddenTheme: Record<string, unknown> = {};
  
  for(const [key, val] of Object.entries(theme ?? {})) {
    overriddenTheme[contextifyThemeMap[key as keyof ContextMenuTheme]] = val;
  }

  return (
    <div className="context-menu-container" style={overriddenTheme}>
      <ContexifyMenu {...contextifyProps} />
    </div>
  );
};

export const Item: React.FC<ItemProps> = (props) => {
  // Contexify defaults close on item click to true. we don't want it.
  return <ContexifyMenuItem closeOnClick={false} {...props} />;
};

export const Separator: React.FC<SeparatorProps> = (props) => {
  return <ContexifySeparator {...props} />;
};

export const Submenu: React.FC<SubMenuProps> = (props) => {
  return <ContexifySubMenu {...props} />;
};

export { RightSlot } from 'react-contexify';

export const useContextMenu = ContexifyUseContextMenu;

export type {
  BooleanPredicate,
  BuiltInOrString,
  ContextMenu as IContextMenu,
  HandlerParamsEvent,
  InternalProps,
  ItemParams,
  MenuAnimation,
  MenuId,
  PredicateParams,
  RightSlotProps,
} from 'react-contexify';

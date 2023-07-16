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
  MenuProps,
  SubMenuProps
} from 'react-contexify';

export const ContextMenu: React.FC<MenuProps> = (props) => {
  return <ContexifyMenu {...props} />;
};

export const Item: React.FC<ItemProps> = (props) => {
  return <ContexifyMenuItem {...props} />;
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

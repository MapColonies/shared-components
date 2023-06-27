/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  List as RMWCList,
  ListDivider as RMWCListDivider,
  ListItem as RMWCListItem,
  ListItemGraphic as RMWCListItemGraphic,
  ListItemText as RMWCListItemText,
  ListItemPrimaryText as RMWCListItemPrimaryText,
  ListItemSecondaryText as RMWCListItemSecondaryText,
  ListItemMeta as RMWCListItemMeta,
  CollapsibleList as RMWCCollapsibleList,
  CollapsibleListProps as RMWCCollapsibleListProps,
  SimpleListItem as RMWCSimpleListItem
} from '@rmwc/list';

import '@rmwc/list/styles';

export interface ListProps extends React.ComponentProps<typeof RMWCList> {}
export interface CollapsibleListProps extends React.ComponentProps<typeof RMWCCollapsibleList> {}
export interface ListDividerProps extends React.ComponentProps<typeof RMWCListDivider> {}
export interface ListItemProps extends React.ComponentProps<typeof RMWCListItem> {}
export interface SimpleListItemProps extends React.ComponentProps<typeof RMWCSimpleListItem> {}
export interface ListItemGraphicProps extends React.ComponentProps<typeof RMWCListItemGraphic> {}
export interface ListItemPrimaryTextProps extends React.ComponentProps<typeof RMWCListItemPrimaryText> {}
export interface ListItemTextProps extends React.ComponentProps<typeof RMWCListItemText> {}
export interface ListItemSecondaryTextProps extends React.ComponentProps<typeof RMWCListItemSecondaryText> {}
export interface ListItemMetaProps extends React.ComponentProps<typeof RMWCListItemMeta> {}

export const List: React.FC<ListProps> = React.forwardRef<any, ListProps>((props, ref) => {
  return <RMWCList ref={ref} {...props} />;
});

export const CollapsibleList: React.FC<ListProps & RMWCCollapsibleListProps> = React.forwardRef<any, ListProps & RMWCCollapsibleListProps>((props, ref) => {
  return <RMWCCollapsibleList ref={ref} {...props} />;
});

export const ListDivider: React.FC<ListDividerProps> = React.forwardRef<any, ListDividerProps>((props, ref) => {
  return <RMWCListDivider ref={ref} {...props} />;
});

export const ListItem: React.FC<ListItemProps> = React.forwardRef<any, ListItemProps>((props, ref) => {
  return <RMWCListItem ref={ref} {...props} />;
});

export const SimpleListItem: React.FC<SimpleListItemProps> = React.forwardRef<any, SimpleListItemProps>((props, ref) => {
  return <RMWCSimpleListItem ref={ref} {...props} />;
});

export const ListItemGraphic: React.FC<ListItemGraphicProps> = React.forwardRef<any, ListItemGraphicProps>((props, ref) => {
  return <RMWCListItemGraphic ref={ref} {...props} />;
});

export const ListItemText: React.FC<ListItemTextProps> = React.forwardRef<any, ListItemTextProps>((props, ref) => {
  return <RMWCListItemText ref={ref} {...props} />;
});

export const ListItemPrimaryText: React.FC<ListItemPrimaryTextProps> = React.forwardRef<any, ListItemPrimaryTextProps>((props, ref) => {
  return <RMWCListItemPrimaryText ref={ref} {...props} />;
});

export const ListItemSecondaryText: React.FC<ListItemSecondaryTextProps> = React.forwardRef<any, ListItemSecondaryTextProps>((props, ref) => {
  return <RMWCListItemSecondaryText ref={ref} {...props} />;
});

export const ListItemMeta: React.FC<ListItemMetaProps> = React.forwardRef<any, ListItemMetaProps>((props, ref) => {
  return <RMWCListItemMeta ref={ref} {...props} />;
});

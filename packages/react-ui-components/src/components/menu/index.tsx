/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
    MenuProps as RMWCMenuProps,
    Menu as RMWCMenu,
    MenuItemProps as RMWCMenuItemProps,
    MenuItem as RMWCMenuItem,
    MenuSurfaceAnchorProps as RMWCMenuSurfaceAnchorProps,
    MenuSurfaceAnchor as RMWCMenuSurfaceAnchor
} from "@rmwc/menu";
import "@rmwc/menu/styles";

export interface MenuProps extends React.ComponentProps<typeof RMWCMenu> {}
export interface MenuItemProps extends React.ComponentProps<typeof RMWCMenuItem> {}
export interface MenuSurfaceAnchorProps extends React.ComponentProps<typeof RMWCMenuSurfaceAnchor> {}

export const Menu: React.FC<MenuProps> = React.forwardRef<any, MenuProps>((props, ref) => {
    return <RMWCMenu ref={ref} {...props} />;
});

export const MenuItem: React.FC<MenuItemProps> = React.forwardRef<any, MenuItemProps>(
    (props, ref) => {
        return <RMWCMenuItem ref={ref} {...props} />;
    }
);

export const MenuSurfaceAnchor: React.FC<MenuSurfaceAnchorProps> = React.forwardRef<
    any,
    MenuSurfaceAnchorProps
>((props, ref) => {
    return <RMWCMenuSurfaceAnchor ref={ref} {...props} />;
});

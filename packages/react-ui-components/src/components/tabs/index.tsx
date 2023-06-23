/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { TabProps as RMWCTabProps, Tab as RMWCTab, TabBarProps as RMWCTabBarProps, TabBar as RMWCTabBar} from '@rmwc/tabs';
import "@rmwc/tabs/styles";

export interface TabProps extends RMWCTabProps {};
export interface TabBarProps extends RMWCTabBarProps {};

export const Tabs: React.FC<TabProps> = React.forwardRef<any, TabProps>((props, ref) => {

return <RMWCTab ref={ref} {...props} />

});

export const TabBar: React.FC<TabBarProps> = React.forwardRef<any, TabBarProps>((props, ref) => {

return <RMWCTabBar ref={ref} {...props} />

});
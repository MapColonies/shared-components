/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Tab as RMWCTab, TabBar as RMWCTabBar, TabBarOnActivateEventT as RMWCTabBarOnActivateEventT } from '@rmwc/tabs';

import { ExtractProps } from '../typeHelpers';

export interface TabProps extends ExtractProps<typeof RMWCTab> {}
export interface TabBarProps extends ExtractProps<typeof RMWCTabBar> {}

export type TabBarOnActivateEventT = RMWCTabBarOnActivateEventT;

export const Tab = React.forwardRef<any, TabProps>((props, ref) => {
  return <RMWCTab ref={ref} {...props} />;
}) as React.ForwardRefExoticComponent<TabProps>;

export const TabBar = React.forwardRef<any, TabBarProps>((props, ref) => {
  return <RMWCTabBar ref={ref} {...props} />;
}) as React.ForwardRefExoticComponent<TabBarProps>;

import React from 'react';
import { Icon, Drawer, DrawerHeader, DrawerTitle, DrawerContent } from '@map-colonies/react-core';
import { IMapLegend } from './legend-item';
import { LegendList } from './legend-list';

import './legend.css';

interface LegendSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  title?: string;
  noLegendsText?: string;
  actionsTexts?: { docText: string; imgText: string };
  legends?: IMapLegend[];
}

export const LegendSidebar: React.FC<LegendSidebarProps> = ({
  isOpen,
  toggleSidebar,
  title = 'Map Legends',
  noLegendsText = 'No legends to display...',
  actionsTexts = { docText: 'Docs', imgText: 'View Image' },
  legends = [],
}) => {
  return isOpen ? (
    <Drawer className="mapLegendSidebarContainer" modal={false} dismissible={true} open={isOpen}>
      <DrawerHeader className="sidebarHeaderContainer">
        <DrawerTitle className="sidebarTitle">{title}</DrawerTitle>
      </DrawerHeader>
      <DrawerContent className="sidebarContent">
        <Icon onClick={toggleSidebar} className="mapLegendCloseBtn" icon={{ icon: 'close', size: 'small' }} />
        <LegendList noLegendsText={noLegendsText} legends={legends} actionsTexts={actionsTexts} />
      </DrawerContent>
    </Drawer>
  ) : null;
};

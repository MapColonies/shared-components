import React, { useEffect } from 'react';
import { CesiumViewer, useCesiumMap } from '../map';
import { LegendMixin } from './legend-mixin';

export interface LegendToolProps {
  toggleSidebar: () => void;
  locale?: { [key: string]: string };
}

export const LegendTool: React.FC<LegendToolProps> = ({ toggleSidebar, locale }) => {
  const mapViewer: CesiumViewer = useCesiumMap();

  useEffect(() => {
    mapViewer?.extend(LegendMixin, {
      toggleSidebar: toggleSidebar,
      locale: locale,
    });
  }, [mapViewer]);

  return null;
};

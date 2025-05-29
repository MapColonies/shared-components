import React, { useEffect } from 'react';
import { CesiumViewer, useCesiumMap } from '../map';
import { LegendMixin } from './legend-mixin';

export interface LegendToolProps {
  onClick: () => void;
  locale?: { [key: string]: string };
}

export const LegendTool: React.FC<LegendToolProps> = ({ onClick, locale }) => {
  const mapViewer: CesiumViewer = useCesiumMap();

  useEffect(() => {
    mapViewer?.extend(LegendMixin, {
      onClick: onClick,
      locale: locale,
    });
  }, [mapViewer]);

  return null;
};

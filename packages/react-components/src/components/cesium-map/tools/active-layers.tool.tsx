import React, { useEffect } from 'react';
import { CesiumViewer, useCesiumMap } from '../map';
import { ActiveLayersMixin } from './active-layers-mixin';

export interface ActiveLayersToolProps {
  locale?: { [key: string]: string };
}

export const ActiveLayersTool: React.FC<ActiveLayersToolProps> = ({ locale }) => {
  const mapViewer: CesiumViewer = useCesiumMap();

  useEffect(() => {
    mapViewer?.extend(ActiveLayersMixin, {
      locale: locale,
    });
  }, [mapViewer]);

  return null;
};

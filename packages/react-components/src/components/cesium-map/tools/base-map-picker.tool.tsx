import React, { useEffect } from 'react';
import { TerrainProvider } from 'cesium';
import { CesiumViewer, useCesiumMap } from '../map';
import { IBaseMaps } from '../settings/settings';
import { BaseMapPickerMixin } from './base-map-picker-mixin';

export interface BaseMapPickerToolProps {
  baseMaps?: IBaseMaps;
  terrainProvider?: TerrainProvider;
  locale?: { [key: string]: string };
}

export const BaseMapPickerTool: React.FC<BaseMapPickerToolProps> = ({ baseMaps, terrainProvider, locale }) => {
  const mapViewer: CesiumViewer = useCesiumMap();

  useEffect(() => {
    mapViewer?.extend(BaseMapPickerMixin, {
      baseMaps: baseMaps,
      terrains: [ terrainProvider ],
      locale: locale,
    });
  }, [mapViewer]);

  return null;
};

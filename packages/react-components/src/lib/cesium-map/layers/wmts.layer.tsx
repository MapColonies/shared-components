import React from 'react';

import { WebMapTileServiceImageryProvider } from 'cesium';
import { CesiumImageryLayer, RCesiumImageryLayerProps } from './imagery.layer';

export interface RCesiumWMTSLayerOptions
  extends WebMapTileServiceImageryProvider.ConstructorOptions {}

export interface RCesiumWMTSLayerProps
  extends Partial<RCesiumImageryLayerProps> {
  options: RCesiumWMTSLayerOptions;
}

export const CesiumWMTSLayer: React.FC<RCesiumWMTSLayerProps> = (props) => {
  const { options, ...restProps } = props;
  return (
    <CesiumImageryLayer
      {...restProps}
      imageryProvider={new WebMapTileServiceImageryProvider(options)}
    />
  );
};

import React, { useMemo } from 'react';
import { WebMapTileServiceImageryProvider } from 'cesium';
import { CustomWebMapTileServiceImageryProvider } from '../helpers/customImageryProviders';
import { useCesiumMap, useCesiumMapViewstate } from '../map';
import { CesiumImageryLayer, RCesiumImageryLayerProps } from './imagery.layer';

export interface RCesiumWMTSLayerOptions extends WebMapTileServiceImageryProvider.ConstructorOptions {}

export interface RCesiumWMTSLayerProps extends Partial<RCesiumImageryLayerProps> {
  options: RCesiumWMTSLayerOptions;
}

export const CesiumWMTSLayer: React.FC<RCesiumWMTSLayerProps> = (props) => {
  const { options, ...restProps } = props;
  const mapViewer = useCesiumMap();
  const { viewState } = useCesiumMapViewstate();

  const providerInstance = useMemo(() => {
    return viewState.shouldOptimizedTileRequests
      ? new CustomWebMapTileServiceImageryProvider(options, mapViewer)
      : new WebMapTileServiceImageryProvider(options);
  }, [viewState.shouldOptimizedTileRequests]);

  return <CesiumImageryLayer {...restProps} imageryProvider={providerInstance} />;
};

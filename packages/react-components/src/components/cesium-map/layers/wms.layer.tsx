import React, { useMemo } from 'react';
import { WebMapServiceImageryProvider } from 'cesium';
import { CustomWebMapServiceImageryProvider } from '../helpers/customImageryProviders';
import { useCesiumMap, useCesiumMapViewstate } from '../map';
import { CesiumImageryLayer, RCesiumImageryLayerProps } from './imagery.layer';

export interface RCesiumWMSLayerOptions extends WebMapServiceImageryProvider.ConstructorOptions {}

export interface RCesiumWMSLayerProps extends Partial<RCesiumImageryLayerProps> {
  options: RCesiumWMSLayerOptions;
}

export const CesiumWMSLayer: React.FC<RCesiumWMSLayerProps> = (props) => {
  const { options, ...restProps } = props;
  const mapViewer = useCesiumMap();
  const { viewState } = useCesiumMapViewstate();

  const providerInstance = useMemo(() => {
    return viewState.shouldOptimizedTileRequests
      ? new CustomWebMapServiceImageryProvider(options, mapViewer)
      : new WebMapServiceImageryProvider(options);
  }, [viewState.shouldOptimizedTileRequests]);

  return <CesiumImageryLayer {...restProps} imageryProvider={providerInstance} />;
};

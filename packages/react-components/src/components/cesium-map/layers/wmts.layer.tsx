import React, { useMemo, useRef } from 'react';
import { WebMapTileServiceImageryProvider } from 'cesium';
import { CustomWebMapTileServiceImageryProvider } from '../helpers/customImageryProviders';
import { useCesiumMap, useCesiumMapViewstate } from '../map';
import { CesiumImageryLayer, RCesiumImageryLayerProps } from './imagery.layer';

export interface RCesiumWMTSLayerOptions extends WebMapTileServiceImageryProvider.ConstructorOptions {}

export interface RCesiumWMTSLayerProps extends Omit<RCesiumImageryLayerProps, 'imageryProvider'> {
  options: RCesiumWMTSLayerOptions;
}

export const CesiumWMTSLayer: React.FC<RCesiumWMTSLayerProps> = (props) => {
  const { options, ...restProps } = props;
  const mapViewer = useCesiumMap();
  const { viewState } = useCesiumMapViewstate();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const providerInstance = useMemo(() => {
    return viewState.shouldOptimizedTileRequests
      ? new CustomWebMapTileServiceImageryProvider(optionsRef.current, mapViewer)
      : new WebMapTileServiceImageryProvider(optionsRef.current);
  }, [viewState.shouldOptimizedTileRequests, mapViewer]);

  return <CesiumImageryLayer key={`wmts-${String(viewState.shouldOptimizedTileRequests)}`} {...restProps} imageryProvider={providerInstance} />;
};

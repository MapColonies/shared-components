import React, { useMemo, useRef } from 'react';
import { WebMapServiceImageryProvider } from 'cesium';
import { CustomWebMapServiceImageryProvider } from '../helpers/customImageryProviders';
import { useCesiumMap, useCesiumMapViewstate } from '../map';
import { CesiumImageryLayer, RCesiumImageryLayerProps } from './imagery.layer';

export interface RCesiumWMSLayerOptions extends WebMapServiceImageryProvider.ConstructorOptions {}

export interface RCesiumWMSLayerProps extends Omit<RCesiumImageryLayerProps, 'imageryProvider'> {
  options: RCesiumWMSLayerOptions;
}

export const CesiumWMSLayer: React.FC<RCesiumWMSLayerProps> = (props) => {
  const { options, ...restProps } = props;
  const mapViewer = useCesiumMap();
  const { viewState } = useCesiumMapViewstate();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const providerInstance = useMemo(() => {
    return viewState.shouldOptimizedTileRequests
      ? new CustomWebMapServiceImageryProvider(optionsRef.current, mapViewer)
      : new WebMapServiceImageryProvider(optionsRef.current);
  }, [viewState.shouldOptimizedTileRequests, mapViewer]);

  return <CesiumImageryLayer key={`wms-${String(viewState.shouldOptimizedTileRequests)}`} {...restProps} imageryProvider={providerInstance} />;
};

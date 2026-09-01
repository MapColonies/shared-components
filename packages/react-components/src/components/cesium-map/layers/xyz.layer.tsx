import React, { useMemo, useRef } from 'react';
import { UrlTemplateImageryProvider } from 'cesium';
import { CustomUrlTemplateImageryProvider } from '../helpers/customImageryProviders';
import { useCesiumMap, useCesiumMapViewstate } from '../map';
import { CesiumImageryLayer, RCesiumImageryLayerProps } from './imagery.layer';

export interface RCesiumXYZLayerOptions extends UrlTemplateImageryProvider.ConstructorOptions {}

export interface RCesiumXYZLayerProps extends Omit<RCesiumImageryLayerProps, 'imageryProvider'> {
  options: UrlTemplateImageryProvider.ConstructorOptions;
}

export const CesiumXYZLayer: React.FC<RCesiumXYZLayerProps> = (props) => {
  const { options, ...restProps } = props;
  const mapViewer = useCesiumMap();
  const { viewState } = useCesiumMapViewstate();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const providerInstance = useMemo(() => {
    return viewState.shouldOptimizedTileRequests
      ? new CustomUrlTemplateImageryProvider(optionsRef.current, mapViewer)
      : new UrlTemplateImageryProvider(optionsRef.current);
  }, [viewState.shouldOptimizedTileRequests, mapViewer]);

  return <CesiumImageryLayer key={`xyz-${String(viewState.shouldOptimizedTileRequests)}`} {...restProps} imageryProvider={providerInstance} />;
};

import React, { ComponentProps, useEffect } from 'react';
import { ImageryLayer } from 'cesium';
import { ImageryLayer as ResiumImageryLayer } from 'resium';
import { CesiumViewer, useCesiumMap } from '../map';

export interface RCesiumImageryLayerProps extends ComponentProps<typeof ResiumImageryLayer> {
  meta: {
    searchLayerPredicate: (layer: ImageryLayer, idx: number) => boolean;
    [key: string]: unknown;
  };
}

export const CesiumImageryLayer: React.FC<RCesiumImageryLayerProps> = (props) => {
  const { meta, ...restProps } = props;
  const mapViewer: CesiumViewer = useCesiumMap();
  const { imageryProvider } = restProps;

  useEffect(() => {
    const identifiesThisLayer = (layer: ImageryLayer): boolean => layer.imageryProvider === imageryProvider;
    mapViewer.layersManager?.addMetaToLayer(meta, identifiesThisLayer);
  }, [meta, mapViewer, imageryProvider]);

  return <ResiumImageryLayer {...restProps} />;
};

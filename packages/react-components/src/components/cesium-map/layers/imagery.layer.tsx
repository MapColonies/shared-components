import React, { ComponentProps, useLayoutEffect } from 'react';
import { ImageryLayer as ResiumImageryLayer } from 'resium';
import { CesiumViewer, useCesiumMap } from '../map';

export interface RCesiumImageryLayerProps extends ComponentProps<typeof ResiumImageryLayer> {
  meta?: any;
}

export const CesiumImageryLayer: React.FC<RCesiumImageryLayerProps> = (props) => {
  const { meta, ...restProps } = props;
  const mapViewer: CesiumViewer = useCesiumMap();

  useLayoutEffect(() => {
    mapViewer.layersManager?.addMetaToLayer(meta, meta.searchLayerPredicate);
  }, [meta, mapViewer]);

  return <ResiumImageryLayer {...restProps} />;
};

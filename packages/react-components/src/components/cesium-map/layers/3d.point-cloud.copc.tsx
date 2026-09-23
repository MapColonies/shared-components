import React, { useEffect, useRef } from 'react';
import { CopcCesiumLayer, CopcCesiumLayerOptions } from '@frillab/copc-adapter/cesium';
import { CesiumViewer, useCesiumMap } from '../map';

export interface ICesiumCopcPointCloud extends CopcCesiumLayerOptions {
  onReady?: (layer: CopcCesiumLayer) => void;
  onError?: (error: unknown) => void;
}

export const CesiumCopcPointCloud: React.FC<ICesiumCopcPointCloud> = ({ onReady, onError, ...options }) => {
  const mapViewer: CesiumViewer = useCesiumMap();
  const layerRef = useRef<CopcCesiumLayer | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    const layer = new CopcCesiumLayer(options);
    layerRef.current = layer;
    let isCancelled = false;

    void layer
      .load()
      .then(() => {
        if (isCancelled) {
          return;
        }
        layer.attachTo(mapViewer);
        onReadyRef.current?.(layer);
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          onErrorRef.current?.(error);
        }
      });

    return () => {
      isCancelled = true;
      layer.destroy();
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mapViewer,
    options.url,
    options.pointSize,
    options.colorMode,
    options.debug,
    options.maxRenderedPoints,
    options.backend,
    options.maxPointCacheBytes,
  ]);

  return null;
};

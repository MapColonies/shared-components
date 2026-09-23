import React, { useEffect, useRef } from 'react';
import { PointPrimitive, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import { CopcCesiumLayer, CopcCesiumLayerOptions, isCopcPointPickId } from '@frillab/copc-adapter/cesium';
import { CesiumViewer, useCesiumMap } from '../map';

export interface ICesiumCopcPointCloud extends CopcCesiumLayerOptions {
  onReady?: (layer: CopcCesiumLayer) => void;
  onError?: (error: unknown) => void;
  /** Pixel size applied to the point under the cursor. Defaults to twice its current size. */
  hoverPixelSize?: number;
}

export const CesiumCopcPointCloud: React.FC<ICesiumCopcPointCloud> = ({ onReady, onError, hoverPixelSize, ...options }) => {
  const mapViewer: CesiumViewer = useCesiumMap();
  const layerRef = useRef<CopcCesiumLayer | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const hoverPixelSizeRef = useRef(hoverPixelSize);
  hoverPixelSizeRef.current = hoverPixelSize;

  useEffect(() => {
    const layer = new CopcCesiumLayer(options);
    layerRef.current = layer;
    let isCancelled = false;
    let hoverHandler: ScreenSpaceEventHandler | undefined;
    let hoveredPrimitive: PointPrimitive | undefined;
    let hoveredOriginalPixelSize: number | undefined;

    const restoreHoveredPoint = (): void => {
      if (hoveredPrimitive !== undefined && hoveredOriginalPixelSize !== undefined) {
        try {
          hoveredPrimitive.pixelSize = hoveredOriginalPixelSize;
        } catch {
          // The point may have been recycled by the streaming renderer as it panned/zoomed away; nothing to restore.
        }
      }
      hoveredPrimitive = undefined;
      hoveredOriginalPixelSize = undefined;
    };

    void layer
      .load()
      .then(() => {
        if (isCancelled) {
          return;
        }
        layer.attachTo(mapViewer);
        onReadyRef.current?.(layer);

        hoverHandler = new ScreenSpaceEventHandler(mapViewer.scene.canvas);
        hoverHandler.setInputAction((movement: ScreenSpaceEventHandler.MotionEvent) => {
          const picked = mapViewer.scene.pick(movement.endPosition) as { id?: unknown; primitive?: PointPrimitive } | undefined;
          const primitive = picked?.primitive;

          if (primitive === hoveredPrimitive) {
            return;
          }
          restoreHoveredPoint();

          if (primitive === undefined || !isCopcPointPickId(picked?.id)) {
            return;
          }

          const originalPixelSize = primitive.pixelSize;
          try {
            primitive.pixelSize = hoverPixelSizeRef.current ?? originalPixelSize * 2;
          } catch {
            return;
          }
          hoveredPrimitive = primitive;
          hoveredOriginalPixelSize = originalPixelSize;
        }, ScreenSpaceEventType.MOUSE_MOVE);
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          onErrorRef.current?.(error);
        }
      });

    return () => {
      isCancelled = true;
      restoreHoveredPoint();
      hoverHandler?.destroy();
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

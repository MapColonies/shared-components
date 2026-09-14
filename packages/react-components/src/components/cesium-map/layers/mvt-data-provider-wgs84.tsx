import React, { useEffect, useRef } from 'react';
import { HeightReference, Rectangle, Resource } from 'cesium';
import { MVTDataProviderWGS84 as CesiumMVTDataProviderWGS84Class, type MVTDataProviderWGS84Shape } from '../helpers/mvt';
import { useCesiumMap } from '../map';

export type { MVTDataProviderWGS84Shape } from '../helpers/mvt';
export { MVTDataProviderWGS84 as MVTDataProviderWGS84Class } from '../helpers/mvt';

/**
 * `<CesiumMVTDataProviderWGS84>` is the EPSG:4326 (WGS84 TileMatrixSet) counterpart of resium's
 * `<MVTDataProvider>` (which only supports EPSG:3857 Web Mercator sources - see
 * `MVTDataProviderWGS84` in ../helpers/mvt for why). Like resium's component, this is not an
 * imagery layer: it attaches an `MVTDataProviderWGS84` to the viewer's `scene.primitives`, so it
 * should be used as a top-level child of `<CesiumMap>`, not nested inside an `<ImageryLayer>`.
 *
 * `url`/`minZoom`/`maxZoom`/`extent`/`featureIdProperty`/`heightReference` are fixed at creation
 * time (changing any of them destroys and recreates the underlying provider); `show` is reactive.
 */
export interface RCesiumMVTDataProviderWGS84Props {
  /** URL template containing {z}/{x}/{y} placeholders, pointing at an EPSG:4326 vector tile source. */
  url: string | Resource;
  /** Minimum zoom level represented in the generated tileset. */
  minZoom?: number;
  /** Maximum zoom level represented in the generated tileset. */
  maxZoom?: number;
  /** Optional geographic extent (radians) constraining the generated tile tree. */
  extent?: Rectangle;
  /** MVT property name to use as feature ID. */
  featureIdProperty?: string;
  /** Drapes the decoded points, lines and polygons onto terrain and/or 3D Tiles. */
  heightReference?: HeightReference;
  /** Determines if the generated tileset is shown. Defaults to true. */
  show?: boolean;
  /** Fires once the provider is created and added to the scene's primitive collection. */
  onReady?: (provider: MVTDataProviderWGS84Shape) => void;
  /** Fires if creating the provider fails. */
  onError?: (error: unknown) => void;
}

export const CesiumMVTDataProviderWGS84: React.FC<RCesiumMVTDataProviderWGS84Props> = (props) => {
  const { url, minZoom, maxZoom, extent, featureIdProperty, heightReference, show = true, onReady, onError } = props;
  const mapViewer = useCesiumMap();
  const providerRef = useRef<MVTDataProviderWGS84Shape>();
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    const scene = mapViewer.scene;
    // Cesium throws if a clamping heightReference is given without a scene, so only forward it
    // (and the scene it requires) when draping was actually requested.
    const draping = heightReference !== undefined ? { heightReference, scene } : undefined;

    void CesiumMVTDataProviderWGS84Class.fromUrl(url, {
      minZoom,
      maxZoom,
      extent,
      featureIdProperty,
      ...draping,
    })
      .then((provider) => {
        const typedProvider = provider as unknown as MVTDataProviderWGS84Shape;
        if (cancelled) {
          typedProvider.destroy();
          return;
        }
        typedProvider.show = show;
        scene.primitives.add(typedProvider);
        providerRef.current = typedProvider;
        onReadyRef.current?.(typedProvider);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          onErrorRef.current?.(error);
        }
      });

    return () => {
      cancelled = true;
      const provider = providerRef.current;
      if (provider !== undefined) {
        if (!scene.primitives.isDestroyed()) {
          scene.primitives.remove(provider);
        }
        if (!provider.isDestroyed()) {
          provider.destroy();
        }
        providerRef.current = undefined;
      }
    };
    // url/minZoom/maxZoom/extent/featureIdProperty/heightReference are fixed at creation time,
    // matching Cesium's own MVTDataProvider (and resium's wrapper around it).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, minZoom, maxZoom, extent, featureIdProperty, heightReference, mapViewer]);

  useEffect(() => {
    if (providerRef.current !== undefined) {
      providerRef.current.show = show;
    }
  }, [show]);

  return null;
};

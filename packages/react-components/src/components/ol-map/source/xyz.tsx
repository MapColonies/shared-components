import React, { useEffect } from 'react';
import OlXYZ, { Options } from 'ol/source/XYZ';
import type TileGrid from 'ol/tilegrid/TileGrid';
import { useTileLayer } from '../layers/tile-layer';

interface TileXYZProps {
  options: Options;
}

export interface XYZOptionParams {
  attributions?: string;
  url: string;
  projection?: string;
  minZoom?: number;
  maxZoom?: number;
  tileSize?: number | [number, number];
  opaque?: boolean;
  tileGrid?: TileGrid;
}

export const getXYZOptions = (optionParams: XYZOptionParams): Options => {
  const { attributions, url, projection, minZoom, maxZoom, tileSize, opaque, tileGrid } = optionParams;

  const xyzOptions = {
    attributions,
    url,
    ...(projection !== undefined && { projection }),
    ...(minZoom !== undefined && { minZoom }),
    ...(maxZoom !== undefined && { maxZoom }),
    ...(tileSize !== undefined && { tileSize }),
    ...(opaque !== undefined && { opaque }),
    ...(tileGrid !== undefined && { tileGrid }),
  };

  return xyzOptions;
};
export const TileXYZ: React.FC<TileXYZProps> = (props) => {
  const tileLayer = useTileLayer();
  const { options } = props;

  useEffect(() => {
    tileLayer.setSource(new OlXYZ(options));
  }, [tileLayer, options]);

  return null;
};

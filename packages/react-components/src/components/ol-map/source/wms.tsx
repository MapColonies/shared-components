import React, { useEffect } from 'react';
import OlTileWMS, { Options } from 'ol/source/TileWMS';
import type TileGrid from 'ol/tilegrid/TileGrid';
import { useTileLayer } from '../layers/tile-layer';

interface TileWMSProps {
  options: Options;
}

export interface WMSOptionParams {
  attributions?: string;
  url: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  params: { [key: string]: any };
  serverType?: 'carmentaserver' | 'geoserver' | 'mapserver' | 'qgis';
  transition?: number;
  projection?: string;
  tileGrid?: TileGrid;
}

export const getWMSOptions = (optionParams: WMSOptionParams): Options => {
  const { attributions, url, params, serverType, transition, projection, tileGrid } = optionParams;

  const wmsOptions: Options = {
    attributions,
    url,
    params,
    ...(serverType !== undefined && { serverType }),
    ...(transition !== undefined && { transition }),
    ...(projection !== undefined && { projection }),
    ...(tileGrid !== undefined && { tileGrid }),
  };

  return wmsOptions;
};
export const TileWMS: React.FC<TileWMSProps> = (props) => {
  const tileLayer = useTileLayer();
  const { options } = props;

  useEffect(() => {
    tileLayer.setSource(new OlTileWMS(options));
  }, [tileLayer, options]);

  return null;
};

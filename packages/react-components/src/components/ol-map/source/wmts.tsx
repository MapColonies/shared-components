import React, { useEffect } from 'react';
import { WMTS } from 'ol/source';
import { Options, RequestEncoding } from 'ol/source/WMTS';
import WMTSRequestEncoding from 'ol/source/WMTSRequestEncoding';
import { Projection, get as getProjection } from 'ol/proj';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { Extent, getTopLeft, getWidth } from 'ol/extent';
import { useTileLayer } from '../layers/tile-layer';

const RESOLUTIONS = 20,
  TILE_GRANULARITY = 256,
  WMTS_RESOLUTION_BASIS = 2,
  LAYER_HEIGHT_WIDHT_RATIO = 2,
  REQUEST_ENCODING = 'REST';

interface TileWMTSProps {
  options: Options;
}

export interface WMTSOptionParams {
  attributions?: string;
  url: string;
  layer: string;
  projection: string;
  format: string;
  style: string;
  matrixSet: string;
  wrapX?: boolean;
  heightWidthRatio?: number;
  requestEncoding?: WMTSRequestEncoding | string;
  /** TileMatrix identifier per level; the number of levels is its length. Defaults to `0..RESOLUTIONS-1`. */
  matrixIds?: string[];
  /** Defaults to 256x256. */
  tileSize?: number | [number, number];
  dimensions?: Record<string, string>;
  /** Tiles outside of it are not requested. In the projection of the source. */
  extent?: Extent;
}

export const getWMTSOptions = (params: WMTSOptionParams): Options => {
  const projection = getProjection(params.projection) as Projection;
  const projectionExtent = projection.getExtent();
  const levels = params.matrixIds?.length ?? RESOLUTIONS;
  const resolutions = new Array<number>(levels);
  const matrixIds = new Array<string>(levels);
  const tileWidth = (Array.isArray(params.tileSize) ? params.tileSize[0] : params.tileSize) ?? TILE_GRANULARITY;
  const size = getWidth(projectionExtent) / tileWidth;
  const heightWidthRatio = params.heightWidthRatio !== undefined ? params.heightWidthRatio : LAYER_HEIGHT_WIDHT_RATIO;
  const requestEncoding = params.requestEncoding !== undefined ? params.requestEncoding : REQUEST_ENCODING;
  for (let z = 0; z < levels; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutions[z] = size / Math.pow(WMTS_RESOLUTION_BASIS, z) / heightWidthRatio;
    matrixIds[z] = params.matrixIds?.[z] ?? z.toString();
  }

  const wmtsOptions = {
    attributions: params.attributions,
    url: params.url,
    layer: params.layer,
    matrixSet: params.matrixSet,
    format: params.format,
    projection: projection,
    tileGrid: new WMTSTileGrid({
      origin: getTopLeft(projectionExtent),
      resolutions: resolutions,
      matrixIds: matrixIds,
      ...(params.tileSize !== undefined && { tileSize: params.tileSize }),
      ...(params.extent !== undefined && { extent: params.extent }),
    }),
    style: params.style,
    requestEncoding: requestEncoding as RequestEncoding,
    wrapX: params.wrapX !== undefined ? params.wrapX : true,
    ...(params.dimensions !== undefined && { dimensions: params.dimensions }),
  };

  return wmtsOptions;
};
export const TileWMTS: React.FC<TileWMTSProps> = (props) => {
  const tileLayer = useTileLayer();
  const { options } = props;

  useEffect(() => {
    tileLayer.setSource(new WMTS(options));
  }, [tileLayer, options]);

  return null;
};

import type { WebMapTileServiceImageryProvider } from 'cesium';
import { WmtsOptionsSchema } from '../schemas/wmts';
import type { WmtsOptions } from '../schemas/wmts';
import { InjectedAuth, resolveConstructorOptions, toRectangle, toResource, toTilingScheme } from './common';

/** Converts validated, JSON-safe options (+ injected auth) into real Cesium constructor options. */
export const toWmtsConstructorOptions = (options: WmtsOptions, auth?: InjectedAuth): WebMapTileServiceImageryProvider.ConstructorOptions => {
  const { url, getFeatureInfoUrl, rectangle, tilingScheme, ...rest } = options;
  return {
    ...rest,
    url: toResource(url, auth),
    ...(getFeatureInfoUrl !== undefined && { getFeatureInfoUrl: toResource(getFeatureInfoUrl, auth) }),
    ...(rectangle && { rectangle: toRectangle(rectangle) }),
    ...(tilingScheme && { tilingScheme: toTilingScheme(tilingScheme) }),
  };
};

/** JSON-safe options are hydrated, Cesium-native ones pass through untouched (see `resolveConstructorOptions`). */
export const resolveWmtsConstructorOptions = (options: unknown, auth?: InjectedAuth): WebMapTileServiceImageryProvider.ConstructorOptions =>
  resolveConstructorOptions(WmtsOptionsSchema, toWmtsConstructorOptions, options, auth);

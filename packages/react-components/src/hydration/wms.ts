import type { WebMapServiceImageryProvider } from 'cesium';
import { WmsOptionsSchema } from '../schemas/wms';
import type { WmsOptions } from '../schemas/wms';
import { InjectedAuth, resolveConstructorOptions, toRectangle, toResource, toTilingScheme } from './common';

/** Converts validated, JSON-safe options (+ injected auth) into real Cesium constructor options. */
export const toWmsConstructorOptions = (options: WmsOptions, auth?: InjectedAuth): WebMapServiceImageryProvider.ConstructorOptions => {
  const { url, getFeatureInfoUrl, rectangle, tilingScheme, parameters, ...rest } = options;
  return {
    ...rest,
    url: toResource(url, auth),
    // WMS query parameters are strings on the wire
    ...(parameters && { parameters: Object.fromEntries(Object.entries(parameters).map(([key, value]) => [key, String(value)])) }),
    ...(getFeatureInfoUrl !== undefined && { getFeatureInfoUrl: toResource(getFeatureInfoUrl, auth) }),
    ...(rectangle && { rectangle: toRectangle(rectangle) }),
    ...(tilingScheme && { tilingScheme: toTilingScheme(tilingScheme) }),
  };
};

/** JSON-safe options are hydrated, Cesium-native ones pass through untouched (see `resolveConstructorOptions`). */
export const resolveWmsConstructorOptions = (options: unknown, auth?: InjectedAuth): WebMapServiceImageryProvider.ConstructorOptions =>
  resolveConstructorOptions(WmsOptionsSchema, toWmsConstructorOptions, options, auth);

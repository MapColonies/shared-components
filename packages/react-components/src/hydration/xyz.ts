import type { UrlTemplateImageryProvider } from 'cesium';
import { XyzOptionsSchema } from '../schemas/xyz';
import type { XyzOptions } from '../schemas/xyz';
import { InjectedAuth, resolveConstructorOptions, toRectangle, toResource, toTilingScheme } from './common';

/** Converts validated, JSON-safe options (+ injected auth) into real Cesium constructor options. */
export const toXyzConstructorOptions = (options: XyzOptions, auth?: InjectedAuth): UrlTemplateImageryProvider.ConstructorOptions => {
  const { url, pickFeaturesUrl, rectangle, tilingScheme, ...rest } = options;
  return {
    ...rest,
    url: toResource(url, auth),
    ...(pickFeaturesUrl !== undefined && { pickFeaturesUrl: toResource(pickFeaturesUrl, auth) }),
    ...(rectangle && { rectangle: toRectangle(rectangle) }),
    ...(tilingScheme && { tilingScheme: toTilingScheme(tilingScheme) }),
  };
};

/** JSON-safe options are hydrated, Cesium-native ones pass through untouched (see `resolveConstructorOptions`). */
export const resolveXyzConstructorOptions = (options: unknown, auth?: InjectedAuth): UrlTemplateImageryProvider.ConstructorOptions =>
  resolveConstructorOptions(XyzOptionsSchema, toXyzConstructorOptions, options, auth);

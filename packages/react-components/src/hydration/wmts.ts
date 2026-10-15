import { Rectangle, Resource, GeographicTilingScheme, WebMercatorTilingScheme } from 'cesium';
import type { WebMapTileServiceImageryProvider } from 'cesium';
import type { WmtsOptions } from '../schemas/wmts';

/** Runtime secrets, never stored in options. */
export interface InjectedAuth {
  headers?: Record<string, string>;
  queryParameters?: Record<string, string>;
}

const toResource = (url: string, auth?: InjectedAuth): Resource =>
  new Resource({ url, headers: auth?.headers, queryParameters: auth?.queryParameters });

/** Converts validated, JSON-safe options (+ injected auth) into real Cesium constructor options. */
export const toWmtsConstructorOptions = (options: WmtsOptions, auth?: InjectedAuth): WebMapTileServiceImageryProvider.ConstructorOptions => {
  const { url, getFeatureInfoUrl, rectangle, tilingScheme, ...rest } = options;
  return {
    ...rest,
    url: toResource(url, auth),
    ...(getFeatureInfoUrl !== undefined && { getFeatureInfoUrl: toResource(getFeatureInfoUrl, auth) }),
    ...(rectangle && { rectangle: Rectangle.fromDegrees(rectangle.west, rectangle.south, rectangle.east, rectangle.north) }),
    ...(tilingScheme && { tilingScheme: tilingScheme === 'geographic' ? new GeographicTilingScheme() : new WebMercatorTilingScheme() }),
  };
};

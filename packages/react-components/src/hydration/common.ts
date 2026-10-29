import { Rectangle, Resource, GeographicTilingScheme, WebMercatorTilingScheme } from 'cesium';
import type { TilingScheme } from 'cesium';
import type { ZodType } from 'zod';

/** Runtime secrets, never stored in options. */
export interface InjectedAuth {
  headers?: Record<string, string>;
  queryParameters?: Record<string, string>;
}

/** The JSON-safe form of a geographic extent: degrees. */
export interface RectangleDeg {
  west: number;
  south: number;
  east: number;
  north: number;
}

export const toResource = (url: string, auth?: InjectedAuth): Resource =>
  new Resource({ url, headers: auth?.headers, queryParameters: auth?.queryParameters });

export const toRectangle = ({ west, south, east, north }: RectangleDeg): Rectangle => Rectangle.fromDegrees(west, south, east, north);

export const toTilingScheme = (name: 'geographic' | 'webmercator'): TilingScheme =>
  name === 'geographic' ? new GeographicTilingScheme() : new WebMercatorTilingScheme();

/**
 * For code that receives options in either form: JSON-safe options (as stored in a catalog link) are validated against
 * `schema` and hydrated; Cesium-native options (Resource / Rectangle / TilingScheme instances, URLs carrying credentials,
 * Cesium-only keys) are returned untouched, so existing callers keep their behavior.
 */
export const resolveConstructorOptions = <TJson, TNative>(
  schema: ZodType<TJson, any, unknown>,
  hydrate: (options: TJson, auth?: InjectedAuth) => TNative,
  options: unknown,
  auth?: InjectedAuth
): TNative => {
  // A Cesium Rectangle (radians) has the same shape as the JSON one (degrees), so it must be excluded explicitly.
  if ((options as { rectangle?: unknown } | null | undefined)?.rectangle instanceof Rectangle) {
    return options as TNative;
  }
  const parsed = schema.safeParse(options);
  return parsed.success ? hydrate(parsed.data, auth) : (options as TNative);
};

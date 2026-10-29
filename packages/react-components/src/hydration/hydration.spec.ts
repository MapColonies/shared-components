/**
 * @jest-environment node
 */
import {
  GeographicTilingScheme,
  Rectangle,
  Resource,
  WebMapServiceImageryProvider,
  WebMapTileServiceImageryProvider,
  UrlTemplateImageryProvider,
  WebMercatorTilingScheme,
} from 'cesium';
import { WmsOptionsSchema } from '../schemas/wms';
import { WmtsOptionsSchema } from '../schemas/wmts';
import { XyzOptionsSchema } from '../schemas/xyz';
import {
  resolveWmsConstructorOptions,
  resolveWmtsConstructorOptions,
  resolveXyzConstructorOptions,
  toWmsConstructorOptions,
  toWmtsConstructorOptions,
  toXyzConstructorOptions,
} from '.';

const rect = { west: 34, south: 29, east: 36, north: 34 };
const auth = { headers: { Authorization: 'Bearer t' }, queryParameters: { token: 'abc' } };

describe('hydration', () => {
  it('WMTS: builds a Resource with injected auth, a radians Rectangle and a tiling scheme', () => {
    const options = WmtsOptionsSchema.parse({
      url: 'https://example.com/wmts?',
      layer: 'l',
      style: 's',
      tileMatrixSetID: 't',
      rectangle: rect,
      tilingScheme: 'geographic',
    });
    const result = toWmtsConstructorOptions(options, auth);
    expect(result.url).toBeInstanceOf(Resource);
    expect((result.url as Resource).headers).toEqual(auth.headers);
    expect((result.url as Resource).queryParameters).toEqual(auth.queryParameters);
    expect(result.rectangle).toEqual(Rectangle.fromDegrees(34, 29, 36, 34));
    expect(result.tilingScheme).toBeInstanceOf(GeographicTilingScheme);
    expect(result.layer).toBe('l');
    expect(() => new WebMapTileServiceImageryProvider(result)).not.toThrow();
  });

  it('WMS: stringifies GetMap parameters and converts rectangle / tiling scheme / feature info url', () => {
    const options = WmsOptionsSchema.parse({
      url: 'https://example.com/wms?',
      layers: 'a,b',
      parameters: { format: 'image/png', transparent: true, version: 1.3 },
      getFeatureInfoUrl: 'https://example.com/fi',
      rectangle: rect,
      tilingScheme: 'webmercator',
    });
    const result = toWmsConstructorOptions(options, auth);
    expect(result.parameters).toEqual({ format: 'image/png', transparent: 'true', version: '1.3' });
    expect(result.getFeatureInfoUrl).toBeInstanceOf(Resource);
    expect(result.tilingScheme).toBeInstanceOf(WebMercatorTilingScheme);
    expect(result.rectangle).toEqual(Rectangle.fromDegrees(34, 29, 36, 34));
    expect(() => new WebMapServiceImageryProvider(result)).not.toThrow();
  });

  it('XYZ: converts url and pickFeaturesUrl and keeps the plain options', () => {
    const options = XyzOptionsSchema.parse({
      url: 'https://example.com/{z}/{x}/{y}.png',
      pickFeaturesUrl: 'https://example.com/pick/{z}/{x}/{y}',
      maximumLevel: 12,
      hasAlphaChannel: false,
    });
    const result = toXyzConstructorOptions(options, auth);
    expect(result.url).toBeInstanceOf(Resource);
    expect(result.pickFeaturesUrl).toBeInstanceOf(Resource);
    expect(result.maximumLevel).toBe(12);
    expect(result.hasAlphaChannel).toBe(false);
    expect(result.rectangle).toBeUndefined();
    expect(() => new UrlTemplateImageryProvider(result)).not.toThrow();
  });
});

describe.each([
  ['WMTS', resolveWmtsConstructorOptions, { url: 'https://example.com/wmts?', layer: 'l', style: 's', tileMatrixSetID: 't' }],
  ['WMS', resolveWmsConstructorOptions, { url: 'https://example.com/wms?', layers: 'a,b' }],
  ['XYZ', resolveXyzConstructorOptions, { url: 'https://example.com/{z}/{x}/{y}.png' }],
] as const)('resolve%sConstructorOptions (used by layers-manager)', (_name, resolve, json) => {
  it('hydrates JSON-safe options', () => {
    const result = resolve({ ...json, rectangle: rect, tilingScheme: 'geographic' });
    expect(result.url).toBeInstanceOf(Resource);
    expect(result.rectangle).toEqual(Rectangle.fromDegrees(34, 29, 36, 34));
    expect(result.tilingScheme).toBeInstanceOf(GeographicTilingScheme);
  });

  it('returns Cesium-native options untouched, including a radians Rectangle', () => {
    const native = { ...json, rectangle: Rectangle.fromDegrees(34, 29, 36, 34), tilingScheme: new GeographicTilingScheme() };
    expect(resolve(native)).toBe(native);
    const withResource = { ...json, url: new Resource({ url: json.url }) };
    expect(resolve(withResource)).toBe(withResource);
  });

  it('returns options untouched when the schema would reject them (token in url, Cesium-only keys), keeping existing behavior', () => {
    const withToken = { ...json, url: 'https://example.com/x?token=abc' };
    expect(resolve(withToken)).toBe(withToken);
    const withExtra = { ...json, someCesiumOnlyOption: 1 };
    expect(resolve(withExtra)).toBe(withExtra);
  });

  it('does not throw on nullish input', () => {
    expect(() => resolve(undefined)).not.toThrow();
  });
});

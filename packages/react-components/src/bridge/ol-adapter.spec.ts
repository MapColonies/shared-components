import { Proj } from '../components/utils/projections';
import { adaptToOlOptions } from './ol-adapter';

const wmts = { url: 'https://example.com/wmts', layer: 'l', style: 's', tileMatrixSetID: 'newGrids' };
const xyz = { url: 'https://example.com/{z}/{x}/{y}.png' };

describe('adaptToOlOptions', () => {
  it('maps XYZ and falls back to a {a-c} range without subdomains', () => {
    expect(adaptToOlOptions('XYZ', { url: 'https://{s}.example.com/{z}/{x}/{y}.png' })).toMatchObject({
      url: 'https://{a-c}.example.com/{z}/{x}/{y}.png',
    });
  });

  it('expands explicit subdomains into urls', () => {
    const options = adaptToOlOptions('XYZ', { url: 'https://{s}.example.com/{z}/{x}/{y}.png', subdomains: ['a', 'b'] });
    expect(options).toMatchObject({ urls: ['https://a.example.com/{z}/{x}/{y}.png', 'https://b.example.com/{z}/{x}/{y}.png'] });
  });

  it('maps WMTS', () => {
    expect(adaptToOlOptions('WMTS', { ...wmts, format: 'image/png' })).toMatchObject({
      url: 'https://example.com/wmts',
      layer: 'l',
      style: 's',
      format: 'image/png',
      matrixSet: 'newGrids',
    });
  });

  it('bridges tilingScheme to projection', () => {
    // XYZ keeps the projection code, WMTS resolves it into a `Projection`
    const projectionOf = (options: unknown): string => {
      const { projection } = options as { projection: string | { getCode: () => string } };
      return typeof projection === 'string' ? projection : projection.getCode();
    };

    expect(projectionOf(adaptToOlOptions('WMTS', { ...wmts, tilingScheme: 'geographic' }))).toBe(Proj.WGS84);
    expect(projectionOf(adaptToOlOptions('WMTS', { ...wmts, tilingScheme: 'webmercator' }))).toBe(Proj.WEB_MERCATOR);
    expect(projectionOf(adaptToOlOptions('WMTS', wmts))).toBe(Proj.WEB_MERCATOR);
    expect(projectionOf(adaptToOlOptions('XYZ', { ...xyz, tilingScheme: 'geographic' }))).toBe(Proj.WGS84);
    expect(adaptToOlOptions('XYZ', xyz)).not.toHaveProperty('projection');
  });

  it('bridges the other differently named options', () => {
    expect(adaptToOlOptions('XYZ', { ...xyz, credit: 'c', minimumLevel: 2, maximumLevel: 9, tileWidth: 512, tileHeight: 512 })).toMatchObject({
      attributions: 'c',
      minZoom: 2,
      maxZoom: 9,
      tileSize: [512, 512],
    });

    const options = adaptToOlOptions('WMTS', {
      ...wmts,
      tilingScheme: 'geographic',
      tileMatrixLabels: ['a', 'b', 'c'],
      dimensions: { time: '2020' },
    });
    expect(options).toMatchObject({ dimensions: { time: '2020' } });
    expect((options as { tileGrid: { getMatrixIds: () => string[] } }).tileGrid.getMatrixIds()).toEqual(['a', 'b', 'c']);
  });

  it('applies the schema defaults', () => {
    expect(adaptToOlOptions('WMTS', wmts)).toMatchObject({ format: 'image/jpeg' });
  });

  it('throws on invalid options', () => {
    expect(() => adaptToOlOptions('XYZ', { ...xyz, unknownKey: 1 } as never)).toThrow();
    expect(() => adaptToOlOptions('WMTS', { url: 'https://example.com/wmts' } as never)).toThrow();
  });

  it('bridges hasAlphaChannel to opaque', () => {
    expect(adaptToOlOptions('XYZ', { ...xyz, hasAlphaChannel: true })).toMatchObject({ opaque: false });
    expect(adaptToOlOptions('XYZ', { ...xyz, hasAlphaChannel: false })).toMatchObject({ opaque: true });
    expect(adaptToOlOptions('XYZ', xyz)).not.toHaveProperty('opaque');
  });

  it('bridges the rectangle (degrees) to the tile grid extent of the projection', () => {
    const rectangle = { west: 30, south: 30, east: 40, north: 40 };
    const extentOf = (options: unknown): number[] => (options as { tileGrid: { getExtent: () => number[] } }).tileGrid.getExtent();

    const geographic = extentOf(adaptToOlOptions('WMTS', { ...wmts, tilingScheme: 'geographic', rectangle }));
    expect(geographic.map(Math.round)).toEqual([30, 30, 40, 40]);

    const mercator = extentOf(adaptToOlOptions('XYZ', { ...xyz, rectangle }));
    expect(mercator[0]).toBeCloseTo(3339584, -1);

    expect(adaptToOlOptions('XYZ', xyz)).not.toHaveProperty('tileGrid');
  });

  describe('WMS', () => {
    const wms = { url: 'https://example.com/wms', layers: 'l1,l2' };

    it('maps the layers and the parameters (upper-cased) to params', () => {
      expect(adaptToOlOptions('WMS', { ...wms, credit: 'c', parameters: { format: 'image/png', transparent: 'true' } })).toMatchObject({
        url: 'https://example.com/wms',
        attributions: 'c',
        params: { LAYERS: 'l1,l2', FORMAT: 'image/png', TRANSPARENT: 'true' },
      });
    });

    it('takes the projection from the parameters, then crs, then srs, then tilingScheme', () => {
      const projectionOf = (options: Record<string, unknown>): unknown =>
        (adaptToOlOptions('WMS', { ...wms, ...options }) as { projection?: string }).projection;

      expect(projectionOf({ parameters: { crs: 'EPSG:3857' }, crs: 'EPSG:4326', srs: 'EPSG:4326', tilingScheme: 'geographic' })).toBe('EPSG:3857');
      expect(projectionOf({ crs: 'EPSG:3857', srs: 'EPSG:4326', tilingScheme: 'geographic' })).toBe('EPSG:3857');
      expect(projectionOf({ srs: 'EPSG:3857', tilingScheme: 'geographic' })).toBe('EPSG:3857');
      expect(projectionOf({ tilingScheme: 'geographic' })).toBe(Proj.WGS84);
      expect(projectionOf({})).toBeUndefined();
    });

    it('does not keep CRS/SRS in params, OL adds them from the projection', () => {
      const { params } = adaptToOlOptions('WMS', { ...wms, parameters: { crs: 'EPSG:3857', SRS: 'EPSG:3857', version: '1.3.0' } }) as {
        params: object;
      };
      expect(params).toEqual({ LAYERS: 'l1,l2', VERSION: '1.3.0' });
    });

    it('builds a tile grid only when the grid options are not the defaults', () => {
      expect(adaptToOlOptions('WMS', wms)).not.toHaveProperty('tileGrid');
      expect(adaptToOlOptions('WMS', { ...wms, tileWidth: 512 })).toHaveProperty('tileGrid');
      expect(adaptToOlOptions('WMS', { ...wms, rectangle: { west: 30, south: 30, east: 40, north: 40 } })).toHaveProperty('tileGrid');
    });
  });

  it('returns null for unsupported types', () => {
    expect(adaptToOlOptions('OSM', { url: 'https://example.com' })).toBeNull();
  });
});

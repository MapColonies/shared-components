import { Proj } from '../components/utils/projections';
import TileState from 'ol/TileState';
import { adaptToOlLayerExtent, adaptToOlOptions } from './ol-adapter';
import type { XYZOptions } from './ol-adapter';

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
    expect(projectionOf(adaptToOlOptions('WMTS', wmts))).toBe(Proj.WGS84);
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

  it('keeps the standard origin and resolutions of the projection when a rectangle limits the XYZ grid', () => {
    const rectangle = { west: 30, south: 30, east: 40, north: 40 };
    type Grid = { getOrigin: (z: number) => number[]; getResolutions: () => number[] };
    const gridOf = (options: unknown): Grid => (options as { tileGrid: Grid }).tileGrid;

    const clipped = gridOf(adaptToOlOptions('XYZ', { ...xyz, rectangle }));
    const standard = gridOf(adaptToOlOptions('XYZ', { ...xyz, rectangle: { west: -180, south: -90, east: 180, north: 90 } }));
    expect(clipped.getOrigin(0)).toEqual(standard.getOrigin(0));
    expect(clipped.getResolutions()).toEqual(standard.getResolutions());
  });

  it('ignores a rectangle that is outside of the projection extent', () => {
    const rectangle = { west: 30, south: 89, east: 40, north: 90 };
    const options = adaptToOlOptions('XYZ', { ...xyz, rectangle }) as { tileGrid?: { getExtent: () => number[] } };
    // Falls back to the whole (finite) projection extent
    expect(options.tileGrid?.getExtent().every(Number.isFinite)).toBe(true);
  });

  it('adapts the rectangle to the layer extent in the projection of the view', () => {
    const rectangle = { west: 30, south: 30, east: 40, north: 40 };
    expect(adaptToOlLayerExtent({ ...xyz, rectangle }, 'EPSG:4326')?.map(Math.round)).toEqual([30, 30, 40, 40]);
    expect(adaptToOlLayerExtent({ ...xyz, rectangle }, 'EPSG:3857')?.[0]).toBeCloseTo(3339584, -1);
    expect(adaptToOlLayerExtent(xyz, 'EPSG:4326')).toBeUndefined();
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

  describe('auth', () => {
    it('appends the query parameters to the url, keeping the template and an existing query', () => {
      const auth = { queryParameters: { token: 'a b' } };
      expect(adaptToOlOptions('XYZ', { url: 'https://example.com/{z}/{x}/{y}.png' }, auth)).toMatchObject({
        url: 'https://example.com/{z}/{x}/{y}.png?token=a%20b',
      });
      expect(adaptToOlOptions('WMS', { url: 'https://example.com/wms?x=1', layers: 'l' }, auth)).toMatchObject({
        url: 'https://example.com/wms?x=1&token=a%20b',
      });
    });

    it('appends them to every subdomain url', () => {
      const options = adaptToOlOptions(
        'XYZ',
        { url: 'https://{s}.example.com/{z}/{x}/{y}.png', subdomains: 'ab' },
        { queryParameters: { token: 't' } }
      ) as { urls?: string[] };
      expect(options.urls).toEqual(['https://a.example.com/{z}/{x}/{y}.png?token=t', 'https://b.example.com/{z}/{x}/{y}.png?token=t']);
    });

    it('adds no tileLoadFunction without headers', () => {
      expect(adaptToOlOptions('XYZ', xyz)).not.toHaveProperty('tileLoadFunction');
      expect(adaptToOlOptions('XYZ', xyz, { queryParameters: { token: 't' } })).not.toHaveProperty('tileLoadFunction');
    });

    it('sends the headers with a tileLoadFunction, for every type', async () => {
      const auth = { headers: { token: 't' } };
      expect(adaptToOlOptions('WMTS', wmts, auth)).toHaveProperty('tileLoadFunction');
      expect(adaptToOlOptions('WMS', { url: 'https://example.com/wms', layers: 'l' }, auth)).toHaveProperty('tileLoadFunction');

      const blob = new Blob(['tile']);
      const fetchMock = jest.fn().mockResolvedValue({ ok: true, blob: async () => blob });
      global.fetch = fetchMock;
      URL.createObjectURL = jest.fn().mockReturnValue('blob:tile');
      URL.revokeObjectURL = jest.fn();

      const { tileLoadFunction } = adaptToOlOptions('XYZ', xyz, auth) as XYZOptions;
      const image = document.createElement('img');
      const tile = { getImage: () => image, setState: jest.fn() };
      tileLoadFunction?.(tile as never, 'https://example.com/1/2/3.png');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(fetchMock).toHaveBeenCalledWith('https://example.com/1/2/3.png', { headers: { token: 't' } });
      expect(image.src).toBe('blob:tile');
      expect(tile.setState).not.toHaveBeenCalled();
    });

    it('marks the tile as failed when the request fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 });
      const { tileLoadFunction } = adaptToOlOptions('XYZ', xyz, { headers: { token: 't' } }) as XYZOptions;
      const tile = { getImage: () => document.createElement('img'), setState: jest.fn() };
      tileLoadFunction?.(tile as never, 'https://example.com/1/2/3.png');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(tile.setState).toHaveBeenCalledWith(TileState.ERROR);
    });
  });
});

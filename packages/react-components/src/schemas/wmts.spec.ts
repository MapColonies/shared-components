import { zodToJsonSchema } from 'zod-to-json-schema';
import { WmtsOptionsSchema, createWmtsOptionsSchema } from './wmts';

const valid = {
  url: 'https://example.com/wmts/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png',
  layer: 'ortho',
  style: 'default',
  tileMatrixSetID: 'WGS84',
};

describe('WmtsOptionsSchema', () => {
  it('accepts minimal options and applies defaults', () => {
    expect(WmtsOptionsSchema.parse(valid)).toEqual({ ...valid, format: 'image/jpeg', tileWidth: 256, tileHeight: 256, minimumLevel: 0 });
  });

  it('accepts a full option set', () => {
    const full = {
      ...valid,
      format: 'image/png',
      rectangle: { west: 34, south: 29, east: 36, north: 34 },
      tilingScheme: 'geographic',
      maximumLevel: 18,
      subdomains: ['a', 'b'],
      dimensions: { time: '2024' },
    };
    expect(WmtsOptionsSchema.safeParse(full).success).toBe(true);
  });

  it.each([
    ['unknown key (strict)', { ...valid, foo: 1 }],
    ['omitted non-serializable option', { ...valid, ellipsoid: {} }],
    ['missing layer', { ...valid, layer: undefined }],
    ['credentials in url', { ...valid, url: 'https://user:pw@example.com/wmts' }],
    ['token in query', { ...valid, url: 'https://example.com/wmts?token=abc' }],
    ['token in getFeatureInfoUrl', { ...valid, getFeatureInfoUrl: 'https://example.com/fi?access_token=abc' }],
    ['unknown tilingScheme', { ...valid, tilingScheme: 'mars' }],
    ['rectangle out of range', { ...valid, rectangle: { west: -200, south: 0, east: 0, north: 0 } }],
    ['maximumLevel < minimumLevel', { ...valid, minimumLevel: 5, maximumLevel: 2 }],
    ['unknown key inside rectangle', { ...valid, rectangle: { west: 0, south: 0, east: 1, north: 1, x: 1 } }],
  ])('rejects %s', (_name, input) => {
    expect(WmtsOptionsSchema.safeParse(input).success).toBe(false);
  });

  it('allows credentials in url only when explicitly enabled', () => {
    const withCreds = { ...valid, url: 'https://user:pw@example.com/wmts?token=abc' };
    expect(WmtsOptionsSchema.safeParse(withCreds).success).toBe(false);
    expect(createWmtsOptionsSchema({ allowUrlCredentials: false }).safeParse(withCreds).success).toBe(false);
    expect(createWmtsOptionsSchema({ allowUrlCredentials: true }).safeParse(withCreds).success).toBe(true);
  });

  it('does not accept an opt-in flag from the payload', () => {
    expect(WmtsOptionsSchema.safeParse({ ...valid, allowUrlCredentials: true }).success).toBe(false);
  });

  it('converts to a strict JSON Schema usable by Monaco', () => {
    const json = zodToJsonSchema(WmtsOptionsSchema, { target: 'jsonSchema7', $refStrategy: 'none' }) as Record<string, any>;
    expect(json.additionalProperties).toBe(false);
    expect(json.required).toEqual(expect.arrayContaining(['url', 'layer', 'style', 'tileMatrixSetID']));
    expect(json.properties.layer.description).toBeDefined();
  });
});

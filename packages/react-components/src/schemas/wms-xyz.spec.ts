import { zodToJsonSchema } from 'zod-to-json-schema';
import { WmsOptionsSchema, createWmsOptionsSchema } from './wms';
import { XyzOptionsSchema, createXyzOptionsSchema } from './xyz';

const wms = { url: 'https://example.com/wms?', layers: 'a,b' };
const xyz = { url: 'https://example.com/tiles/{z}/{x}/{y}.png' };

describe.each([
  ['WMS', WmsOptionsSchema, createWmsOptionsSchema, wms, ['url', 'layers']],
  ['XYZ', XyzOptionsSchema, createXyzOptionsSchema, xyz, ['url']],
] as const)('%s options schema', (_name, schema, create, valid, mandatory) => {
  it('accepts minimal options and applies defaults', () => {
    expect(schema.parse(valid)).toEqual({ ...valid, tileWidth: 256, tileHeight: 256, minimumLevel: 0 });
  });

  it('accepts a rectangle in degrees, a tiling scheme and levels', () => {
    const full = {
      ...valid,
      rectangle: { west: 34, south: 29, east: 36, north: 34 },
      tilingScheme: 'webmercator',
      maximumLevel: 18,
      subdomains: 'abc',
      credit: 'x',
    };
    expect(schema.safeParse(full).success).toBe(true);
  });

  it.each([
    ['unknown key (strict)', { foo: 1 }],
    ['non-serializable option', { ellipsoid: {} }],
    ['credentials in url', { url: 'https://user:pw@example.com/x' }],
    ['token in query', { url: 'https://example.com/x?apikey=abc' }],
    ['unknown tilingScheme', { tilingScheme: 'mars' }],
    ['rectangle out of range', { rectangle: { west: -200, south: 0, east: 0, north: 0 } }],
    ['maximumLevel < minimumLevel', { minimumLevel: 5, maximumLevel: 2 }],
  ])('rejects %s', (_case, extra) => {
    expect(schema.safeParse({ ...valid, ...extra }).success).toBe(false);
  });

  it('allows credentials in url only when explicitly enabled, never from the payload', () => {
    const withCreds = { ...valid, url: 'https://user:pw@example.com/x?token=abc' };
    expect(schema.safeParse(withCreds).success).toBe(false);
    expect(create({ allowUrlCredentials: true }).safeParse(withCreds).success).toBe(true);
    expect(schema.safeParse({ ...valid, allowUrlCredentials: true }).success).toBe(false);
  });

  it('converts to a strict JSON Schema with the expected mandatory fields', () => {
    const json = zodToJsonSchema(schema, { target: 'jsonSchema7', $refStrategy: 'none' }) as Record<string, any>;
    expect(json.additionalProperties).toBe(false);
    expect([...json.required].sort()).toEqual([...mandatory].sort());
    expect(json.properties.url.description).toBeDefined();
  });
});

describe('WMS specifics', () => {
  it('requires layers and accepts GetMap parameters of several types', () => {
    expect(WmsOptionsSchema.safeParse({ url: wms.url }).success).toBe(false);
    expect(WmsOptionsSchema.safeParse({ ...wms, parameters: { format: 'image/png', transparent: true, version: 1.3 } }).success).toBe(true);
    expect(WmsOptionsSchema.safeParse({ ...wms, crs: 'EPSG:4326' }).success).toBe(true);
  });
});

describe('XYZ specifics', () => {
  it('accepts pickFeaturesUrl and zero padding, and rejects tokens in pickFeaturesUrl', () => {
    expect(
      XyzOptionsSchema.safeParse({ ...xyz, urlSchemeZeroPadding: { x: '000' }, pickFeaturesUrl: 'https://example.com/pick/{z}/{x}/{y}' }).success
    ).toBe(true);
    expect(XyzOptionsSchema.safeParse({ ...xyz, pickFeaturesUrl: 'https://example.com/pick?token=abc' }).success).toBe(false);
  });
});

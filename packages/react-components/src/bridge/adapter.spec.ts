import type { CapabilityWMTS } from '@map-colonies/wmts-client';
import { adaptCapabilityToWmtsOptions } from './adapter';

const template = 'https://example.com/wmts/ortho/{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.png';
const capability: CapabilityWMTS = {
  id: 'ortho-1.0',
  style: [
    { value: 'other', isDefault: 'false' },
    { value: 'default', isDefault: 'true' },
  ],
  format: ['image/png'],
  tileMatrixSet: [{ tileMatrixSetID: 'newGrids', tileMatrixLabels: ['0', '1', '2', '10'] }],
  url: [
    { format: 'image/jpeg', resourceType: 'tile', template: 'https://example.com/other.jpeg' },
    { format: 'image/png', resourceType: 'tile', template },
  ],
};

describe('adaptCapabilityToWmtsOptions', () => {
  it('maps a capability to WMTS options', () => {
    expect(adaptCapabilityToWmtsOptions(capability)).toEqual({
      url: template,
      layer: 'ortho-1.0',
      style: 'default',
      format: 'image/png',
      tileMatrixSetID: 'newGrids',
      tileMatrixLabels: ['0', '1', '2', '10'],
      maximumLevel: 10,
      tilingScheme: 'geographic',
      tileWidth: 256,
      tileHeight: 256,
      minimumLevel: 0,
    });
  });

  it('falls back to the first style when none is default', () => {
    expect(
      adaptCapabilityToWmtsOptions({
        ...capability,
        style: [
          { value: 'first', isDefault: 'false' },
          { value: 'second', isDefault: null },
        ],
      }).style
    ).toBe('first');
  });

  it('falls back to the defaults for the empty lists', () => {
    const jpegTemplate = 'https://example.com/other.jpeg';
    const options = adaptCapabilityToWmtsOptions({ ...capability, style: [], format: [], tileMatrixSet: [] });
    expect(options).toMatchObject({
      url: jpegTemplate,
      style: 'XXX_STYLE_XXX',
      format: 'image/jpeg',
      tileMatrixSetID: 'XXX_GRID_XXX',
      maximumLevel: 20,
    });
    expect(options.tileMatrixLabels).toHaveLength(21);
  });

  it('throws when no URL matches the format', () => {
    expect(() => adaptCapabilityToWmtsOptions({ ...capability, url: [] })).toThrow();
  });

  it('throws when there is no capability: no url or layer can be resolved', () => {
    expect(() => adaptCapabilityToWmtsOptions()).toThrow();
  });

  it('keeps a token in the URL: credentials are allowed', () => {
    const url = `${template}?token=abc`;
    expect(adaptCapabilityToWmtsOptions({ ...capability, url: [{ format: 'image/png', resourceType: 'tile', template: url }] }).url).toBe(url);
  });
});

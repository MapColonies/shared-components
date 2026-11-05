import { adaptCapabilityToWmtsOptions } from './adapter';
import type { Capability } from '@map-colonies/types';

const template = 'https://example.com/wmts/ortho/{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.png';
const capability: Capability = {
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

  it('throws when no URL matches the format', () => {
    expect(() => adaptCapabilityToWmtsOptions({ ...capability, url: [] })).toThrow();
  });

  it('throws when the URL embeds credentials', () => {
    expect(() =>
      adaptCapabilityToWmtsOptions({
        ...capability,
        url: [{ format: 'image/png', resourceType: 'tile', template: `${template}?token=abc` }],
      })
    ).toThrow();
  });

  it('throws when tileMatrixSet is missing', () => {
    expect(() => adaptCapabilityToWmtsOptions({ ...capability, tileMatrixSet: [] })).toThrow();
  });

  it('validates the capability before adapting it', () => {
    expect(() =>
      // @ts-expect-error Deliberately invalid runtime input must fail schema validation.
      adaptCapabilityToWmtsOptions({ ...capability, style: [{ value: 'default', isDefault: 1 }] })
    ).toThrow();
  });
});

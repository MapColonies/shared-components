import { CapabilityWMTS } from '@map-colonies/wmts-client';
import { WmtsOptions, WmtsOptionsSchema } from '../schemas';

const DEFAULT_STYLE = 'default';
const DEFAULT_FORMAT = 'image/jpeg';
const DEFAULT_TILE_MATRIX_SET_ID = 'newGrids';
const DEFAULT_MAX_LEVEL = 20;
const DEFAULT_TILE_MATRIX_LABELS = Array.from({ length: DEFAULT_MAX_LEVEL + 1 }, (_, level) => String(level));

export interface WmtsAdapterOverrides {
  layer?: string;
}

export interface WmtsAdapterFallbacks {
  url?: string;
}

/**
 * Converts a catalog `Capability` into WMTS layer options.
 *
 * The capability is optional; its fields are not (`CapabilityWMTS` has them all), but its lists may be empty. Whatever the capability
 * does not provide (no capability, or an empty list) falls back to a default (style `default`, format `image/jpeg`, tile matrix set `newGrids` with levels 0-20).
 * `overrides.layer` wins over `capability.id`, `fallbacks.url` is used when the capability has no matching tile URL.
 *
 * @throws when the result is not valid WMTS options (e.g. no url or layer could be resolved, credentials in URL).
 */
export const adaptCapabilityToWmtsOptions = (
  capability?: CapabilityWMTS,
  overrides: WmtsAdapterOverrides = {},
  fallbacks: WmtsAdapterFallbacks = {}
): WmtsOptions => {
  const styles = capability?.style ?? [];
  const style = (styles.find((s) => s.isDefault === 'true') ?? styles[0])?.value ?? DEFAULT_STYLE;

  const format = capability?.format[0] ?? DEFAULT_FORMAT;
  const tileMatrixSet = capability?.tileMatrixSet[0];
  const url = capability?.url.find((u) => u.format === format)?.template ?? fallbacks.url;

  const tileMatrixSetID = tileMatrixSet?.tileMatrixSetID ?? DEFAULT_TILE_MATRIX_SET_ID;
  const tileMatrixLabels = tileMatrixSet?.tileMatrixLabels ?? DEFAULT_TILE_MATRIX_LABELS;
  const levels = tileMatrixLabels.map(Number).filter((n) => Number.isFinite(n));

  return WmtsOptionsSchema.parse({
    url,
    layer: overrides.layer ?? capability?.id,
    style,
    format,
    tileMatrixSetID,
    tileMatrixLabels,
    maximumLevel: levels.length > 0 ? Math.max(...levels) : undefined,
    tilingScheme: 'geographic'
  });
};

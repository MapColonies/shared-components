import { CapabilityWMTS } from '@map-colonies/wmts-client';
import { WmtsOptions, WmtsOptionsSchema } from '../schemas';

const DEFAULT_STYLE = 'default';
const DEFAULT_FORMAT = 'image/jpeg';
const DEFAULT_TILE_MATRIX_SET_ID = 'newGrids';
const DEFAULT_MAX_LEVEL = 20;
const DEFAULT_TILE_MATRIX_LABELS = Array.from({ length: DEFAULT_MAX_LEVEL + 1 }, (_, level) => String(level));

/** Map tileMatrixSetID to tiling scheme. */
const TILING_SCHEME_MAP: Record<string, 'geographic' | 'webmercator'> = {
  newGrids: 'webmercator',
  // Add more mappings as needed
};

/** Resolve tiling scheme from tileMatrixSetID, defaulting to webmercator. */
const resolveTilingScheme = (tileMatrixSetID: string): 'geographic' | 'webmercator' => {
  return TILING_SCHEME_MAP[tileMatrixSetID] ?? 'webmercator';
};

/** Values that win over the ones derived from the capability. */
export interface WmtsAdapterOverrides {
  /** Takes precedence over `capability.id`. */
  layer?: string;
}

/** Values used only when the capability does not provide them. */
export interface WmtsAdapterFallbacks {
  /** Used when the capability has no tile URL template matching the selected format. */
  url?: string;
}

/**
 * Converts a catalog `Capability` (as served by catalog-web-app-bff) into WMTS layer options.
 *
 * Selection logic follows catalog-app `getWMTSConfigOptions`: only ONE tile format and ONE tile matrix set are served per layer,
 * so `format[0]` and `tileMatrixSet[0]` are used. `tilingScheme` is derived from `tileMatrixSetID`.
 *
 * The capability is optional, and so is each of its fields: anything missing falls back to a default
 * (style `default`, format `image/jpeg`, tile matrix set `newGrids` with levels 0-20).
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

  const format = capability?.format?.[0] ?? DEFAULT_FORMAT;
  const tileMatrixSet = capability?.tileMatrixSet?.[0];
  const url = capability?.url?.find((u) => u.format === format)?.template ?? fallbacks.url;

  const tileMatrixSetID = tileMatrixSet?.tileMatrixSetID ?? DEFAULT_TILE_MATRIX_SET_ID;
  const tileMatrixLabels = tileMatrixSet?.tileMatrixLabels ?? DEFAULT_TILE_MATRIX_LABELS;
  const levels = tileMatrixLabels.map(Number).filter((n) => Number.isFinite(n));
  const tilingScheme = resolveTilingScheme(tileMatrixSetID);

  return WmtsOptionsSchema.parse({
    url,
    layer: overrides.layer ?? capability?.id,
    style,
    format,
    tileMatrixSetID,
    tileMatrixLabels,
    maximumLevel: levels.length > 0 ? Math.max(...levels) : undefined,
    tilingScheme,
  });
};

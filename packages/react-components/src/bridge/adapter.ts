import { CapabilityWMTS } from '@map-colonies/wmts-client';
import { WmtsOptions, WmtsOptionsSchema } from '../schemas';

const DEFAULT_STYLE = 'XXX_STYLE_XXX';
const DEFAULT_FORMAT = 'image/jpeg';
const DEFAULT_TILE_MATRIX_SET_ID = 'XXX_GRID_XXX';
const DEFAULT_MAX_LEVEL = 20;
const DEFAULT_TILE_MATRIX_LABELS = Array.from({ length: DEFAULT_MAX_LEVEL + 1 }, (_, level) => String(level));

/**
 * Converts a catalog `Capability` into WMTS layer options.
 *
 * The layer is `capability.id`, the url is the tile template of the chosen format. The tiling scheme is always geographic.
 * An empty style, format or tile matrix set list falls back to a default (style `XXX_STYLE_XXX`, format `image/jpeg`,
 * tile matrix set `XXX_GRID_XXX` with levels 0-20); the default style is the one marked `isDefault`, else the first.
 *
 * @throws when the result is not valid WMTS options: no capability, or no tile URL for the chosen format.
 */
export const adaptCapabilityToWmtsOptions = (
  capability?: CapabilityWMTS,
): WmtsOptions => {
  const styles = capability?.style ?? [];
  const style = (styles.find((s) => s.isDefault === 'true') ?? styles[0])?.value ?? DEFAULT_STYLE;

  const format = capability?.format[0] ?? DEFAULT_FORMAT;
  const tileMatrixSet = capability?.tileMatrixSet[0];
  const url = capability?.url.find((u) => u.format === format)?.template;

  const tileMatrixSetID = tileMatrixSet?.tileMatrixSetID ?? DEFAULT_TILE_MATRIX_SET_ID;
  const tileMatrixLabels = tileMatrixSet?.tileMatrixLabels ?? DEFAULT_TILE_MATRIX_LABELS;
  const levels = tileMatrixLabels.map(Number).filter((n) => Number.isFinite(n));

  return WmtsOptionsSchema.parse({
    url,
    layer: capability?.id,
    style,
    format,
    tileMatrixSetID,
    tileMatrixLabels,
    maximumLevel: levels.length > 0 ? Math.max(...levels) : undefined,
    tilingScheme: 'geographic'
  });
};

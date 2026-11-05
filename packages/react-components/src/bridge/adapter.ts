import { type CapabilityWMTS } from '@map-colonies/wmts-client';
import { WmtsOptions, WmtsOptionsSchema } from '../schemas';

/**
 * Converts a catalog `Capability` (as served by catalog-web-app-bff) into WMTS layer options.
 *
 * Selection logic follows catalog-app `getWMTSConfigOptions`: only ONE tile format and ONE tile matrix set are served per layer,
 * so `format[0]` and `tileMatrixSet[0]` are used. `tilingScheme` is intentionally left unset; it is up to the caller.
 *
 * @throws when the capability cannot be resolved into valid options (e.g. no tile URL, credentials in URL).
 */
export const adaptCapabilityToWmtsOptions = (capability: CapabilityWMTS): WmtsOptions => {
  const styles = capability.style;
  const style = (styles.find((s) => s.isDefault === 'true') ?? styles[0])?.value;

  const format = capability.format[0];
  const tileMatrixSet = capability.tileMatrixSet[0];
  const urls = capability.url;
  const url = urls.find((u) => u.format === format)?.template;

  const tileMatrixLabels = tileMatrixSet?.tileMatrixLabels;
  const levels = (tileMatrixLabels ?? []).map(Number).filter((n) => Number.isFinite(n));

  return WmtsOptionsSchema.parse({
    url,
    layer: capability.id,
    style,
    format,
    tileMatrixSetID: tileMatrixSet.tileMatrixSetID,
    tileMatrixLabels,
    maximumLevel: levels.length > 0 ? Math.max(...levels) : undefined,
  });
};

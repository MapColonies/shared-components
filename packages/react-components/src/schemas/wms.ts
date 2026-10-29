import { z } from 'zod';
import { RectangleDegSchema, TilingSchemeNameSchema, createUrlSchema, UrlPolicy } from './common';

/**
 * JSON-safe projection of Cesium `WebMapServiceImageryProvider.ConstructorOptions`.
 *
 * Omitted on purpose (see `OMITTED_WMS_OPTIONS`): non-serializable values (`ellipsoid`, `clock`, `times`,
 * `getFeatureInfoFormats`). `url`/`credit` are plain strings; `rectangle` is in degrees; `tilingScheme` is a name.
 */
export const createWmsOptionsSchema = (policy: UrlPolicy = {}) =>
  z
    .object({
      url: createUrlSchema('WMS service URL; supports the same keywords as an XYZ URL template ({s}, ...).', policy),
      layers: z.string().min(1).describe('Layers to include, separated by commas'),
      parameters: z
        .record(z.union([z.string(), z.number(), z.boolean()]))
        .optional()
        .describe('Additional parameters of the GetMap request, e.g. { "format": "image/png", "transparent": "true" }'),
      enablePickFeatures: z.boolean().optional().describe('Invoke GetFeatureInfo on feature pick'),
      getFeatureInfoUrl: createUrlSchema('GetFeatureInfo URL; defaults to `url`.', policy).optional(),
      getFeatureInfoParameters: z.record(z.string()).optional().describe('Additional GetFeatureInfo request parameters'),
      rectangle: RectangleDegSchema.optional().describe('Rectangle covered by the layer, in degrees'),
      tilingScheme: TilingSchemeNameSchema.optional().describe('Tiling scheme used to divide the world into tiles'),
      tileWidth: z.number().int().positive().default(256).describe('Tile width in pixels'),
      tileHeight: z.number().int().positive().default(256).describe('Tile height in pixels'),
      minimumLevel: z.number().int().min(0).default(0).describe('Minimum level of detail'),
      maximumLevel: z.number().int().min(0).optional().describe('Maximum level of detail; unlimited if omitted'),
      crs: z.string().min(1).optional().describe('CRS specification, for WMS >= 1.3.0'),
      srs: z.string().min(1).optional().describe('SRS specification, for WMS 1.1.0 or 1.1.1'),
      credit: z.string().optional().describe('Attribution text'),
      subdomains: z
        .union([z.string().min(1), z.array(z.string().min(1)).min(1)])
        .optional()
        .describe('Subdomains for the {s} placeholder'),
    })
    .strict()
    .refine((o) => o.maximumLevel === undefined || o.maximumLevel >= o.minimumLevel, {
      message: 'maximumLevel must be >= minimumLevel',
      path: ['maximumLevel'],
    });

/** Default (secure) schema: credentials in URLs are rejected. */
export const WmsOptionsSchema = createWmsOptionsSchema();

/** Output of parsing (defaults applied). */
export type WmsOptions = z.infer<typeof WmsOptionsSchema>;
/** What an editor/API client may send (defaulted fields optional). */
export type WmsOptionsInput = z.input<typeof WmsOptionsSchema>;

/** Cesium options deliberately not representable in the schema, with the reason. Checked against Cesium by the drift check. */
export const OMITTED_WMS_OPTIONS = {
  ellipsoid: 'not serializable; WGS84 assumed',
  getFeatureInfoFormats: 'contains parsing callbacks',
  clock: 'not serializable; time-dynamic WMS out of scope for v1',
  times: 'not serializable; time-dynamic WMS out of scope for v1',
} as const;

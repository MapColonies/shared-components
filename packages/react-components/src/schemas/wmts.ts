import { z } from 'zod';
import { RectangleDegSchema, TilingSchemeNameSchema, createUrlSchema, UrlPolicy } from './common';

/**
 * JSON-safe projection of Cesium `WebMapTileServiceImageryProvider.ConstructorOptions`.
 *
 * Omitted on purpose (see `OMITTED_WMTS_OPTIONS`): non-serializable values (`ellipsoid`, `clock`, `times`,
 * `getFeatureInfoFormats`). `url`/`credit` are plain strings; `rectangle` is in degrees; `tilingScheme` is a name.
 */
export const createWmtsOptionsSchema = (policy: UrlPolicy = {}) =>
  z
    .object({
      url: createUrlSchema(
        'WMTS GetTile base URL (KVP) or tile URL template (RESTful) with {style}, {TileMatrixSet}, {TileMatrix}, {TileRow}, {TileCol}, {s}.',
        policy
      ),
      layer: z.string().min(1).describe('Layer name for WMTS requests'),
      style: z.string().min(1).describe('Style name for WMTS requests'),
      tileMatrixSetID: z.string().min(1).describe('Identifier of the TileMatrixSet to use'),
      format: z.string().min(1).default('image/jpeg').describe('MIME type of the tiles'),
      enablePickFeatures: z.boolean().optional().describe('Invoke GetFeatureInfo on feature pick'),
      getFeatureInfoUrl: createUrlSchema('GetFeatureInfo URL; defaults to `url`.', policy).optional(),
      getFeatureInfoParameters: z.record(z.string()).optional().describe('Additional GetFeatureInfo request parameters'),
      rectangle: RectangleDegSchema.optional().describe('Rectangle covered by the layer, in degrees'),
      tilingScheme: TilingSchemeNameSchema.optional().describe('Tiling scheme of the TileMatrixSet'),
      tileWidth: z.number().int().positive().default(256).describe('Tile width in pixels'),
      tileHeight: z.number().int().positive().default(256).describe('Tile height in pixels'),
      minimumLevel: z.number().int().min(0).default(0).describe('Minimum level of detail'),
      maximumLevel: z.number().int().min(0).optional().describe('Maximum level of detail; unlimited if omitted'),
      tileMatrixLabels: z.array(z.string()).optional().describe('TileMatrix identifier per level'),
      credit: z.string().optional().describe('Attribution text'),
      subdomains: z
        .union([z.string().min(1), z.array(z.string().min(1)).min(1)])
        .optional()
        .describe('Subdomains for the {s} placeholder'),
      dimensions: z.record(z.string()).optional().describe('Static dimensions and their values'),
    })
    .strict()
    .refine((o) => o.maximumLevel === undefined || o.maximumLevel >= o.minimumLevel, {
      message: 'maximumLevel must be >= minimumLevel',
      path: ['maximumLevel'],
    });

/** Default (secure) schema: credentials in URLs are rejected. */
export const WmtsOptionsSchema = createWmtsOptionsSchema();

/** Output of parsing (defaults applied). */
export type WmtsOptions = z.infer<typeof WmtsOptionsSchema>;
/** What an editor/API client may send (defaulted fields optional). */
export type WmtsOptionsInput = z.input<typeof WmtsOptionsSchema>;

/** Cesium options deliberately not representable in the schema, with the reason. Checked against Cesium by the drift check. */
export const OMITTED_WMTS_OPTIONS = {
  ellipsoid: 'not serializable; WGS84 assumed',
  getFeatureInfoFormats: 'contains parsing callbacks',
  clock: 'not serializable; time-dynamic WMTS out of scope for v1',
  times: 'not serializable; time-dynamic WMTS out of scope for v1',
} as const;

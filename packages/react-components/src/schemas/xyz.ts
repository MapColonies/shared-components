import { z } from 'zod';
import { RectangleDegSchema, TilingSchemeNameSchema, createUrlSchema, UrlPolicy } from './common';

/**
 * JSON-safe projection of Cesium `UrlTemplateImageryProvider.ConstructorOptions` (the XYZ protocol).
 *
 * Omitted on purpose (see `OMITTED_XYZ_OPTIONS`): non-serializable values (`ellipsoid`, `tileDiscardPolicy`,
 * `customTags`, `getFeatureInfoFormats`). `url`/`credit` are plain strings; `rectangle` is in degrees; `tilingScheme` is a name.
 */
export const createXyzOptionsSchema = (policy: UrlPolicy = {}) =>
  z
    .object({
      url: createUrlSchema('Tile URL template with {x}, {y}, {z} (also {reverseX}, {reverseY}, {reverseZ}, {westDegrees}, ..., {s}).', policy),
      pickFeaturesUrl: createUrlSchema('URL template used to pick features; picking is disabled when omitted.', policy).optional(),
      urlSchemeZeroPadding: z.record(z.string()).optional().describe('Zero padding per tile coordinate keyword, e.g. { "x": "000" }'),
      subdomains: z
        .union([z.string().min(1), z.array(z.string().min(1)).min(1)])
        .optional()
        .describe('Subdomains for the {s} placeholder'),
      credit: z.string().optional().describe('Attribution text'),
      minimumLevel: z.number().int().min(0).default(0).describe('Minimum level of detail'),
      maximumLevel: z.number().int().min(0).optional().describe('Maximum level of detail; unlimited if omitted'),
      rectangle: RectangleDegSchema.optional().describe('Rectangle covered by the imagery, in degrees'),
      tilingScheme: TilingSchemeNameSchema.optional().describe('Tiling scheme; web mercator when omitted'),
      tileWidth: z.number().int().positive().default(256).describe('Tile width in pixels'),
      tileHeight: z.number().int().positive().default(256).describe('Tile height in pixels'),
      hasAlphaChannel: z.boolean().optional().describe('Whether the tile images have an alpha channel'),
      enablePickFeatures: z.boolean().optional().describe('Request `pickFeaturesUrl` on feature pick'),
    })
    .strict()
    .refine((o) => o.maximumLevel === undefined || o.maximumLevel >= o.minimumLevel, {
      message: 'maximumLevel must be >= minimumLevel',
      path: ['maximumLevel'],
    });

/** Default (secure) schema: credentials in URLs are rejected. */
export const XyzOptionsSchema = createXyzOptionsSchema();

/** Output of parsing (defaults applied). */
export type XyzOptions = z.infer<typeof XyzOptionsSchema>;
/** What an editor/API client may send (defaulted fields optional). */
export type XyzOptionsInput = z.input<typeof XyzOptionsSchema>;

/** Cesium options deliberately not representable in the schema, with the reason. Checked against Cesium by the drift check. */
export const OMITTED_XYZ_OPTIONS = {
  ellipsoid: 'not serializable; WGS84 assumed',
  getFeatureInfoFormats: 'contains parsing callbacks',
  tileDiscardPolicy: 'not serializable',
  customTags: 'contains functions',
} as const;

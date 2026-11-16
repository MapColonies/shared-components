import type { Options as WMTSOptions } from 'ol/source/WMTS';
import type { Options as XYZOptions } from 'ol/source/XYZ';
import type { Options as WMSOptions } from 'ol/source/TileWMS';
import { getIntersection, isEmpty } from 'ol/extent';
import type { Extent } from 'ol/extent';
import { get as getProjection, transformExtent } from 'ol/proj';
import { createXYZ } from 'ol/tilegrid';
import TileGrid from 'ol/tilegrid/TileGrid';
import type { LayerType, MCOptions } from '../components/cesium-map/layers-manager';
import { ProtocolType } from '../components/models/protocol-type.enum';
import { getWMTSOptions } from '../components/ol-map/source/wmts';
import { getWMSOptions } from '../components/ol-map/source/wms';
import { getXYZOptions } from '../components/ol-map/source/xyz';
import { Proj } from '../components/utils/projections';
import type { InjectedAuth } from '../hydration';
import { appendAuthQueryParameters } from './auth';
import { WmsOptionsSchema, WmtsOptionsSchema, XyzOptionsSchema } from '../schemas';
import type { WmsOptionsInput, WmtsOptionsInput, XyzOptionsInput } from '../schemas';

export type { Options as WMTSOptions } from 'ol/source/WMTS';
export type { Options as XYZOptions } from 'ol/source/XYZ';
export type { Options as WMSOptions } from 'ol/source/TileWMS';
export type { Options as LayerOptions } from 'ol/layer/Base';

type Subdomains = string | string[] | undefined;

/** OL has no `{s}` placeholder: it takes `urls`, or a `{a-c}` range inside a single url. The query parameters of `auth` are appended to every url. */
const toOlUrlOptions = (template: string, subdomains: Subdomains, auth?: InjectedAuth): { url: string; urls?: string[] } => {
  const url = appendAuthQueryParameters(template, auth);
  if (!url.includes('{s}')) {
    return { url };
  }
  if (subdomains === undefined) {
    return { url: url.replace('{s}', '{a-c}') };
  }
  const list = typeof subdomains === 'string' ? [...subdomains] : subdomains;
  return { url, urls: list.map((subdomain) => url.replace('{s}', subdomain)) };
};

type TilingSchemeName = NonNullable<WmtsOptionsInput['tilingScheme']>;

const TILING_SCHEME_TO_PROJECTION: Record<TilingSchemeName, Proj> = {
  geographic: Proj.WGS84,
  webmercator: Proj.WEB_MERCATOR,
};

// An EPSG:4326 tile matrix set has two tiles at level 0, a EPSG:3857 one has a single tile
const TILE_GRID_HEIGHT_WIDTH_RATIO: Record<Proj, number> = {
  [Proj.WGS84]: 2,
  [Proj.WEB_MERCATOR]: 1,
};

type RectangleDeg = NonNullable<XyzOptionsInput['rectangle']>;

const toOlExtent = (rectangle: RectangleDeg | undefined, projection: string): Extent | undefined => {
  const projectionExtent = getProjection(projection)?.getExtent();
  if (rectangle === undefined || !projectionExtent) {
    return undefined;
  }
  const { west, south, east, north } = rectangle;
  const extent = getIntersection(transformExtent([west, south, east, north], Proj.WGS84, projection), projectionExtent);
  return isEmpty(extent) || !extent.every(Number.isFinite) ? undefined : extent;
};

type GridLevels = { minZoom?: number; maxZoom?: number; tileSize: [number, number] };

/**
 * A tile grid with the standard origin and resolutions of the projection (so the tiles match the server's), limited to the
 * rectangle: tiles outside of it are not requested. `createXYZ({ extent })` must not be given the rectangle, it would build
 * the grid (origin and resolutions) from it.
 */
const createTileGrid = (
  projection: string,
  rectangle: RectangleDeg | undefined,
  { minZoom, maxZoom, tileSize }: GridLevels
): TileGrid | undefined => {
  const projectionExtent = getProjection(projection)?.getExtent();
  if (!projectionExtent) {
    return undefined;
  }
  const standardGrid = createXYZ({ extent: projectionExtent, minZoom, maxZoom, tileSize });
  const extent = toOlExtent(rectangle, projection);
  if (!extent) {
    return standardGrid;
  }
  return new TileGrid({
    extent,
    origin: standardGrid.getOrigin(0),
    resolutions: standardGrid.getResolutions(),
    minZoom: standardGrid.getMinZoom(),
    tileSize,
  });
};

/**
 * Converts XYZ options into OL source options. Option names that differ between Cesium and OL are bridged:
 * `tilingScheme` -> `projection`, `credit` -> `attributions`, `minimumLevel`/`maximumLevel` -> `minZoom`/`maxZoom`,
 * `tileWidth`/`tileHeight` -> `tileSize`, `hasAlphaChannel` -> `opaque` (inverted), `rectangle` -> tile grid extent.
 * Options OL has no counterpart for (`enablePickFeatures`, `pickFeaturesUrl`, `urlSchemeZeroPadding`) are ignored.
 *
 * `auth` is injected at runtime and never stored in the options: its query parameters are appended to the url(s). Its headers are ignored: OL cannot send them.
 *
 * Without `tilingScheme` OL's own default (web mercator) applies, as it does in Cesium.
 *
 * @throws when `options` are not valid XYZ options.
 */
export const adaptToXYZOptions = (options: XyzOptionsInput, auth?: InjectedAuth): XYZOptions => {
  const {
    url: template,
    subdomains,
    credit,
    tilingScheme,
    minimumLevel,
    maximumLevel,
    tileWidth,
    tileHeight,
    hasAlphaChannel,
    rectangle,
  } = XyzOptionsSchema.parse(options);
  const { url, urls } = toOlUrlOptions(template, subdomains, auth);
  const projection = tilingScheme && TILING_SCHEME_TO_PROJECTION[tilingScheme];
  const tileSize: [number, number] = [tileWidth, tileHeight];
  // Without a `tileGrid` the XYZ source builds the standard grid of the projection from `minZoom`, `maxZoom` and `tileSize`; with one it ignores those three, hence they are passed to `createTileGrid` too
  return {
    ...getXYZOptions({
      url,
      attributions: credit,
      projection,
      minZoom: minimumLevel,
      maxZoom: maximumLevel,
      tileSize,
      opaque: hasAlphaChannel === undefined ? undefined : !hasAlphaChannel,
      tileGrid: rectangle && createTileGrid(projection ?? Proj.WEB_MERCATOR, rectangle, { minZoom: minimumLevel, maxZoom: maximumLevel, tileSize }),
    }),
    ...(urls && { urls }),
  };
};

/**
 * Converts WMTS options into OL source options. Option names that differ between Cesium and OL are bridged:
 * `tilingScheme` -> `projection`, `credit` -> `attributions`, `tileMatrixSetID` -> `matrixSet`, `tileMatrixLabels` -> `matrixIds`,
 * `tileWidth`/`tileHeight` -> `tileSize`, `rectangle` -> tile grid extent.
 * Options OL has no counterpart for (`minimumLevel`, `enablePickFeatures`, `getFeatureInfoUrl`, `getFeatureInfoParameters`) are ignored.
 *
 * The tile grid cannot be built without a projection, so without `tilingScheme` geographic is used.
 * The number of levels is `tileMatrixLabels.length`, else `maximumLevel + 1`.
 *
 * @throws when `options` are not valid WMTS options.
 */
export const adaptToWMTSOptions = (options: WmtsOptionsInput, auth?: InjectedAuth): WMTSOptions => {
  const {
    url: template,
    subdomains,
    credit,
    layer,
    tileMatrixSetID,
    tileMatrixLabels,
    format,
    style,
    tilingScheme,
    maximumLevel,
    tileWidth,
    tileHeight,
    dimensions,
    rectangle,
  } = WmtsOptionsSchema.parse(options);
  const { url, urls } = toOlUrlOptions(template, subdomains, auth);
  const projection = TILING_SCHEME_TO_PROJECTION[tilingScheme ?? 'geographic'];
  const matrixIds =
    tileMatrixLabels ?? (maximumLevel !== undefined ? Array.from({ length: maximumLevel + 1 }, (_, level) => String(level)) : undefined);
  return {
    ...getWMTSOptions({
      url,
      attributions: credit,
      layer,
      matrixSet: tileMatrixSetID,
      format,
      projection,
      style,
      heightWidthRatio: TILE_GRID_HEIGHT_WIDTH_RATIO[projection],
      matrixIds,
      tileSize: [tileWidth, tileHeight],
      dimensions,
      extent: toOlExtent(rectangle, projection),
    }),
    ...(urls && { urls }),
  };
};

const CRS_PARAMETERS = ['CRS', 'SRS'];

/**
 * Converts WMS options into OL (tiled) WMS source options. Option names that differ between Cesium and OL are bridged:
 * `layers` -> `params.LAYERS`, `parameters` -> `params` (OL wants upper-case names), `credit` -> `attributions`,
 * `tileWidth`/`tileHeight`/`minimumLevel`/`maximumLevel`/`rectangle` -> tile grid.
 * Options OL has no counterpart for (`enablePickFeatures`, `getFeatureInfoUrl`, `getFeatureInfoParameters`) are ignored.
 *
 * The projection is the first of: a `CRS`/`SRS` entry of `parameters`, `crs`, `srs`, `tilingScheme`. OL adds `CRS`/`SRS` to the requests
 * from the projection itself, so they are not kept in `params`. The code has to be one OL knows (`EPSG:4326`, `EPSG:3857` or a registered one).
 * Without any of them OL's own default (web mercator) applies.
 *
 * @throws when `options` are not valid WMS options.
 */
export const adaptToWMSOptions = (options: WmsOptionsInput, auth?: InjectedAuth): WMSOptions => {
  const {
    url: template,
    subdomains,
    credit,
    layers,
    parameters,
    crs,
    srs,
    tilingScheme,
    rectangle,
    minimumLevel,
    maximumLevel,
    tileWidth,
    tileHeight,
  } = WmsOptionsSchema.parse(options);
  const { url, urls } = toOlUrlOptions(template, subdomains, auth);

  const upperCaseParameters = Object.fromEntries(Object.entries(parameters ?? {}).map(([name, value]) => [name.toUpperCase(), value]));
  const crsParameter = CRS_PARAMETERS.map((name) => upperCaseParameters[name]).find((value) => value !== undefined);
  const params = Object.fromEntries(Object.entries({ ...upperCaseParameters, LAYERS: layers }).filter(([name]) => !CRS_PARAMETERS.includes(name)));

  const projection = (crsParameter as string | undefined) ?? crs ?? srs ?? (tilingScheme && TILING_SCHEME_TO_PROJECTION[tilingScheme]);
  const hasCustomGrid = rectangle !== undefined || tileWidth !== 256 || tileHeight !== 256 || minimumLevel > 0 || maximumLevel !== undefined;
  const tileGrid = hasCustomGrid
    ? createTileGrid(projection ?? Proj.WEB_MERCATOR, rectangle, { minZoom: minimumLevel, maxZoom: maximumLevel, tileSize: [tileWidth, tileHeight] })
    : undefined;

  return {
    ...getWMSOptions({ url, attributions: credit, params, projection, tileGrid }),
    ...(urls && { urls }),
  };
};

/**
 * The `rectangle` of the options as an extent in the projection of the map view, for the `extent` of the OL layer.
 * The `extent` of a tile grid only stops tiles outside of it from being requested: the tiles that cross its edge are still drawn
 * whole, only the layer `extent` clips the drawing. `undefined` when the options have no (usable) rectangle.
 */
export const adaptToOlLayerExtent = (options: MCOptions, viewProjection: string): Extent | undefined =>
  toOlExtent((options as { rectangle?: RectangleDeg }).rectangle, viewProjection);

/**
 * Converts `MCOptions` into OL source options of the given layer type; `null` for types OL has no adapter for.
 *
 * @throws when `options` are not valid for the type.
 */
export const adaptToOlOptions = (type: LayerType, options: MCOptions, auth?: InjectedAuth): XYZOptions | WMTSOptions | WMSOptions | null => {
  switch (type) {
    case ProtocolType.WMTS:
      return adaptToWMTSOptions(options as WmtsOptionsInput, auth);
    case ProtocolType.XYZ:
      return adaptToXYZOptions(options as XyzOptionsInput, auth);
    case ProtocolType.WMS:
      return adaptToWMSOptions(options as WmsOptionsInput, auth);
    default:
      return null;
  }
};

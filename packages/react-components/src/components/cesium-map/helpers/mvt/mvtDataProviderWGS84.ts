import {
  Axis,
  Cartographic,
  Cesium3DTileset,
  Ellipsoid,
  Empty3DTileContent,
  GeographicTilingScheme,
  Math as CesiumMath,
  Rectangle,
  Resource,
  RuntimeError,
  UrlTemplate3DTilesDataProvider,
  VectorGltf3DTileContent,
  decodeMVT,
  getAbsoluteUri,
  type Cesium3DTile,
  type HeightReference,
  type Scene,
} from 'cesium';
import buildVectorGltfFromMVTWGS84 from './buildVectorGltfFromMVTWGS84';
import PlaceLabelsWGS84 from './placeLabelsWGS84';

export interface MVTDataProviderWGS84ConstructorOptions {
  /** Minimum zoom level represented in the generated tileset. */
  minZoom?: number;
  /** Maximum zoom level represented in the generated tileset. */
  maxZoom?: number;
  /** Optional geographic extent in radians to constrain the generated tile tree. */
  extent?: Rectangle;
  /** MVT property name to use as feature ID. */
  featureIdProperty?: string;
  /** Drapes the decoded points, lines and polygons onto terrain and/or 3D Tiles. Requires `scene`. */
  heightReference?: HeightReference;
  /** The scene the generated tileset is rendered in, required when `heightReference` is a clamping value. */
  scene?: Scene;
  /**
   * 3D Tiles refinement strategy for the generated tileset. Defaults to `'REPLACE'` (matching Cesium's
   * own `MVTDataProvider`): exactly one zoom level renders per area, swapped out for its children once
   * they're all loaded. Set to `'ADD'` only if the tile server can return a tile failure Cesium is
   * unable to treat as "merely empty" (see the `refine` comment in `buildTileNode` for why that matters)
   * - `'ADD'` renders every loaded zoom level of an area simultaneously instead, trading visible overdraw
   * (each zoom's own, differently-simplified geometry can visibly not quite line up) for immunity to
   * that failure mode.
   */
  refine?: 'REPLACE' | 'ADD';
  /**
   * Drops polygon rings smaller than this many "pixels" at a nominal 256px-tile reference resolution
   * (see `BuildVectorGltfOptions.minPolygonAreaPixels` in buildVectorGltfFromMVTWGS84.ts). Real-world
   * landuse/administrative data is often a multipolygon of many disjoint parts, some tiny enough to
   * read as visual noise rather than real shapes - this filters those out per-tile before triangulating.
   * Opt-in: undefined/0 renders every ring regardless of size, same as if this option didn't exist.
   */
  minPolygonAreaPixels?: number;
  /**
   * Douglas-Peucker simplification tolerance, in this many "pixels" at a nominal 256px-tile reference
   * resolution (see `BuildVectorGltfOptions.simplifyTolerancePixels` in buildVectorGltfFromMVTWGS84.ts).
   * Reduces excess vertex density in polygon rings before triangulating. Opt-in: undefined/0 disables
   * it, same as if this option didn't exist.
   */
  simplifyTolerancePixels?: number;
  /**
   * Chaikin corner-cutting passes applied to every line feature's vertices before triangulating (see
   * `BuildVectorGltfOptions.lineSmoothingIterations` in buildVectorGltfFromMVTWGS84.ts). Mitigates a
   * visible "spiking" at sharp vertices - most noticeable on administrative boundaries at low zoom,
   * where the source geometry is simplified the most aggressively - caused by Cesium's polyline
   * widening having no miter limit. Opt-in: undefined/0 renders every line with its original vertices,
   * same as if this option didn't exist.
   */
  lineSmoothingIterations?: number;
  /**
   * Renders text labels for named point features decoded from the `place_labels` MVT source-layer
   * (city/town/village/... names, per Shortbread's schema) as a `LabelCollection` kept in sync with
   * this provider's own tile load/unload. `Cesium3DTileStyle` has no equivalent hook: the vector glTF
   * content this provider produces only evaluates `show`/`color`/`pointSize`/`lineWidth` from a style,
   * never `labelText`/`labelColor`/`font` (see PlaceLabelsWGS84 for why). Requires `scene` - silently
   * does nothing without it, same as `heightReference` clamping.
   */
  placeLabels?: boolean;
}

/**
 * WGS84 (EPSG:4326) counterpart of Cesium's `MVTDataProvider`
 * (@cesium/engine/Source/Scene/MVTDataProvider.js + UrlTemplate3DTilesDataProvider.js). Loads .mvt/.pbf
 * tiles published under an EPSG:4326 TileMatrixSet (e.g. OGC WorldCRS84Quad - 2 root tiles in X, 1 in Y),
 * converting them at runtime into 3D Tiles, the same way `MVTDataProvider` does for EPSG:3857 sources.
 *
 * Cesium's `MVTDataProvider` cannot be configured for EPSG:4326: both the runtime tileset-tree it builds
 * (`UrlTemplate3DTilesDataProvider#_initializeTileset`) and its tile-content decoding (`buildVectorGltfFromMVT`)
 * hard-code a `WebMercatorTilingScheme`, and neither is exposed as a constructor option. This class
 * reimplements both pieces against a `GeographicTilingScheme` instead; everything else (Cesium3DTileset
 * creation/lifecycle, `show`, `update`, `destroy`) is inherited unchanged from `UrlTemplate3DTilesDataProvider`.
 *
 * Like `MVTDataProvider`, this is not an `ImageryProvider`/`TerrainProvider`: it attaches to
 * `scene.primitives` (e.g. via `viewer.scene.primitives.add(provider)`), not `scene.imageryLayers`.
 *
 * Like `MVTDataProvider`, the whole tile tree between `minZoom` and `maxZoom` is materialized eagerly
 * (as real JS objects, synchronously) up front, not generated lazily - the node count grows roughly as
 * `rootTiles * 4^(maxZoom - minZoom)`, so a high `maxZoom` with no `extent` (the default covers the
 * whole globe) can be enormous. `fromUrl` rejects with a clear error instead of hanging the browser
 * when the estimate is too large (see `MAX_ESTIMATED_TILE_COUNT`) - pass a tighter `extent` and/or a
 * lower `maxZoom` to stay under it.
 *
 * `options.refine` (default `'REPLACE'`, matching `MVTDataProvider`) controls the generated tileset's
 * 3D Tiles refinement strategy - see the `refine` comment in `buildTileNode` below for the tradeoff
 * `'ADD'` exists for: tolerating a server that can return a tile request Cesium can never recognize as
 * merely "empty" (a genuinely failed/errored tile, or one whose failure response breaks HTTP semantics
 * that Cesium depends on to detect it), at the cost of visibly overlapping multiple zoom levels.
 *
 * @experimental Mirrors the @experimental status of Cesium's own MVTDataProvider.
 */
class MVTDataProviderWGS84 extends UrlTemplate3DTilesDataProvider {
  private readonly _mvtRefine: 'REPLACE' | 'ADD';
  private readonly _mvtMinPolygonAreaPixels: number | undefined;
  private readonly _mvtSimplifyTolerancePixels: number | undefined;
  private readonly _mvtLineSmoothingIterations: number | undefined;
  private readonly _placeLabels: PlaceLabelsWGS84 | undefined;

  public constructor(urlTemplate: Resource | string, options?: MVTDataProviderWGS84ConstructorOptions) {
    super(urlTemplate, options);
    this._mvtRefine = options?.refine ?? 'REPLACE';
    this._mvtMinPolygonAreaPixels = options?.minPolygonAreaPixels;
    this._mvtSimplifyTolerancePixels = options?.simplifyTolerancePixels;
    this._mvtLineSmoothingIterations = options?.lineSmoothingIterations;
    this._placeLabels = options?.placeLabels === true && options.scene !== undefined ? new PlaceLabelsWGS84(options.scene) : undefined;
  }

  /**
   * Creates an MVTDataProviderWGS84 from the specified URL template and options.
   *
   * @param url URL template, containing {z}, {x}, and {y} placeholders.
   * @param options Provider options.
   */
  public static async fromUrl(url: Resource | string, options?: MVTDataProviderWGS84ConstructorOptions): Promise<MVTDataProviderWGS84> {
    return super.fromUrl(url, options) as unknown as Promise<MVTDataProviderWGS84>;
  }

  protected _createTilesetLoadOptions(): Cesium3DTileset.ConstructorOptions {
    return {
      ...super._createTilesetLoadOptions(),
      skipLevelOfDetail: false,
      enablePick: true,
      featureIdLabel: 'featureId_0',
      instanceFeatureIdLabel: 'instanceFeatureId_0',
    };
  }

  protected _configureTileset(tileset: Cesium3DTileset): void {
    // `_modelUpAxis`/`_modelForwardAxis` are internal Cesium3DTileset fields with no public typings,
    // same as Cesium's own MVTDataProvider._configureTileset.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (tileset as any)._modelUpAxis = Axis.Z;
    (tileset as any)._modelForwardAxis = Axis.X;
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }

  protected _createCodec(): Record<string, unknown> {
    // `_featureIdProperty` is set by the base constructor but has no public getter.
    const featureIdProperty = (this as unknown as { _featureIdProperty?: string })._featureIdProperty;
    // Populated per-URI during `_initializeTileset` (see buildRuntimeTilesetJsonWGS84), so the exact
    // (z, x, y) used to build each tile's bounding volume can be recovered without re-parsing the
    // resolved URL - the URL template's own placeholder order (e.g. `{z}/{y}/{x}`) isn't necessarily
    // z/x/y left-to-right, so guessing from path position silently swaps x and y for such templates.
    const uriCoordinates = (this as unknown as { _mvtTileUriCoordinates?: Map<string, TileCoordinates> })._mvtTileUriCoordinates;
    return {
      contentType: 'mvt',
      // 500/502/503/504 are treated the same as 404/204: "no content for this tile", not a hard
      // failure - useful for a server that errors while generating a *specific* tile (e.g. a query bug
      // tripped only at some zoom levels) without also breaking its error response's HTTP semantics.
      // Note this can't be relied on alone: Cesium can only apply this policy when it actually receives
      // an HTTP status for the failed request (see Resource.js's `xhr.onload` vs `xhr.onerror` paths -
      // only `onload` constructs a `RequestErrorEvent` carrying `statusCode`). A server whose error
      // response itself fails at the network level - e.g. a `Content-Encoding` header that doesn't
      // match the actual (uncompressed) error body, surfacing as the browser's own
      // `net::ERR_CONTENT_DECODING_FAILED` - never gives Cesium a status to match against; against such
      // a server, only `options.refine: 'ADD'` (see MVTDataProviderWGS84ConstructorOptions) keeps this
      // provider working, since this policy alone can't help it.
      missingTilePolicy: { statusCodes: [404, 204, 500, 502, 503, 504] },
      createContent: async (tileset: Cesium3DTileset, tile: Cesium3DTile, resource: Resource, arrayBuffer: ArrayBuffer) => {
        const decodedTile = decodeMVT(arrayBuffer);
        const resolvedUri = resource.getUrlComponent(true);
        const tileCoordinates = uriCoordinates?.get(resolvedUri) ?? parseTileCoordinates(resolvedUri);
        this._placeLabels?.addTileLabels(tile, decodedTile, tileCoordinates);
        const glb = buildVectorGltfFromMVTWGS84(decodedTile, tileCoordinates, {
          featureIdProperty,
          minPolygonAreaPixels: this._mvtMinPolygonAreaPixels,
          simplifyTolerancePixels: this._mvtSimplifyTolerancePixels,
          lineSmoothingIterations: this._mvtLineSmoothingIterations,
        });
        if (glb === undefined) {
          if (!hasAnyDecodedFeatures(decodedTile)) {
            return new Empty3DTileContent(tileset, tile);
          }
          throw new RuntimeError('Decoded MVT tile did not produce vector glTF content.');
        }
        return VectorGltf3DTileContent.fromGltf(tileset, tile, resource, glb);
      },
    };
  }

  /**
   * Reimplements `UrlTemplate3DTilesDataProvider#_initializeTileset` against a `GeographicTilingScheme`
   * instead of the hard-coded `WebMercatorTilingScheme`. `_tileset`/`_tilesetJsonUrl` are the same
   * (untyped) private fields the base class reads from its own `show`/`update`/`destroy`/`tileset`
   * implementations, so setting them here keeps all of that inherited behavior working.
   */
  protected async _initializeTileset(): Promise<void> {
    const tileUriCoordinates = new Map<string, TileCoordinates>();
    const tilesetJson = buildRuntimeTilesetJsonWGS84(
      this.resource,
      this._createRuntimeTilesetOptions() as unknown as RuntimeTilesetOptions,
      this._mvtRefine,
      tileUriCoordinates
    );
    const tilesetBlob = new Blob([JSON.stringify(tilesetJson)], { type: 'application/json' });
    const tilesetUrl = URL.createObjectURL(tilesetBlob);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const self = this as any;
    self._tilesetJsonUrl = tilesetUrl;
    self._mvtTileUriCoordinates = tileUriCoordinates;

    let tileset: Cesium3DTileset;
    try {
      tileset = await Cesium3DTileset.fromUrl(tilesetUrl, this._createTilesetLoadOptions());
    } catch (error) {
      URL.revokeObjectURL(tilesetUrl);
      self._tilesetJsonUrl = undefined;
      throw error;
    }
    URL.revokeObjectURL(tilesetUrl);
    self._tilesetJsonUrl = undefined;

    self._tileset = tileset;
    this._configureTileset(tileset);
    (tileset as any)._runtimeContentCodec = this._createCodec();
    tileset.show = self._show;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    this._placeLabels?.attachToTileset(tileset);
  }

  /**
   * `UrlTemplate3DTilesDataProvider#destroy` (see the type-augmentation comment below) has no notion of
   * `_placeLabels`'s own `LabelCollection`, so it must be torn down here first.
   */
  public destroy(): void {
    this._placeLabels?.destroy();
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (UrlTemplate3DTilesDataProvider.prototype as any).destroy.call(this);
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }
}

export default MVTDataProviderWGS84;

// `UrlTemplate3DTilesDataProvider`'s bundled .d.ts declares `show`/`tileset` but omits
// `update`/`isDestroyed`/`destroy`, even though all three exist at runtime (same gap resium works
// around locally for `MVTDataProviderShape` - see node_modules/resium/src/MVTDataProvider/MVTDataProvider.ts).
// Augment locally so callers (e.g. a primitive-collection wrapper component) can type them.
export type MVTDataProviderWGS84Shape = MVTDataProviderWGS84 & {
  update: (frameState: unknown) => void;
  isDestroyed: () => boolean;
  destroy: () => void;
};

const DEFAULT_REGION_MINIMUM_HEIGHT = -1000.0;
const DEFAULT_REGION_MAXIMUM_HEIGHT = 10000.0;
const TILE_SIZE_PIXELS = 256.0;

const scratchTileRectangle = new Rectangle();
const scratchIntersectionRectangle = new Rectangle();

interface TilesetJsonRoot {
  boundingVolume?: { region: number[] };
  geometricError: number;
  refine: 'REPLACE' | 'ADD';
  content?: { uri: string };
  children?: TilesetJsonRoot[];
}

interface RuntimeTilesetOptions {
  minZoom: number;
  maxZoom: number;
  extent: Rectangle | undefined;
}

interface TileRange {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface TileCoordinates {
  tileZ: number;
  tileX: number;
  tileY: number;
}

// This provider (like Cesium's own MVTDataProvider/UrlTemplate3DTilesDataProvider) builds its entire
// runtime tileset JSON eagerly, as real JS objects, in one synchronous pass - there's no lazy/implicit
// tiling here. The node count grows as roughly rootTiles * 4^(maxZoom - minZoom): with the default
// full-globe extent, maxZoom 15 alone is on the order of billions of nodes, which never finishes and
// hangs the tab rather than just being slow. Fail fast instead, with guidance on how to fix it.
const MAX_ESTIMATED_TILE_COUNT = 250_000;

function estimateMaxTileCount(rootTileCount: number, levels: number): number {
  // Geometric series rootTileCount * (4^0 + 4^1 + ... + 4^levels) - the worst case where every tile at
  // every level from minZoom to maxZoom intersects the extent (true whenever extent is the full globe).
  let total = 0;
  let levelCount = rootTileCount;
  for (let i = 0; i <= levels; i++) {
    total += levelCount;
    levelCount *= 4;
  }
  return total;
}

function buildRuntimeTilesetJsonWGS84(
  resource: Resource,
  options: RuntimeTilesetOptions,
  refine: 'REPLACE' | 'ADD',
  uriCoordinates: Map<string, TileCoordinates>
): Record<string, unknown> {
  const tilingScheme = new GeographicTilingScheme();
  const extent = options.extent !== undefined ? Rectangle.clone(options.extent) : Rectangle.clone(tilingScheme.rectangle);
  const minLevelRange = computeTileRangeForExtent(tilingScheme, extent, options.minZoom);

  const rootTileCount = (minLevelRange.maxX - minLevelRange.minX + 1) * (minLevelRange.maxY - minLevelRange.minY + 1);
  const estimatedTileCount = estimateMaxTileCount(rootTileCount, options.maxZoom - options.minZoom);
  if (estimatedTileCount > MAX_ESTIMATED_TILE_COUNT) {
    throw new RuntimeError(
      `MVTDataProviderWGS84: refusing to build a runtime tileset with an estimated ${estimatedTileCount.toLocaleString()} tiles ` +
        `(minZoom=${options.minZoom}, maxZoom=${options.maxZoom}, extent=${
          options.extent !== undefined ? 'constrained' : 'none - covers the whole globe'
        }). ` +
        'The tileset is built eagerly, all at once, so this would hang the browser rather than just being slow. ' +
        'Pass a smaller `extent` covering only the area you need, and/or lower `maxZoom` - each extra zoom level roughly ' +
        'quadruples the tile count.'
    );
  }

  const root: TilesetJsonRoot = {
    boundingVolume: {
      region: rectangleToRegion(extent),
    },
    // Root has no renderable content, so keep a coarse error to ensure
    // refinement reaches the first renderable zoom even when minZoom is high.
    geometricError: computeGeometricError(tilingScheme, 0),
    refine: refine,
    children: [],
  };
  for (let y = minLevelRange.minY; y <= minLevelRange.maxY; y++) {
    for (let x = minLevelRange.minX; x <= minLevelRange.maxX; x++) {
      const child = buildTileNode(tilingScheme, resource, extent, options.minZoom, options.maxZoom, refine, x, y, uriCoordinates);
      if (child !== undefined) {
        root.children?.push(child);
      }
    }
  }
  if (root.children?.length === 0) {
    root.geometricError = 0.0;
  }
  return {
    asset: {
      version: '1.1',
    },
    geometricError: root.geometricError,
    root: root,
  };
}

function buildTileNode(
  tilingScheme: GeographicTilingScheme,
  resource: Resource,
  extent: Rectangle,
  level: number,
  maxZoom: number,
  refine: 'REPLACE' | 'ADD',
  x: number,
  y: number,
  uriCoordinates: Map<string, TileCoordinates>
): TilesetJsonRoot | undefined {
  if (!tileIntersectsExtent(tilingScheme, level, x, y, extent, scratchTileRectangle, scratchIntersectionRectangle)) {
    return undefined;
  }
  const tileRectangle = tilingScheme.tileXYToRectangle(x, y, level, new Rectangle());

  const node: TilesetJsonRoot = {
    boundingVolume: {
      region: rectangleToRegion(tileRectangle),
    },
    geometricError: level < maxZoom ? computeGeometricError(tilingScheme, level) : 0.0,
    // With REPLACE (the default - see MVTDataProviderWGS84ConstructorOptions.refine), exactly one LOD
    // renders per area. With ADD, every loaded ancestor/descendant of a given area renders simultaneously
    // instead - which visibly stacks each zoom level's own, differently-simplified geometry (e.g. a small
    // island's coastline landing in a slightly different place at each zoom) - accepted only because ADD
    // tolerates a server that REPLACE can't: REPLACE only advances past a tile once ALL of its children
    // have successfully loaded content (see Cesium3DTilesetBaseTraversal#updateAndPushChildren's
    // `checkRefines`/`refines` chain), so a *permanently* failing tile - one `missingTilePolicy.statusCodes`
    // above can't recognize as merely empty, e.g. because its error response breaks the HTTP semantics
    // Cesium relies on to detect it (surfacing as the browser's own `net::ERR_CONTENT_DECODING_FAILED`
    // instead of a readable status) - would otherwise block every descendant of that tile from ever being
    // selected, however successfully the rest of the subtree loads.
    refine: refine,
    content: {
      uri: resolveTileUrl(resource, level, x, y, uriCoordinates),
    },
  };
  if (level >= maxZoom) {
    return node;
  }
  const childLevel = level + 1;
  const children: TilesetJsonRoot[] = [];
  for (let childY = y * 2; childY <= y * 2 + 1; childY++) {
    for (let childX = x * 2; childX <= x * 2 + 1; childX++) {
      const child = buildTileNode(tilingScheme, resource, extent, childLevel, maxZoom, refine, childX, childY, uriCoordinates);
      if (child !== undefined) {
        children.push(child);
      }
    }
  }
  if (children.length > 0) {
    node.children = children;
  } else {
    node.geometricError = 0.0;
  }
  return node;
}

function resolveTileUrl(resource: Resource, level: number, x: number, y: number, uriCoordinates: Map<string, TileCoordinates>): string {
  const template = resource.url;
  const tileUrl = template.replace(/\{z\}/gi, `${level}`).replace(/\{x\}/gi, `${x}`).replace(/\{y\}/gi, `${y}`);
  const absoluteUri = getAbsoluteUri(tileUrl);
  // Recorded so `_createCodec`'s `createContent` can recover the exact (z, x, y) it was built from,
  // regardless of where the template placed `{x}`/`{y}` in the resolved URL.
  uriCoordinates.set(absoluteUri, { tileZ: level, tileX: x, tileY: y });
  return absoluteUri;
}

/**
 * Ground resolution based geometric error, generalized from the WebMercatorTilingScheme-specific
 * `EARTH_CIRCUMFERENCE_METERS / ((1 << level) * WEB_MERCATOR_TILE_SIZE)` formula used by
 * UrlTemplate3DTilesDataProvider: tile width in meters at a level is the ellipsoid's circumference
 * scaled by the tiling scheme's own rectangle width and X-tile count at that level, which correctly
 * accounts for GeographicTilingScheme's 2 (not 1) root tiles along X.
 */
function computeGeometricError(tilingScheme: GeographicTilingScheme, level: number): number {
  const tileWidthRadians = tilingScheme.rectangle.width / tilingScheme.getNumberOfXTilesAtLevel(level);
  const tileWidthMeters = Ellipsoid.WGS84.maximumRadius * tileWidthRadians;
  return tileWidthMeters / TILE_SIZE_PIXELS;
}

function rectangleToRegion(rectangle: Rectangle): number[] {
  return [rectangle.west, rectangle.south, rectangle.east, rectangle.north, DEFAULT_REGION_MINIMUM_HEIGHT, DEFAULT_REGION_MAXIMUM_HEIGHT];
}

function computeTileRangeForExtent(tilingScheme: GeographicTilingScheme, extent: Rectangle, level: number): TileRange {
  const maxXIndex = tilingScheme.getNumberOfXTilesAtLevel(level) - 1;
  const maxYIndex = tilingScheme.getNumberOfYTilesAtLevel(level) - 1;
  const nw = Cartographic.fromRadians(extent.west, extent.north);
  const se = Cartographic.fromRadians(extent.east, extent.south);
  const nwTile = tilingScheme.positionToTileXY(nw, level);
  const seTile = tilingScheme.positionToTileXY(se, level);
  if (nwTile === undefined || seTile === undefined || extent.west > extent.east) {
    return {
      minX: 0,
      maxX: maxXIndex,
      minY: 0,
      maxY: maxYIndex,
    };
  }
  return {
    minX: CesiumMath.clamp(Math.min(nwTile.x, seTile.x), 0, maxXIndex),
    maxX: CesiumMath.clamp(Math.max(nwTile.x, seTile.x), 0, maxXIndex),
    minY: CesiumMath.clamp(Math.min(nwTile.y, seTile.y), 0, maxYIndex),
    maxY: CesiumMath.clamp(Math.max(nwTile.y, seTile.y), 0, maxYIndex),
  };
}

function tileIntersectsExtent(
  tilingScheme: GeographicTilingScheme,
  level: number,
  x: number,
  y: number,
  extent: Rectangle,
  tileRectangleScratch: Rectangle,
  intersectionScratch: Rectangle
): boolean {
  const tileRectangle = tilingScheme.tileXYToRectangle(x, y, level, tileRectangleScratch);
  return Rectangle.intersection(tileRectangle, extent, intersectionScratch) !== undefined;
}

const malformedTileUrlWarned = new Set<string>();

/**
 * Fallback used only if a resolved tile URL is somehow missing from the `uriCoordinates` map built
 * during `_initializeTileset` (e.g. a `resource.getUrlComponent(true)` re-encoding mismatch).
 * Assumes the URL's first three path-position numbers are z/x/y in that order, which is only a
 * guess - it cannot know the URL template's actual placeholder order (e.g. `{z}/{y}/{x}`).
 */
function parseTileCoordinates(url: string): TileCoordinates {
  const match = url.match(/\/(\d+)\/(\d+)\/(\d+)(?:\.[^/?#]+)?(?:[?#]|$)/i);
  if (match === null) {
    if (!malformedTileUrlWarned.has(url)) {
      malformedTileUrlWarned.add(url);
      console.warn(`MVTDataProviderWGS84: MVT tile URL did not match /{z}/{x}/{y} pattern. Falling back to z/x/y = 0/0/0. URL: ${url}`);
    }
    return { tileZ: 0, tileX: 0, tileY: 0 };
  }
  return {
    tileZ: parseInt(match[1], 10),
    tileX: parseInt(match[2], 10),
    tileY: parseInt(match[3], 10),
  };
}

function hasAnyDecodedFeatures(decodedTile: { layers: Array<{ features: Array<unknown> }> }): boolean {
  const layers = decodedTile.layers;
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].features.length > 0) {
      return true;
    }
  }
  return false;
}

import {
  Cartesian3,
  Color,
  DistanceDisplayCondition,
  GeographicTilingScheme,
  HorizontalOrigin,
  Label,
  LabelCollection,
  LabelStyle,
  VerticalOrigin,
  type Cesium3DTile,
  type Cesium3DTileset,
  type DecodedMVT,
  type DecodedMVTPoint,
  type Scene,
} from 'cesium';

/** MVT source-layer this renders labels for (Shortbread's place-name points: city/town/village/...). */
const SOURCE_LAYER = 'place_labels';

// Cesium's Label lays out glyphs one at a time using left-to-right advance widths; for Hebrew/Arabic
// text that produces both the wrong (LTR) reading order and visibly broken glyph placement - overlapping,
// offset-looking "doubled" characters - because that per-glyph math doesn't match how the browser's own
// bidi/shaping would actually draw the string. `enableRightToLeftDetection` makes Label detect RTL runs
// itself and reverse them before laying out glyphs (see Label.js's `reverseRtl`), fixing both at once;
// English names stay LTR. This is a static, Cesium-wide setting (not a per-label option), so it belongs
// at module load rather than as a constructor option - setting it more than once is harmless.
Label.enableRightToLeftDetection = true;

const tilingScheme = new GeographicTilingScheme();
const tilingRectangle = tilingScheme.rectangle;

/**
 * Per-"kind" label appearance, read off shadow.local.json's `place_labels` symbol layers
 * (label-place-city, label-place-village, ...): `fontSizePx` approximates each layer's zoom-interpolated
 * `text-size` with its last (largest) stop, and `uppercase` mirrors layers that set `text-transform:
 * "uppercase"` (neighbourhood/quarter/suburb only). `minzoom` is that layer's Shortbread `minzoom`,
 * converted to a camera-height `DistanceDisplayCondition` far bound - see `heightForZoom`.
 */
interface PlaceKindConfig {
  minzoom: number;
  fontSizePx: number;
  uppercase: boolean;
}

const KIND_CONFIG: Record<string, PlaceKindConfig> = {
  capital: { minzoom: 5, fontSizePx: 16, uppercase: false },
  state_capital: { minzoom: 6, fontSizePx: 15, uppercase: false },
  city: { minzoom: 7, fontSizePx: 14, uppercase: false },
  town: { minzoom: 9, fontSizePx: 14, uppercase: false },
  village: { minzoom: 11, fontSizePx: 14, uppercase: false },
  suburb: { minzoom: 11, fontSizePx: 14, uppercase: true },
  hamlet: { minzoom: 13, fontSizePx: 14, uppercase: false },
  quarter: { minzoom: 13, fontSizePx: 13, uppercase: true },
  neighbourhood: { minzoom: 14, fontSizePx: 12, uppercase: true },
};
const DEFAULT_KIND_CONFIG: PlaceKindConfig = KIND_CONFIG.neighbourhood;

// rgb(210,210,210) / rgba(51,51,51,0.8) from shadow.local.json's place_labels text-color/text-halo-color.
const TEXT_COLOR = Color.fromBytes(210, 210, 210);
const HALO_COLOR = Color.fromBytes(51, 51, 51, Math.round(0.8 * 255));
const HALO_WIDTH = 2;

const EQUATORIAL_CIRCUMFERENCE_METERS = 40_075_016.686;

/**
 * Approximates "camera height at which a MapLibre zoom level is reached" as a halving-per-level curve
 * anchored at the equatorial circumference for zoom 0. A `LabelCollection` has no notion of the source
 * style's zoom at all, so this only needs to be in the right ballpark for `DistanceDisplayCondition` to
 * roughly reproduce each place kind's Shortbread `minzoom` (city labels appearing before village labels
 * as the camera zooms in) - it is not a precise slippy-map zoom<->height conversion.
 */
function heightForZoom(zoom: number): number {
  return EQUATORIAL_CIRCUMFERENCE_METERS / Math.pow(2, zoom);
}

function tilePointToWorldPosition(point: DecodedMVTPoint, tileX: number, tileY: number, tileZ: number, extent: number): Cartesian3 {
  const numX = tilingScheme.getNumberOfXTilesAtLevel(tileZ);
  const numY = tilingScheme.getNumberOfYTilesAtLevel(tileZ);
  const u = (tileX + point.x / extent) / numX;
  const v = (tileY + point.y / extent) / numY;
  const lon = tilingRectangle.west + u * tilingRectangle.width;
  const lat = tilingRectangle.north - v * tilingRectangle.height;
  return Cartesian3.fromRadians(lon, lat, 0);
}

/**
 * Renders text labels for Shortbread's `place_labels` MVT source-layer (city/town/village/... names).
 *
 * `Cesium3DTileStyle` has no hook for this: `VectorGltf3DTileContent#applyStyle` (the content type
 * `MVTDataProviderWGS84` produces) only evaluates `show`, `color`, `pointSize`/`pointOutline*` (for
 * point features) and `lineWidth` (for line features) - `labelText`/`labelColor`/`font` are never read
 * for this content type, only for point-cloud (pnts) tileset features. So instead of a style property,
 * this is a separate `LabelCollection` kept in sync with the owning provider's own tile lifecycle.
 *
 * Visibility is synced to *tile selection*, not merely tile content existing: with `refine: 'REPLACE'`,
 * a tile whose children have taken over is simply no longer selected for rendering, but its content
 * (and, before this, its labels) can stay resident in the tileset's cache well after that - MVT sources
 * also commonly repeat the same named point across zoom levels at very slightly different tile-local
 * coordinates. Without this sync, both the outgoing (still-cached) tile's label and the new tile's label
 * for the same place render simultaneously a pixel or two apart, i.e. exactly the "duplicated, blurry"
 * look.
 *
 * The reconciliation happens in `scene.postUpdate`, not by hiding everything up front in `preUpdate`:
 * this `LabelCollection` is added to `scene.primitives` independently of (and, in practice, before) the
 * `Cesium3DTileset` it's tracking, so within a single frame there's no guaranteed ordering between "this
 * label collection builds its render commands for the frame" and "the tileset's traversal raises
 * `tileVisible` for the tiles it selected". Hiding-then-re-showing within that same frame is a race that
 * can lose (labels get built as hidden and stay that way) - instead, `tileVisible` only records which
 * tiles were selected into a set, and `postUpdate` (which runs once, after every primitive including the
 * tileset has already updated for this frame) is what actually flips `show`. That result is one frame
 * stale by the time it's read, which is imperceptible under continuous rendering, but never racy.
 * `tileUnload` (content evicted from cache) is the separate, much rarer point where labels are destroyed
 * outright instead of just hidden.
 */
class PlaceLabelsWGS84 {
  private readonly _scene: Scene;
  private readonly _labels: LabelCollection;
  private readonly _labelsByTile = new Map<Cesium3DTile, Label[]>();
  private readonly _visibleTilesThisFrame = new Set<Cesium3DTile>();
  private _removeTileVisible: (() => void) | undefined;
  private _removeTileUnload: (() => void) | undefined;
  private _removePostUpdate: (() => void) | undefined;

  public constructor(scene: Scene) {
    this._scene = scene;
    this._labels = scene.primitives.add(new LabelCollection());
  }

  /** Wires this instance to `tileset`'s selection/load lifecycle - see the class doc comment for why. */
  public attachToTileset(tileset: Cesium3DTileset): void {
    this._removeTileVisible = tileset.tileVisible.addEventListener((tile: Cesium3DTile) => this._visibleTilesThisFrame.add(tile));
    this._removeTileUnload = tileset.tileUnload.addEventListener((tile: Cesium3DTile) => this.removeTileLabels(tile));
    this._removePostUpdate = this._scene.postUpdate.addEventListener(() => this._reconcileVisibility());
  }

  private _reconcileVisibility(): void {
    for (const [tile, labels] of this._labelsByTile) {
      const shouldShow = this._visibleTilesThisFrame.has(tile);
      for (const label of labels) {
        if (label.show !== shouldShow) {
          label.show = shouldShow;
        }
      }
    }
    this._visibleTilesThisFrame.clear();
  }

  public addTileLabels(tile: Cesium3DTile, decoded: DecodedMVT, tileCoordinates: { tileX: number; tileY: number; tileZ: number }): void {
    const layer = decoded.layers.find((candidate) => candidate.name === SOURCE_LAYER);
    if (layer === undefined || layer.features.length === 0) {
      return;
    }

    const created: Label[] = [];
    for (const feature of layer.features) {
      if (feature.type !== 'Point') {
        continue;
      }
      const properties = feature.properties ?? {};
      const text = properties.name_he ?? properties.name_en ?? properties.name;
      if (text === undefined || text === '') {
        continue;
      }
      const kind = properties.kind;
      const config = (typeof kind === 'string' ? KIND_CONFIG[kind] : undefined) ?? DEFAULT_KIND_CONFIG;
      const labelText = config.uppercase ? String(text).toUpperCase() : String(text);

      const points = feature.geometry as DecodedMVTPoint[];
      for (const point of points) {
        const position = tilePointToWorldPosition(point, tileCoordinates.tileX, tileCoordinates.tileY, tileCoordinates.tileZ, layer.extent);
        const label = this._labels.add({
          position,
          text: labelText,
          font: `${config.fontSizePx}px sans-serif`,
          fillColor: TEXT_COLOR,
          outlineColor: HALO_COLOR,
          outlineWidth: HALO_WIDTH,
          style: LabelStyle.FILL_AND_OUTLINE,
          horizontalOrigin: HorizontalOrigin.CENTER,
          verticalOrigin: VerticalOrigin.CENTER,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new DistanceDisplayCondition(0.0, heightForZoom(config.minzoom)),
          // Starts hidden - `_reconcileVisibility` (via `postUpdate`) is what decides the real value,
          // once `tileVisible` has actually confirmed this tile is selected for the current frame.
          show: false,
        });
        created.push(label);
      }
    }

    if (created.length > 0) {
      this._labelsByTile.set(tile, created);
    }
  }

  public removeTileLabels(tile: Cesium3DTile): void {
    const labels = this._labelsByTile.get(tile);
    if (labels === undefined) {
      return;
    }
    for (const label of labels) {
      this._labels.remove(label);
    }
    this._labelsByTile.delete(tile);
  }

  public destroy(): void {
    this._removeTileVisible?.();
    this._removeTileUnload?.();
    this._removePostUpdate?.();
    this._labelsByTile.clear();
    this._visibleTilesThisFrame.clear();
    this._scene.primitives.remove(this._labels);
  }
}

export default PlaceLabelsWGS84;

import {
  Cartesian2,
  Cartesian3,
  ComponentDatatype,
  GeographicTilingScheme,
  MetadataType,
  PolygonPipeline,
  PrimitiveType,
  Rectangle,
  WebGLConstants,
  type DecodedMVT,
  type DecodedMVTFeature,
  type DecodedMVTPoint,
} from 'cesium';

/**
 * Geographic (EPSG:4326 / WGS84 TileMatrixSet) counterpart of Cesium's `buildVectorGltfFromMVT`
 * (@cesium/engine/Source/Scene/buildVectorGltfFromMVT.js). That function hard-codes a
 * `WebMercatorTilingScheme` to place tile-local MVT coordinates on the globe, which only produces
 * correct results for EPSG:3857 tile sources. This is a straight port with the tiling scheme and
 * the tile-local-to-lon/lat conversion swapped for the equirectangular (Plate Carree) math used by
 * the WGS84 tile matrix set - everything else (triangulation, glTF/GLB assembly) is unchanged, except
 * feature IDs and EXT_structural_metadata property tables are scoped per MVT layer instead of pooled
 * across the whole tile (see the comment on `schemaClasses`/`propertyTables` below for why).
 */

const DEFAULT_HEIGHT = 0;

const scratchWorld = new Cartesian3();
const scratchLocal = new Cartesian3();
const tilingScheme = new GeographicTilingScheme();
const tilingRectangle = tilingScheme.rectangle;

export interface BuildVectorGltfOptions {
  featureIdProperty?: string;
  /**
   * Drops polygon rings smaller than this, in "pixels" at a nominal 256px-tile reference resolution
   * (independent of the MVT layer's own `extent`, which is commonly 4096 but not guaranteed to be).
   * Real-world landuse/administrative polygon data (forests especially) is frequently a multipolygon
   * of many disjoint parts, including plenty that are only a handful of tile units across - each one
   * still renders as its own small, correctly-shaped patch, but at typical zoom levels they're too
   * small to read as anything but visual noise (a "jagged"/"fragmented" look). Opt-in: defaults to 0
   * (disabled - every ring renders, exactly as if this option didn't exist) so existing callers that
   * don't pass it see no change in behavior.
   */
  minPolygonAreaPixels?: number;
  /**
   * Douglas-Peucker simplification tolerance for polygon rings, in "pixels" at the same nominal 256px
   * reference tile as `minPolygonAreaPixels`. Reduces point density/detail on rings that have far more
   * vertices than are visually meaningful at typical render scale (administrative and landuse polygons
   * are frequently over-detailed for this). Opt-in: defaults to 0 (disabled - rings render with their
   * original vertices, exactly as if this option didn't exist) so existing callers that don't pass it
   * see no change in behavior.
   */
  simplifyTolerancePixels?: number;
  /**
   * Chaikin corner-cutting passes applied to every `LineString` feature's tile-local vertices before
   * they're triangulated into line quads. Cesium's polyline widening (the same miter-join math every
   * Cesium polyline uses, in BufferPolylineMaterialVS.glsl's `getPolylineWindowCoordinatesEC`) has no
   * miter limit: a sharp vertex angle makes the join overshoot into a visible spike, and that spike gets
   * worse the more aggressively a line's source geometry was simplified for its zoom (administrative
   * boundaries especially - a country border can simplify to a handful of long, sharply-angled segments
   * at low zoom). Each pass replaces every interior vertex with two points 1/4 and 3/4 along its
   * neighboring edges (the endpoints are kept as-is, so the line doesn't visibly shrink back from where
   * it should start/end), which is a no-op on an already-straight run and only meaningfully rounds off
   * actually-sharp corners. Opt-in: defaults to 0 (disabled - lines render with their original vertices,
   * exactly as if this option didn't exist) so existing callers that don't pass it see no change.
   */
  lineSmoothingIterations?: number;
}

/** @see BuildVectorGltfOptions.minPolygonAreaPixels */
const DEFAULT_MIN_POLYGON_AREA_PIXELS = 0;
/** @see BuildVectorGltfOptions.simplifyTolerancePixels */
const DEFAULT_SIMPLIFY_TOLERANCE_PIXELS = 0;
/** @see BuildVectorGltfOptions.lineSmoothingIterations */
const DEFAULT_LINE_SMOOTHING_ITERATIONS = 0;
/** Reference tile pixel size `minPolygonAreaPixels`/`simplifyTolerancePixels` are expressed against. */
const REFERENCE_TILE_PIXELS = 256;

interface PolygonRingGroup {
  outerRing: DecodedMVTPoint[];
  holes: DecodedMVTPoint[][];
}

/**
 * Build a vector glTF payload from decoded tile-local vector geometry, projecting tile-local
 * coordinates through the WGS84 (EPSG:4326) geographic tiling scheme instead of Web Mercator.
 * Each MVT layer produces a separate glTF node (named after the layer).
 */
function buildVectorGltfFromMVTWGS84(
  decoded: DecodedMVT,
  tileCoordinates: { tileX: number; tileY: number; tileZ: number },
  options?: BuildVectorGltfOptions
): Uint8Array | undefined {
  const tileX = tileCoordinates.tileX;
  const tileY = tileCoordinates.tileY;
  const tileZ = tileCoordinates.tileZ;
  const featureIdProperty = options?.featureIdProperty;
  const minPolygonAreaPixels = options?.minPolygonAreaPixels ?? DEFAULT_MIN_POLYGON_AREA_PIXELS;
  const simplifyTolerancePixels = options?.simplifyTolerancePixels ?? DEFAULT_SIMPLIFY_TOLERANCE_PIXELS;
  const lineSmoothingIterations = options?.lineSmoothingIterations ?? DEFAULT_LINE_SMOOTHING_ITERATIONS;

  const tileRect = tilingScheme.tileXYToRectangle(tileX, tileY, tileZ);
  const tileCenter = Rectangle.center(tileRect);
  const origin = Cartesian3.fromRadians(tileCenter.longitude, tileCenter.latitude, 0);
  // Maximum value of a Uint32; used as sentinel for null feature IDs and primitive restart indices.
  const MAX_INT_U32 = 0xffffffff;
  const nullFeatureId = MAX_INT_U32;
  const primitiveRestartIndex = MAX_INT_U32;

  const bufferViews: Record<string, unknown>[] = [];
  const accessors: Record<string, unknown>[] = [];
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  let hasAnyFeatureIds = false;

  // One schema class + property table per MVT layer that has properties, populated as layers are
  // processed below - deliberately NOT one combined table for the whole tile. A single MVT tile
  // commonly holds several unrelated layers (e.g. "boundaries", "ocean", "buildings", "places"), each
  // with its own property set. Pooling them into one table means every feature gets the *union* of
  // every layer's properties: a "boundaries" feature would pick up an empty "" for a "places" layer's
  // `name`/`name_en` and a NaN for a "buildings" layer's `way_area`, since it has neither - exactly the
  // "looks bad" symptom of unrelated, blank/NaN properties showing up on a feature that never had them.
  const schemaClasses: Record<string, unknown> = {};
  const propertyTables: Record<string, unknown>[] = [];

  function addPadding(): void {
    const padding = (4 - (byteLength % 4)) % 4;
    if (padding > 0) {
      chunks.push(new Uint8Array(padding));
      byteLength += padding;
    }
  }

  function addBufferView(typedArray: ArrayBufferView, target: number): number {
    addPadding();
    const byteOffset = byteLength;
    chunks.push(new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength));
    byteLength += typedArray.byteLength;
    const bufferViewIndex = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset: byteOffset,
      byteLength: typedArray.byteLength,
      target: target,
    });
    return bufferViewIndex;
  }

  function addAccessor(
    typedArray: Float32Array | Uint32Array,
    options: { type: string; componentType: number; target: number; min?: number[]; max?: number[] }
  ): number {
    const bufferView = addBufferView(typedArray, options.target);
    const componentCount = MetadataType.getComponentCount(options.type);
    const accessor: Record<string, unknown> = {
      bufferView: bufferView,
      byteOffset: 0,
      componentType: options.componentType,
      count: typedArray.length / componentCount,
      type: options.type,
    };
    if (options.min !== undefined) {
      accessor.min = options.min;
    }
    if (options.max !== undefined) {
      accessor.max = options.max;
    }
    const accessorIndex = accessors.length;
    accessors.push(accessor);
    return accessorIndex;
  }

  function computeMinMax(positions: Float32Array): { min: number[]; max: number[] } {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (z < minZ) {
        minZ = z;
      }
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
      if (z > maxZ) {
        maxZ = z;
      }
    }

    return {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
    };
  }

  function addFeatureIdsToPrimitive(
    attributes: Record<string, unknown>,
    extensions: Record<string, unknown>,
    featureIdValues: number[],
    featureCount: number,
    propertyTableIndex: number | undefined
  ): void {
    if (featureIdValues.length === 0) {
      return;
    }
    hasAnyFeatureIds = true;
    const featureIds = new Uint32Array(featureIdValues);
    const featureAccessor = addAccessor(featureIds, {
      type: 'SCALAR',
      componentType: ComponentDatatype.UNSIGNED_INT,
      target: WebGLConstants.ARRAY_BUFFER,
    });
    attributes._FEATURE_ID_0 = featureAccessor;
    const featureIdDef: Record<string, unknown> = {
      featureCount: featureCount,
      nullFeatureId: nullFeatureId,
      attribute: 0,
    };
    if (propertyTableIndex !== undefined) {
      featureIdDef.propertyTable = propertyTableIndex;
    }
    extensions.EXT_mesh_features = {
      featureIds: [featureIdDef],
    };
  }

  /** Adds a raw buffer view for metadata (no accessor target). */
  function addMetadataBufferView(bytes: Uint8Array, alignment?: number): number {
    alignment = alignment ?? 4;
    // Align to the required boundary.
    const pad = (alignment - (byteLength % alignment)) % alignment;
    if (pad > 0) {
      chunks.push(new Uint8Array(pad));
      byteLength += pad;
    }
    const byteOffset = byteLength;
    chunks.push(bytes);
    byteLength += bytes.byteLength;
    const bufferViewIndex = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset: byteOffset,
      byteLength: bytes.byteLength,
    });
    return bufferViewIndex;
  }

  /**
   * Coerces a raw MVT property value to a finite number for a SCALAR metadata property. Real numbers
   * pass through as-is; numeric strings and bigints (MVT int64/sint64 values can decode as either,
   * depending on magnitude) are converted rather than discarded, so a genuinely numeric property like
   * `way_area` doesn't collapse to NaN just because of which JS type it happened to decode as.
   */
  function coerceToFiniteNumber(raw: unknown): number {
    if (typeof raw === 'number') {
      return Number.isFinite(raw) ? raw : NaN;
    }
    if (typeof raw === 'bigint') {
      return Number(raw);
    }
    if (typeof raw === 'string' && raw.trim() !== '') {
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : NaN;
    }
    return NaN;
  }

  /**
   * Builds one MVT layer's EXT_structural_metadata schema class + property table (scoped to just that
   * layer's own features), appends them to the tile-wide `schemaClasses`/`propertyTables`, and returns
   * the new table's index for `addFeatureIdsToPrimitive` to reference - or `undefined` if this layer's
   * features carry no properties worth describing.
   */
  function buildStructuralMetadataForLayer(
    layerName: string,
    layerIndex: number,
    featureProperties: Map<number, Record<string, unknown>>,
    featureCount: number
  ): number | undefined {
    if (featureProperties.size === 0) {
      return undefined;
    }

    // 1. Determine union of this layer's property names and infer types.
    const propertyTypes = new Map<string, string>();

    for (const props of featureProperties.values()) {
      for (const [key, value] of Object.entries(props)) {
        if (value === undefined) {
          continue;
        }
        const jsType = typeof value;
        let metaType: string;
        if (jsType === 'string') {
          metaType = 'STRING';
        } else if (jsType === 'number' || jsType === 'bigint') {
          metaType = 'SCALAR';
        } else if (jsType === 'boolean') {
          metaType = 'BOOLEAN';
        } else {
          // Objects/arrays: coerce to string
          metaType = 'STRING';
        }

        const existing = propertyTypes.get(key);
        if (existing === undefined) {
          propertyTypes.set(key, metaType);
        } else if (existing !== metaType) {
          // Mixed types: coerce to STRING
          propertyTypes.set(key, 'STRING');
        }
      }
    }

    if (propertyTypes.size === 0) {
      return undefined;
    }

    // 2. Build schema class properties.
    const classProperties: Record<string, unknown> = {};
    for (const [name, type] of propertyTypes) {
      if (type === 'SCALAR') {
        classProperties[name] = {
          type: 'SCALAR',
          componentType: 'FLOAT64',
        };
      } else if (type === 'BOOLEAN') {
        classProperties[name] = {
          type: 'BOOLEAN',
        };
      } else {
        classProperties[name] = {
          type: 'STRING',
        };
      }
    }

    // 3. Encode property values into binary buffers.
    const tableProperties: Record<string, unknown> = {};
    const count = featureCount;

    for (const [name, type] of propertyTypes) {
      if (type === 'SCALAR') {
        const values = new Float64Array(count);
        for (let i = 0; i < count; i++) {
          const props = featureProperties.get(i);
          values[i] = coerceToFiniteNumber(props?.[name]);
        }
        const bvIndex = addMetadataBufferView(new Uint8Array(values.buffer, values.byteOffset, values.byteLength), 8);
        tableProperties[name] = { values: bvIndex };
      } else if (type === 'BOOLEAN') {
        const byteCount = Math.ceil(count / 8);
        const values = new Uint8Array(byteCount);
        for (let i = 0; i < count; i++) {
          const props = featureProperties.get(i);
          const raw = props?.[name];
          if (raw) {
            values[i >> 3] |= 1 << (i & 7);
          }
        }
        const bvIndex = addMetadataBufferView(values);
        tableProperties[name] = { values: bvIndex };
      } else {
        // STRING encoding: values (UTF-8 bytes) + stringOffsets (Uint32)
        const encoder = new TextEncoder();
        const stringParts: Uint8Array[] = [];
        const offsets = new Uint32Array(count + 1);
        let totalBytes = 0;

        for (let i = 0; i < count; i++) {
          offsets[i] = totalBytes;
          const props = featureProperties.get(i);
          const raw = props?.[name];
          let str: string;
          if (raw === null || raw === undefined) {
            str = '';
          } else if (typeof raw === 'string') {
            str = raw;
          } else {
            str = String(raw);
          }
          const encoded = encoder.encode(str);
          stringParts.push(encoded);
          totalBytes += encoded.byteLength;
        }
        offsets[count] = totalBytes;

        // Concatenate string bytes
        const valuesBuffer = new Uint8Array(totalBytes);
        let writeOffset = 0;
        for (const part of stringParts) {
          valuesBuffer.set(part, writeOffset);
          writeOffset += part.byteLength;
        }

        const valuesBv = addMetadataBufferView(valuesBuffer);
        const offsetsBv = addMetadataBufferView(new Uint8Array(offsets.buffer, offsets.byteOffset, offsets.byteLength));
        tableProperties[name] = {
          values: valuesBv,
          stringOffsets: offsetsBv,
          stringOffsetType: 'UINT32',
        };
      }
    }

    // Class names must be unique tile-wide; layer names are usually already unique and identifier-safe,
    // but the index guarantees uniqueness and the character replacement guards against exotic names.
    const className = `mvt_layer_${layerIndex}_${(layerName || 'layer').replace(/[^A-Za-z0-9_]/g, '_')}`;
    schemaClasses[className] = { properties: classProperties };
    const tableIndex = propertyTables.length;
    propertyTables.push({
      class: className,
      count: count,
      properties: tableProperties,
    });
    return tableIndex;
  }

  const meshes: Record<string, unknown>[] = [];
  const nodes: Record<string, unknown>[] = [];
  const translation = [origin.x, origin.y, origin.z];

  let layerIndex = 0;
  for (const layer of decoded.layers) {
    const currentLayerIndex = layerIndex++;
    const extent = layer.extent;
    // See BuildVectorGltfOptions.minPolygonAreaPixels/simplifyTolerancePixels - both expressed per a
    // 256px reference tile, then scaled by this layer's own extent (tile-local units per pixel =
    // extent / 256); minRingArea scales as pixels squared (it's an area), simplifyTolerance linearly
    // (it's a distance).
    const minRingArea = minPolygonAreaPixels * (extent / REFERENCE_TILE_PIXELS) ** 2;
    const simplifyTolerance = simplifyTolerancePixels * (extent / REFERENCE_TILE_PIXELS);

    // Scoped per layer (not shared tile-wide) so feature IDs and their properties never mix across
    // unrelated layers - see the comment on `schemaClasses`/`propertyTables` above.
    const featureIdLookup = new Map<string | DecodedMVTFeature, number>();
    const featureProperties = new Map<number, Record<string, unknown>>();

    const pointPositions: number[] = [];
    const pointFeatureIds: number[] = [];

    const linePositions: number[] = [];
    const lineFeatureIds: number[] = [];
    const lineIndices: number[] = [];
    let lineCount = 0;

    const polygonPositions: number[] = [];
    const polygonFeatureIds: number[] = [];
    const polygonIndices: number[] = [];
    const polygonAttributeOffsets: number[] = [];
    const polygonIndicesOffsets: number[] = [];
    const polygonHoleCounts: number[] = [];
    const polygonHoleOffsets: number[] = [];
    let polygonCount = 0;

    for (const feature of layer.features) {
      const currentFeatureId = featureIdProperty
        ? mapFeatureIdFromProperty(feature, featureIdProperty, featureIdLookup as unknown as Map<string, number>) ?? nullFeatureId
        : getOrAssignAutoFeatureId(feature, featureIdLookup as unknown as Map<DecodedMVTFeature, number>);

      // Collect properties for the property table (first-seen wins for ID collisions).
      if (currentFeatureId !== nullFeatureId && !featureProperties.has(currentFeatureId)) {
        const props: Record<string, unknown> = Object.assign({}, feature.properties);
        props._layer = layer.name ?? '';
        featureProperties.set(currentFeatureId, props);
      }

      if (feature.type === 'Point') {
        const points = feature.geometry as DecodedMVTPoint[];
        for (const point of points) {
          appendTilePointAsLocalPosition(point, tileX, tileY, tileZ, extent, DEFAULT_HEIGHT, origin, pointPositions);
          pointFeatureIds.push(currentFeatureId);
        }
        continue;
      }

      if (feature.type === 'LineString') {
        const lines = feature.geometry as DecodedMVTPoint[][];
        for (const rawLine of lines) {
          const line = lineSmoothingIterations > 0 ? chaikinSmoothLine(rawLine, lineSmoothingIterations) : rawLine;
          const lineStart = linePositions.length / 3;
          for (const point of line) {
            appendTilePointAsLocalPosition(point, tileX, tileY, tileZ, extent, DEFAULT_HEIGHT, origin, linePositions);
            lineFeatureIds.push(currentFeatureId);
          }

          for (let i = 0; i < line.length; i++) {
            lineIndices.push(lineStart + i);
          }
          lineIndices.push(primitiveRestartIndex);
          lineCount++;
        }
        continue;
      }

      if (feature.type === 'Polygon') {
        const rawRings = feature.geometry as DecodedMVTPoint[][];
        const groups = groupPolygonRings(rawRings, minRingArea, simplifyTolerance);

        for (const group of groups) {
          const rings = [group.outerRing, ...group.holes];
          const positions2D: Cartesian2[] = [];
          const polygonPositionComponents: number[] = [];
          const holeOffsets: number[] = [];
          let vertexOffset = 0;

          for (let ringIndex = 0; ringIndex < rings.length; ringIndex++) {
            const ring = rings[ringIndex];
            if (ringIndex > 0) {
              holeOffsets.push(vertexOffset);
            }

            for (const point of ring) {
              positions2D.push(new Cartesian2(point.x, point.y));
              appendTilePointAsLocalPosition(point, tileX, tileY, tileZ, extent, DEFAULT_HEIGHT, origin, polygonPositionComponents);
              vertexOffset++;
            }
          }

          if (positions2D.length < 3) {
            continue;
          }

          const triangles = PolygonPipeline.triangulate(positions2D, holeOffsets.length > 0 ? holeOffsets : undefined);

          if (triangles === undefined || triangles.length === 0) {
            console.warn('buildVectorGltfFromMVTWGS84: polygon triangulation failed; skipping polygon.');
            continue;
          }

          const globalVertexStart = polygonPositions.length / 3;
          const globalIndexStart = polygonIndices.length;
          polygonAttributeOffsets.push(globalVertexStart);
          polygonIndicesOffsets.push(globalIndexStart);
          polygonHoleCounts.push(holeOffsets.length);
          for (let i = 0; i < holeOffsets.length; i++) {
            polygonHoleOffsets.push(globalVertexStart + holeOffsets[i]);
          }

          for (let i = 0; i < polygonPositionComponents.length; i++) {
            polygonPositions.push(polygonPositionComponents[i]);
          }
          for (let i = 0; i < polygonPositionComponents.length / 3; i++) {
            polygonFeatureIds.push(currentFeatureId);
          }
          for (let i = 0; i < triangles.length; i++) {
            polygonIndices.push(triangles[i] + globalVertexStart);
          }
          polygonCount++;
        }
      }
    }

    // Skip layers with no geometry.
    if (pointPositions.length === 0 && linePositions.length === 0 && polygonPositions.length === 0) {
      continue;
    }

    if (lineIndices.length > 0 && lineIndices[lineIndices.length - 1] === primitiveRestartIndex) {
      lineIndices.pop();
    }

    const layerFeatureCount = featureIdLookup.size;
    const layerPropertyTableIndex = buildStructuralMetadataForLayer(layer.name ?? '', currentLayerIndex, featureProperties, layerFeatureCount);

    const primitives: Record<string, unknown>[] = [];

    if (pointPositions.length > 0) {
      const positions = new Float32Array(pointPositions);
      const minMax = computeMinMax(positions);

      const positionAccessor = addAccessor(positions, {
        type: 'VEC3',
        componentType: ComponentDatatype.FLOAT,
        target: WebGLConstants.ARRAY_BUFFER,
        min: minMax.min,
        max: minMax.max,
      });
      const attributes: Record<string, unknown> = {
        POSITION: positionAccessor,
      };
      const extensions: Record<string, unknown> = {
        CESIUM_mesh_vector: {
          vector: true,
          count: positions.length / 3,
        },
      };
      addFeatureIdsToPrimitive(attributes, extensions, pointFeatureIds, layerFeatureCount, layerPropertyTableIndex);

      primitives.push({
        mode: PrimitiveType.POINTS,
        attributes: attributes,
        extensions: extensions,
      });
    }

    if (linePositions.length > 0 && lineIndices.length > 1) {
      const positions = new Float32Array(linePositions);
      const indices = new Uint32Array(lineIndices);
      const minMax = computeMinMax(positions);

      const positionAccessor = addAccessor(positions, {
        type: 'VEC3',
        componentType: ComponentDatatype.FLOAT,
        target: WebGLConstants.ARRAY_BUFFER,
        min: minMax.min,
        max: minMax.max,
      });
      const indicesAccessor = addAccessor(indices, {
        type: 'SCALAR',
        componentType: ComponentDatatype.UNSIGNED_INT,
        target: WebGLConstants.ELEMENT_ARRAY_BUFFER,
      });
      const attributes: Record<string, unknown> = {
        POSITION: positionAccessor,
      };
      const extensions: Record<string, unknown> = {
        CESIUM_mesh_vector: {
          vector: true,
          count: lineCount,
        },
      };
      addFeatureIdsToPrimitive(attributes, extensions, lineFeatureIds, layerFeatureCount, layerPropertyTableIndex);

      primitives.push({
        mode: PrimitiveType.LINE_STRIP,
        indices: indicesAccessor,
        attributes: attributes,
        extensions: extensions,
      });
    }

    if (polygonPositions.length > 0 && polygonIndices.length >= 3) {
      const positions = new Float32Array(polygonPositions);
      const indices = new Uint32Array(polygonIndices);
      const attributeOffsets = new Uint32Array(polygonAttributeOffsets);
      const indicesOffsets = new Uint32Array(polygonIndicesOffsets);
      const hasPolygonHoles = polygonHoleOffsets.length > 0;
      const holeCounts = hasPolygonHoles ? new Uint32Array(polygonHoleCounts) : undefined;
      const holeOffsets = hasPolygonHoles ? new Uint32Array(polygonHoleOffsets) : undefined;
      const minMax = computeMinMax(positions);

      const positionAccessor = addAccessor(positions, {
        type: 'VEC3',
        componentType: ComponentDatatype.FLOAT,
        target: WebGLConstants.ARRAY_BUFFER,
        min: minMax.min,
        max: minMax.max,
      });
      const indicesAccessor = addAccessor(indices, {
        type: 'SCALAR',
        componentType: ComponentDatatype.UNSIGNED_INT,
        target: WebGLConstants.ELEMENT_ARRAY_BUFFER,
      });
      const attributeOffsetsAccessor = addAccessor(attributeOffsets, {
        type: 'SCALAR',
        componentType: ComponentDatatype.UNSIGNED_INT,
        target: WebGLConstants.ARRAY_BUFFER,
      });
      const indicesOffsetsAccessor = addAccessor(indicesOffsets, {
        type: 'SCALAR',
        componentType: ComponentDatatype.UNSIGNED_INT,
        target: WebGLConstants.ARRAY_BUFFER,
      });
      const holeCountsAccessor =
        holeCounts !== undefined
          ? addAccessor(holeCounts, {
              type: 'SCALAR',
              componentType: ComponentDatatype.UNSIGNED_INT,
              target: WebGLConstants.ARRAY_BUFFER,
            })
          : undefined;
      const holeOffsetsAccessor =
        holeOffsets !== undefined
          ? addAccessor(holeOffsets, {
              type: 'SCALAR',
              componentType: ComponentDatatype.UNSIGNED_INT,
              target: WebGLConstants.ARRAY_BUFFER,
            })
          : undefined;
      const attributes: Record<string, unknown> = {
        POSITION: positionAccessor,
      };
      const extensions: Record<string, Record<string, unknown>> = {
        CESIUM_mesh_vector: {
          vector: true,
          count: polygonCount,
          polygonAttributeOffsets: attributeOffsetsAccessor,
          polygonIndicesOffsets: indicesOffsetsAccessor,
        },
      };
      if (hasPolygonHoles) {
        extensions.CESIUM_mesh_vector.polygonHoleCounts = holeCountsAccessor;
        extensions.CESIUM_mesh_vector.polygonHoleOffsets = holeOffsetsAccessor;
      }
      addFeatureIdsToPrimitive(attributes, extensions, polygonFeatureIds, layerFeatureCount, layerPropertyTableIndex);

      primitives.push({
        mode: PrimitiveType.TRIANGLES,
        indices: indicesAccessor,
        attributes: attributes,
        extensions: extensions,
      });
    }

    if (primitives.length === 0) {
      continue;
    }

    const meshIndex = meshes.length;
    meshes.push({ primitives: primitives });
    nodes.push({
      name: layer.name,
      mesh: meshIndex,
      translation: translation,
    });
  }

  if (nodes.length === 0) {
    return undefined;
  }

  const binaryChunk = concatChunks(chunks, byteLength);
  const extensionsUsed = ['CESIUM_mesh_vector'];
  if (hasAnyFeatureIds) {
    extensionsUsed.push('EXT_mesh_features');
  }
  if (propertyTables.length > 0) {
    extensionsUsed.push('EXT_structural_metadata');
  }

  const nodeIndices = nodes.map((_, i) => i);

  const gltfJson: Record<string, unknown> = {
    asset: {
      version: '2.0',
    },
    extensionsUsed: extensionsUsed,
    scene: 0,
    scenes: [
      {
        nodes: nodeIndices,
      },
    ],
    nodes: nodes,
    meshes: meshes,
    accessors: accessors,
    bufferViews: bufferViews,
    buffers: [
      {
        byteLength: binaryChunk.byteLength,
      },
    ],
  };

  if (propertyTables.length > 0) {
    gltfJson.extensions = {
      EXT_structural_metadata: {
        schema: {
          classes: schemaClasses,
        },
        propertyTables: propertyTables,
      },
    };
  }

  return buildGlb(gltfJson, binaryChunk);
}

/** Assigns a stable auto-incrementing integer ID to each unique feature. */
function getOrAssignAutoFeatureId(feature: DecodedMVTFeature, featureIdLookup: Map<DecodedMVTFeature, number>): number {
  let id = featureIdLookup.get(feature);
  if (id === undefined) {
    id = featureIdLookup.size;
    featureIdLookup.set(feature, id);
  }
  return id;
}

function mapFeatureIdFromProperty(feature: DecodedMVTFeature, featureIdProperty: string, featureIdLookup: Map<string, number>): number | undefined {
  const properties = feature.properties;
  if (properties === undefined) {
    return undefined;
  }
  const propertyValue = properties[featureIdProperty];
  if (propertyValue === undefined) {
    return undefined;
  }
  if (typeof propertyValue !== 'string' && typeof propertyValue !== 'number' && typeof propertyValue !== 'boolean') {
    return undefined;
  }
  if (typeof propertyValue === 'number' && !Number.isFinite(propertyValue)) {
    return undefined;
  }
  const mapKey = `${typeof propertyValue}:${propertyValue}`;
  let mappedFeatureId = featureIdLookup.get(mapKey);
  if (mappedFeatureId !== undefined) {
    return mappedFeatureId;
  }
  mappedFeatureId = featureIdLookup.size;
  featureIdLookup.set(mapKey, mappedFeatureId);
  return mappedFeatureId;
}

/**
 * Groups a polygon feature's flat ring list into (outer ring + its holes) groups. Each ring is first
 * tested against its OWN (pre-simplification) area, dropped entirely - outer *or* hole - if smaller
 * than `minRingArea` (see BuildVectorGltfOptions.minPolygonAreaPixels), and only then, if it survives,
 * Douglas-Peucker simplified (see BuildVectorGltfOptions.simplifyTolerancePixels) to reduce excess
 * vertex density. Both options default to disabled (0) - see their doc comments - so a caller that
 * doesn't opt in gets every ring exactly as decoded. Dropping tiny outer rings also drops any holes
 * that would have belonged to them, so they don't get misattached to an unrelated, previously-seen
 * group instead. Dropping tiny holes matters on its own: a hole ring that's degenerate (near-zero
 * area, often just 3-4 nearly-collinear points) is exactly the kind of input earcut has no obligation
 * to handle gracefully - punching a practically-zero-size hole into a large, detailed outer ring is a
 * real, observed way to get long, wrong-looking "spike" triangles, not just harmless visual noise.
 */
function groupPolygonRings(rawRings: DecodedMVTPoint[][], minRingArea: number, simplifyTolerance: number): PolygonRingGroup[] {
  const groups: PolygonRingGroup[] = [];
  let lastOuterRingDropped = false;
  for (const rawRing of rawRings) {
    const stripped = stripClosingVertex(rawRing);
    if (stripped.length < 3) {
      continue;
    }
    // The area test runs against the ORIGINAL ring, not the simplified one: simplification can shrink
    // a small-but-legitimate ring's area well below its true size (e.g. a small building reduced to a
    // near-degenerate sliver), which would otherwise make `minRingArea` drop real shapes it was never
    // meant to touch once `simplifyTolerance` is also in use. Simplification itself is applied only to
    // rings that already passed on their own merits, purely to reduce vertex count.
    const area = ringSignedArea(stripped);
    if (Math.abs(area) < minRingArea) {
      if (area <= 0) {
        lastOuterRingDropped = true;
      }
      continue;
    }
    const ring = simplifyRingDouglasPeucker(stripped, simplifyTolerance);
    if (area <= 0) {
      lastOuterRingDropped = false;
      groups.push({ outerRing: ring, holes: [] });
    } else if (!lastOuterRingDropped && groups.length > 0) {
      groups[groups.length - 1].holes.push(ring);
    }
  }
  return groups;
}

/**
 * Douglas-Peucker simplification for a CLOSED ring. Standard DP needs two anchor points that are far
 * apart to work well; naively anchoring on `points[0]`/`points[last]` is wrong here because those are
 * *adjacent* ring vertices (the ring's own closing edge, stripped earlier) sitting right next to each
 * other; the "farthest point from the anchor" search below finds a point roughly on the opposite side
 * of the shape instead. Using two adjacent points as anchors is worse than merely suboptimal: perpendicular
 * distance is measured against the INFINITE line through the anchors (not the segment between them), so
 * a real, large lobe of the ring on the far side can end up nearly collinear with that line's extension
 * and get judged as within tolerance - even though it is nowhere near the two adjacent anchor points -
 * causing whole concave sections to be silently dropped (observed as boundaries "ballooning" outward/
 * covering more area than they should, worst at high zoom where a ring carries the most vertices).
 * Splitting on a proper far-apart pair avoids that degenerate case. Never simplifies below a valid
 * triangle (3 points); returns the input unchanged if that would happen or if `tolerance` is 0.
 */
function simplifyRingDouglasPeucker(points: DecodedMVTPoint[], tolerance: number): DecodedMVTPoint[] {
  const n = points.length;
  if (n <= 3 || tolerance <= 0) {
    return points;
  }
  const toleranceSq = tolerance * tolerance;
  const anchorB = farthestPointIndex(points, 0);

  // Two independent open chains sharing the anchors as their shared endpoints: 0→anchorB directly, and
  // anchorB→(end of array)→0 the "long way" around. Slicing into plain arrays sidesteps circular-index
  // arithmetic entirely - each chain is simplified with the same, ordinary open-polyline DP.
  const chainA = points.slice(0, anchorB + 1);
  const chainB = points.slice(anchorB).concat([points[0]]);

  const keptA = simplifyOpenChain(chainA, toleranceSq);
  const keptB = simplifyOpenChain(chainB, toleranceSq);

  // keptB's first/last points duplicate keptA's last/first (the shared anchors) - drop them here.
  const result = keptA.concat(keptB.slice(1, keptB.length - 1));
  return result.length >= 3 ? result : points;
}

/** Index of the point in `points` farthest (by squared distance) from `points[fromIndex]`. */
function farthestPointIndex(points: DecodedMVTPoint[], fromIndex: number): number {
  const from = points[fromIndex];
  let maxDistSq = -1;
  let index = fromIndex;
  for (let i = 0; i < points.length; i++) {
    if (i === fromIndex) {
      continue;
    }
    const dx = points[i].x - from.x;
    const dy = points[i].y - from.y;
    const distSq = dx * dx + dy * dy;
    if (distSq > maxDistSq) {
      maxDistSq = distSq;
      index = i;
    }
  }
  return index;
}

function simplifyOpenChain(chain: DecodedMVTPoint[], toleranceSq: number): DecodedMVTPoint[] {
  const keep = new Uint8Array(chain.length);
  keep[0] = 1;
  keep[chain.length - 1] = 1;
  simplifyDouglasPeuckerSection(chain, 0, chain.length - 1, toleranceSq, keep);
  const result: DecodedMVTPoint[] = [];
  for (let i = 0; i < chain.length; i++) {
    if (keep[i]) {
      result.push(chain[i]);
    }
  }
  return result;
}

function simplifyDouglasPeuckerSection(points: DecodedMVTPoint[], first: number, last: number, toleranceSq: number, keep: Uint8Array): void {
  if (last <= first + 1) {
    return;
  }
  const a = points[first];
  const b = points[last];
  let maxDistSq = 0;
  let splitIndex = -1;
  for (let i = first + 1; i < last; i++) {
    const distSq = perpendicularDistanceSquared(points[i], a, b);
    if (distSq > maxDistSq) {
      maxDistSq = distSq;
      splitIndex = i;
    }
  }
  if (maxDistSq > toleranceSq && splitIndex !== -1) {
    keep[splitIndex] = 1;
    simplifyDouglasPeuckerSection(points, first, splitIndex, toleranceSq, keep);
    simplifyDouglasPeuckerSection(points, splitIndex, last, toleranceSq, keep);
  }
}

/** Squared distance from point `p` to the line through `a`/`b` (not the segment - matches standard DP). */
function perpendicularDistanceSquared(p: DecodedMVTPoint, a: DecodedMVTPoint, b: DecodedMVTPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) {
    const ddx = p.x - a.x;
    const ddy = p.y - a.y;
    return ddx * ddx + ddy * ddy;
  }
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  const ddx = p.x - projX;
  const ddy = p.y - projY;
  return ddx * ddx + ddy * ddy;
}

function ringSignedArea(ring: DecodedMVTPoint[]): number {
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    area += (ring[j].x + ring[i].x) * (ring[j].y - ring[i].y);
  }
  return area / 2;
}

function stripClosingVertex(ring: DecodedMVTPoint[]): DecodedMVTPoint[] {
  if (ring.length > 1 && ring[0].x === ring[ring.length - 1].x && ring[0].y === ring[ring.length - 1].y) {
    return ring.slice(0, ring.length - 1);
  }
  return ring;
}

/**
 * @see BuildVectorGltfOptions.lineSmoothingIterations
 *
 * Chaikin corner-cutting, treating `line` as an open polyline: each pass keeps the first/last vertex
 * as-is and replaces every edge with two points 1/4 and 3/4 along it, so a straight run of vertices is
 * unchanged (both new points still lie exactly on the original line) while a sharp corner gets pulled
 * into two shallower ones - after a couple of passes, effectively a rounded corner.
 */
function chaikinSmoothLine(line: DecodedMVTPoint[], iterations: number): DecodedMVTPoint[] {
  let current = line;
  for (let iteration = 0; iteration < iterations; iteration++) {
    if (current.length < 3) {
      break;
    }
    const next: DecodedMVTPoint[] = [current[0]];
    for (let i = 0; i < current.length - 1; i++) {
      const p0 = current[i];
      const p1 = current[i + 1];
      next.push({ x: 0.75 * p0.x + 0.25 * p1.x, y: 0.75 * p0.y + 0.25 * p1.y });
      next.push({ x: 0.25 * p0.x + 0.75 * p1.x, y: 0.25 * p0.y + 0.75 * p1.y });
    }
    next.push(current[current.length - 1]);
    current = next;
  }
  return current;
}

/**
 * Converts tile-local MVT coordinates (0..extent) to a local ENU-ish position (relative to `origin`)
 * via the WGS84 geographic tiling scheme. Unlike Web Mercator, longitude and latitude are linear in
 * the tile-local u/v parametrization, so no inverse-projection (sinh/atan) is needed.
 */
function appendTilePointAsLocalPosition(
  point: DecodedMVTPoint,
  tileX: number,
  tileY: number,
  tileZ: number,
  extent: number,
  height: number,
  origin: Cartesian3,
  out: number[]
): void {
  const numX = tilingScheme.getNumberOfXTilesAtLevel(tileZ);
  const numY = tilingScheme.getNumberOfYTilesAtLevel(tileZ);
  const u = (tileX + point.x / extent) / numX;
  const v = (tileY + point.y / extent) / numY;
  const lon = tilingRectangle.west + u * tilingRectangle.width;
  const lat = tilingRectangle.north - v * tilingRectangle.height;

  Cartesian3.fromRadians(lon, lat, height, undefined, scratchWorld);
  Cartesian3.subtract(scratchWorld, origin, scratchLocal);
  out.push(scratchLocal.x, scratchLocal.y, scratchLocal.z);
}

/**
 * Packs a glTF JSON object and binary buffer into a GLB (Binary glTF) Uint8Array.
 * GLB spec: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#binary-gltf-layout
 */
function buildGlb(gltfJson: Record<string, unknown>, binaryChunk: Uint8Array): Uint8Array {
  const GLB_MAGIC = 0x46546c67; // "glTF"
  const GLB_VERSION = 2;
  const CHUNK_TYPE_JSON = 0x4e4f534a; // "JSON"
  const CHUNK_TYPE_BIN = 0x004e4942; // "BIN\0"

  const jsonBytes = new TextEncoder().encode(JSON.stringify(gltfJson));
  // Pad JSON to 4-byte boundary with spaces (0x20)
  const jsonPaddedLength = Math.ceil(jsonBytes.length / 4) * 4;
  const jsonChunk = new Uint8Array(jsonPaddedLength);
  jsonChunk.fill(0x20);
  jsonChunk.set(jsonBytes);

  // Pad binary to 4-byte boundary with zeros
  const binPaddedLength = Math.ceil(binaryChunk.byteLength / 4) * 4;
  const binChunk = new Uint8Array(binPaddedLength);
  binChunk.set(binaryChunk);

  const totalLength =
    12 + // header
    8 +
    jsonPaddedLength + // JSON chunk header + data
    8 +
    binPaddedLength; // BIN chunk header + data

  const glb = new Uint8Array(totalLength);
  const view = new DataView(glb.buffer);
  let offset = 0;

  // Header
  view.setUint32(offset, GLB_MAGIC, true);
  offset += 4;
  view.setUint32(offset, GLB_VERSION, true);
  offset += 4;
  view.setUint32(offset, totalLength, true);
  offset += 4;

  // JSON chunk
  view.setUint32(offset, jsonPaddedLength, true);
  offset += 4;
  view.setUint32(offset, CHUNK_TYPE_JSON, true);
  offset += 4;
  glb.set(jsonChunk, offset);
  offset += jsonPaddedLength;

  // BIN chunk
  view.setUint32(offset, binPaddedLength, true);
  offset += 4;
  view.setUint32(offset, CHUNK_TYPE_BIN, true);
  offset += 4;
  glb.set(binChunk, offset);

  return glb;
}

function concatChunks(chunks: Uint8Array[], totalByteLength: number): Uint8Array {
  const out = new Uint8Array(totalByteLength);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

export default buildVectorGltfFromMVTWGS84;

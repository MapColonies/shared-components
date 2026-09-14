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
 * the WGS84 tile matrix set - everything else (triangulation, feature IDs, glTF/GLB assembly) is
 * unchanged.
 */

const DEFAULT_HEIGHT = 0;

const scratchWorld = new Cartesian3();
const scratchLocal = new Cartesian3();
const tilingScheme = new GeographicTilingScheme();
const tilingRectangle = tilingScheme.rectangle;

export interface BuildVectorGltfOptions {
  featureIdProperty?: string;
}

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

  const tileRect = tilingScheme.tileXYToRectangle(tileX, tileY, tileZ);
  const tileCenter = Rectangle.center(tileRect);
  const origin = Cartesian3.fromRadians(tileCenter.longitude, tileCenter.latitude, 0);
  // Maximum value of a Uint32; used as sentinel for null feature IDs and primitive restart indices.
  const MAX_INT_U32 = 0xffffffff;
  const nullFeatureId = MAX_INT_U32;
  const primitiveRestartIndex = MAX_INT_U32;
  // Maps a property value (or auto-increment key) to a compact integer feature ID.
  const featureIdLookup = new Map<string | DecodedMVTFeature, number>();

  // Maps featureId -> properties object (first-seen wins for ID collisions).
  const featureProperties = new Map<number, Record<string, unknown>>();

  const bufferViews: Record<string, unknown>[] = [];
  const accessors: Record<string, unknown>[] = [];
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

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

  function addFeatureIdsToPrimitive(attributes: Record<string, unknown>, extensions: Record<string, unknown>, featureIdValues: number[]): void {
    if (featureIdValues.length === 0) {
      return;
    }
    const featureIds = new Uint32Array(featureIdValues);
    const featureAccessor = addAccessor(featureIds, {
      type: 'SCALAR',
      componentType: ComponentDatatype.UNSIGNED_INT,
      target: WebGLConstants.ARRAY_BUFFER,
    });
    attributes._FEATURE_ID_0 = featureAccessor;
    const featureIdDef: Record<string, unknown> = {
      featureCount: featureIdLookup.size,
      nullFeatureId: nullFeatureId,
      attribute: 0,
    };
    if (featureProperties.size > 0) {
      featureIdDef.propertyTable = 0;
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
   * Builds the EXT_structural_metadata extension object with schema and
   * property table from the collected feature properties.
   */
  function buildStructuralMetadata(): Record<string, unknown> | undefined {
    if (featureProperties.size === 0) {
      return undefined;
    }

    // 1. Determine union of all property names and infer types.
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
        } else if (jsType === 'number') {
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
    const count = featureIdLookup.size;

    for (const [name, type] of propertyTypes) {
      if (type === 'SCALAR') {
        const values = new Float64Array(count);
        for (let i = 0; i < count; i++) {
          const props = featureProperties.get(i);
          const raw = props?.[name];
          values[i] = typeof raw === 'number' && Number.isFinite(raw) ? raw : NaN;
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

    return {
      schema: {
        classes: {
          mvt_feature: {
            properties: classProperties,
          },
        },
      },
      propertyTables: [
        {
          class: 'mvt_feature',
          count: count,
          properties: tableProperties,
        },
      ],
    };
  }

  const meshes: Record<string, unknown>[] = [];
  const nodes: Record<string, unknown>[] = [];
  const translation = [origin.x, origin.y, origin.z];

  for (const layer of decoded.layers) {
    const extent = layer.extent;

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

      // Collect properties for the property table (first-seen wins).
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
        for (const line of lines) {
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
        const groups = groupPolygonRings(rawRings);

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
      addFeatureIdsToPrimitive(attributes, extensions, pointFeatureIds);

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
      addFeatureIdsToPrimitive(attributes, extensions, lineFeatureIds);

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
      addFeatureIdsToPrimitive(attributes, extensions, polygonFeatureIds);

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

  // Build property table AFTER primitives (adds metadata buffer views).
  const structuralMetadata = buildStructuralMetadata();

  const binaryChunk = concatChunks(chunks, byteLength);
  const extensionsUsed = ['CESIUM_mesh_vector'];
  if (featureIdLookup.size > 0) {
    extensionsUsed.push('EXT_mesh_features');
  }
  if (structuralMetadata !== undefined) {
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

  if (structuralMetadata !== undefined) {
    gltfJson.extensions = {
      EXT_structural_metadata: structuralMetadata,
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

function groupPolygonRings(rawRings: DecodedMVTPoint[][]): PolygonRingGroup[] {
  const groups: PolygonRingGroup[] = [];
  for (const rawRing of rawRings) {
    const ring = stripClosingVertex(rawRing);
    if (ring.length < 3) {
      continue;
    }
    const area = ringSignedArea(ring);
    if (area <= 0) {
      groups.push({ outerRing: ring, holes: [] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].holes.push(ring);
    }
  }
  return groups;
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

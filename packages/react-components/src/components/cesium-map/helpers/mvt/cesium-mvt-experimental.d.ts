// Cesium ships `decodeMVT`, `VectorGltf3DTileContent` and `Empty3DTileContent` as part of its
// @experimental MVT/3D Tiles support (see @cesium/engine/Source/Scene/{decodeMVT,VectorGltf3DTileContent,
// Empty3DTileContent}.js), but `cesium`'s bundled `Cesium.d.ts` does not declare them yet. Augment the
// module locally (same technique resium uses for `MVTDataProviderShape`) so mvtDataProviderWGS84.ts and
// buildVectorGltfFromMVTWGS84.ts can consume them with real types instead of `any`.
declare module 'cesium' {
  export interface DecodedMVTPoint {
    x: number;
    y: number;
  }

  export interface DecodedMVTFeature {
    type: 'Point' | 'LineString' | 'Polygon' | 'Unknown';
    geometry: DecodedMVTPoint[] | DecodedMVTPoint[][];
    properties?: Record<string, string | number | boolean | bigint>;
  }

  export interface DecodedMVTLayer {
    name?: string;
    extent: number;
    features: DecodedMVTFeature[];
  }

  export interface DecodedMVT {
    layers: DecodedMVTLayer[];
  }

  export function decodeMVT(arrayBuffer: ArrayBuffer): DecodedMVT;

  export class Empty3DTileContent implements Cesium3DTileContent {
    constructor(tileset: Cesium3DTileset, tile: Cesium3DTile);
    readonly featuresLength: number;
    readonly pointsLength: number;
    readonly trianglesLength: number;
    readonly geometryByteLength: number;
    readonly texturesByteLength: number;
    readonly batchTableByteLength: number;
    readonly innerContents: Cesium3DTileContent[] | undefined;
    readonly readyPromise: Promise<Cesium3DTileContent>;
    readonly tileset: Cesium3DTileset;
    readonly tile: Cesium3DTile;
    readonly url: string | undefined;
    readonly batchTable: unknown;
    readonly featurePropertiesDirty: boolean;
    readonly group: unknown;
    hasProperty(batchId: number, name: string): boolean;
    getFeature(batchId: number): unknown;
    applyDebugSettings(enabled: boolean, color: Color): void;
    applyStyle(style: unknown): void;
    update(tileset: Cesium3DTileset, frameState: unknown): void;
    isDestroyed(): boolean;
    destroy(): void;
  }

  export class VectorGltf3DTileContent {
    static fromGltf(
      tileset: Cesium3DTileset,
      tile: Cesium3DTile,
      resource: Resource,
      glb: Uint8Array
    ): Promise<VectorGltf3DTileContent>;
  }

  export namespace PolygonPipeline {
    function triangulate(positions: Cartesian2[], holes?: number[]): number[];
  }

  export namespace MetadataType {
    function getComponentCount(type: string): number;
  }
}

import { Cesium3DTileset as CesiumTileset } from 'cesium';
import type { CesiumViewer } from '../cesium-map/map';

export const collect3DTilesets = (viewer: CesiumViewer): CesiumTileset[] => {
  const tilesets: CesiumTileset[] = [];
  const { primitives } = viewer.scene;
  for (let i = 0; i < primitives.length; i++) {
    const primitive: unknown = primitives.get(i);
    if (primitive instanceof CesiumTileset && !primitive.isDestroyed()) {
      tilesets.push(primitive);
    }
  }
  return tilesets;
};

export const isCesiumSceneLoading = (viewer: CesiumViewer): boolean => {
  if (viewer.isDestroyed()) {
    return false;
  }
  if (!viewer.scene.globe.tilesLoaded) {
    return true;
  }
  return collect3DTilesets(viewer).some((tileset) => !tileset.tilesLoaded);
};

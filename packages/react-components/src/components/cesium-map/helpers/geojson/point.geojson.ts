import { Math as CesiumMath, Cartesian3, Cartographic, SceneMode, Cartesian2 } from 'cesium';
import { GeoJSON } from 'geojson';
import { CesiumViewer } from '../../map';

const pointToCartographic = (mapViewer: CesiumViewer, x: number, y: number): Cartographic | undefined => {
  let cartesian: Cartesian3 | undefined;

  if (mapViewer.scene.mode !== SceneMode.SCENE2D) {
    cartesian = mapViewer.scene.pickPosition(new Cartesian2(x, y));
  } else {
    const ellipsoid = mapViewer.scene.globe.ellipsoid;
    cartesian = mapViewer.camera.pickEllipsoid(new Cartesian2(x, y), ellipsoid);
  }

  if (cartesian === undefined) {
    return undefined;
  }

  return Cartographic.fromCartesian(cartesian);
};

export const pointToGeoJSON = (mapViewer: CesiumViewer, x: number, y: number): GeoJSON | undefined => {
  const cartographic = pointToCartographic(mapViewer, x, y);

  if (cartographic === undefined) {
    return undefined;
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude)],
    },
  };
};

export const pointToLonLat = (mapViewer: CesiumViewer, x: number, y: number): { longitude: number; latitude: number } | undefined => {
  try {
    const cartographic = pointToCartographic(mapViewer, x, y);

    if (cartographic === undefined) {
      return undefined;
    }

    return {
      longitude: CesiumMath.toDegrees(cartographic.longitude),
      latitude: CesiumMath.toDegrees(cartographic.latitude),
    };
  } catch (e) {
    return undefined;
  }
};

import {
  Cartesian2,
  Color as CesiumColor,
  Entity,
  GeoJsonDataSource,
  SceneMode,
  JulianDate,
  Cartesian3,
  SceneTransforms,
  HeightReference,
  Scene,
  Ellipsoid,
  PolygonHierarchy,
  Cartographic,
  PolygonGraphics,
  PolylineGraphics,
  PositionProperty,
  VerticalOrigin,
  BillboardGraphics,
  defined,
  Rectangle,
  PerspectiveFrustum,
} from 'cesium';
import { BBox, Feature, Point, Polygon } from 'geojson';
import area from '@turf/area';
import bboxPolygon from '@turf/bbox-polygon';
import centroid from '@turf/centroid';
import { point, Properties } from '@turf/helpers';
import * as turf from '@turf/helpers';
import intersect from '@turf/intersect';
import pointToPolygonDistance from '@turf/point-to-polygon-distance';
import { ICesiumWFSLayerLabelingOptions } from '../layers';
import { CesiumViewer } from '../map';
import { CesiumMath, CesiumRectangle } from '../proxied.types';
import { CustomImageryProvider } from './customImageryProviders';

const canvasElem = document.createElement('canvas');
const canvasCtx = canvasElem.getContext('2d');

/**
 * Checks if image data has at least one transparent pixel.
 * @param image Image data to check
 * @returns `true` if image data has at least one transparent pixel, `false` otherwise.
 */
const imageDataHasTransparency = (image: ImageData | undefined): boolean => {
  const ALPHA_CHANNEL_OFFSET = 4; // [R,G,B,A, R,G,B,A] => FLAT ARRAY OF THIS SHAPE; (Uint8ClampedArray)
  const OPAQUE_PIXEL_ALPHA_VALUE = 255;
  const imgData = image?.data ?? [];

  // Iterate through alpha channels only.
  for (let i = 3; i < imgData.length; i += ALPHA_CHANNEL_OFFSET) {
    if (imgData[i] < OPAQUE_PIXEL_ALPHA_VALUE) {
      // Transparent pixel found.
      return true;
    }
  }
  return false;
};

/**
 * An async function to detect images with transparency.
 * @param image The image to resolve. if value is `string (url)` it tries to fetch the image data first.
 * Could also be `HTMLImageElement` or `ImageBitmap`
 * @param context `optional` `CustomImageryProvider` context in which the function will automatically increase
 * the `tileTransparencyCheckedCounter`. Sets to `maxTilesForTransparencyCheck` when layer detected as transparent.
 * @returns
 */
export const imageHasTransparency = async (image: string | HTMLImageElement | ImageBitmap, context?: CustomImageryProvider): Promise<boolean> => {
  if (context) {
    context.tileTransparencyCheckedCounter++;
  }

  return new Promise<boolean>((resolve, reject) => {
    try {
      canvasCtx?.clearRect(0, 0, canvasElem.width, canvasElem.height);
      let imageElement: HTMLImageElement;

      // Init Image instance.
      if (image instanceof HTMLImageElement) {
        imageElement = image;
      } else if (image instanceof ImageBitmap) {
        canvasElem.width = image.width;
        canvasElem.height = image.height;
        canvasCtx?.drawImage(image, 0, 0);

        const canvasImg = canvasCtx?.getImageData(0, 0, canvasElem.width, canvasElem.height);
        const hasTransparency = imageDataHasTransparency(canvasImg);
        if (hasTransparency) {
          if (context) {
            context.tileTransparencyCheckedCounter = context.maxTilesForTransparencyCheck;
          }
        }

        resolve(hasTransparency);
        return;
      } else {
        imageElement = new Image();
        imageElement.crossOrigin = 'anonymous'; // Disable CORS errors on canvas image load.
        imageElement.src = image;
      }

      imageElement.onload = (): void => {
        // Image loaded, set canvas size to image size.
        canvasElem.width = imageElement.width;
        canvasElem.height = imageElement.height;

        canvasCtx?.drawImage(imageElement, 0, 0);

        const canvasImg = canvasCtx?.getImageData(0, 0, canvasElem.width, canvasElem.height);

        const hasTransparency = imageDataHasTransparency(canvasImg);

        if (hasTransparency) {
          if (context) {
            context.tileTransparencyCheckedCounter = context.maxTilesForTransparencyCheck;
          }

          resolve(true);
        } else {
          resolve(false);
        }
      };
    } catch (e) {
      console.error('Could not determine image transparency. Error => ', e);
      reject(e);
    }
  });
};

/**
 * Checks if `rect` is contained inside `anotherRect`
 * @param rect
 * @param anotherRect
 */
export const cesiumRectangleContained = (rect: Rectangle, anotherRect: Rectangle): boolean => {
  const { west, east, north, south } = rect;
  const { west: anotherWest, east: anotherEast, north: anotherNorth, south: anotherSouth } = anotherRect;

  const isRectInsideAnother = west >= anotherWest && east <= anotherEast && north <= anotherNorth && south >= anotherSouth;

  return isRectInsideAnother;
};

/**
 * Calculates distance from a point to the edges of a given bbox.
 * @param position Point to calculate distance from
 * @param bbox Bounding box to calculate distance to
 * @returns Distance in km
 */
export const distance = (position: Feature<Point>, bbox: BBox) => {
  return pointToPolygonDistance(position, bboxPolygon(bbox));
};

/**
 * Calculates the center of a given bbox.
 * @param bbox Cesium Rectangle
 * @returns Center point of the bbox
 */
export const center = (bbox: Rectangle): Feature<Point> => {
  const centerX = (CesiumMath.toDegrees(bbox.west) + CesiumMath.toDegrees(bbox.east)) / 2;
  const centerY = (CesiumMath.toDegrees(bbox.south) + CesiumMath.toDegrees(bbox.north)) / 2;
  const position = point([centerX, centerY]);
  return position;
};

/**
 * Converts a Cesium Rectangle to a GeoJSON bbox array.
 * @param bbox Cesium Rectangle
 * @returns BBox array
 */
export const rectangle2bbox = (bbox: Rectangle): BBox => [
  CesiumMath.toDegrees(bbox.west),
  CesiumMath.toDegrees(bbox.south),
  CesiumMath.toDegrees(bbox.east),
  CesiumMath.toDegrees(bbox.north),
];

export const customComputeViewRectangle = (mapViewer: CesiumViewer) => {
  const scene = mapViewer.scene;
  const camera = mapViewer.camera;

  let viewRect = camera.computeViewRectangle(scene.globe.ellipsoid);

  if (!defined(viewRect) || !viewRect) {
    console.error('cesium native computeViewRectangle returned invalid rectangle, fallback to custom calculation ');
    const cl2 = new Cartesian2(0, 0);
    const leftTop = scene.camera.pickEllipsoid(cl2, scene.globe.ellipsoid);

    const cr2 = new Cartesian2(scene.canvas.width, scene.canvas.height);
    const rightDown = scene.camera.pickEllipsoid(cr2, scene.globe.ellipsoid);

    const cartoLeftTop = scene.globe.ellipsoid.cartesianToCartographic(leftTop as Cartesian3);
    const cartoRightDown = scene.globe.ellipsoid.cartesianToCartographic(rightDown as Cartesian3);
    viewRect = new Rectangle(cartoLeftTop.longitude, cartoRightDown.latitude, cartoRightDown.longitude, cartoLeftTop.latitude);
  }

  return viewRect;
};

/**
 * Computes a limited view rectangle in case of 3D mode based on the camera position and max distance.
 * @param mapViewer Cesium Viewer instance
 * @param maxDistanceMeters Max distance in meters to limit the view rectangle
 * @returns View rectangle
 */
export const computeLimitedViewRectangle = (mapViewer: CesiumViewer, maxDistanceMeters: number = 100): Rectangle | undefined => {
  const scene = mapViewer.scene;
  const camera = mapViewer.camera;
  const mode = scene.mode;

  // Get the full rectangle in 2D or 3D mode
  const fullRect = customComputeViewRectangle(mapViewer);

  // Check if fullRect is valid before proceeding
  if (!defined(fullRect) || !fullRect) {
    console.error('customComputeViewRectangle returned invalid rectangle.');
    return undefined;
  }

  // In 2D mode, just return the computed view rectangle directly
  if (mode === SceneMode.SCENE2D) {
    return fullRect;
  }

  // In 3D mode, proceed with the scaling logic
  const centerCartographic = camera.positionCartographic;

  if (!defined(centerCartographic)) {
    console.error('Camera position is undefined in 3D mode.');
    return undefined;
  }

  const lat = centerCartographic.latitude;
  const lon = centerCartographic.longitude;

  // Validate latitude and longitude to ensure they are within expected ranges
  if (lat < -CesiumMath.PI_OVER_TWO || lat > CesiumMath.PI_OVER_TWO || lon < -CesiumMath.PI || lon > CesiumMath.PI) {
    console.error('Invalid latitude or longitude values.');
    return undefined;
  }

  // Calculate the meters per degree for latitude and longitude
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLon = 111320 * Math.cos(lat);

  // Calculate the max deltas based on max distance (100 meters by default)
  let deltaLat = maxDistanceMeters / metersPerDegreeLat;
  let deltaLon = maxDistanceMeters / metersPerDegreeLon;

  // Get camera height above the ellipsoid (the altitude from the ground)
  const cameraHeight = Cartesian3.magnitude(camera.positionWC);

  // If the camera is at a very high altitude (showing the whole world), cap the green rectangle size
  if (cameraHeight > 10000000) {
    // Arbitrary threshold for high altitude
    // Cap the rectangle size to cover a reasonable portion of the Earth
    deltaLat = 10; // Limit to a 10-degree latitude span (roughly 1110 km)
    deltaLon = 10; // Limit to a 10-degree longitude span (roughly 1110 km)
  }

  // Calculate the Field of View (FOV) of the camera
  const fov = camera.frustum instanceof PerspectiveFrustum ? camera.frustum.fov : Math.PI / 3; // Default FOV if not PerspectiveFrustum

  // Apply zoom scaling based on camera height and FOV
  let zoomFactor = 1.0;

  if (cameraHeight < 500000) {
    zoomFactor = 0.05; // Strong zoom-out effect for very zoomed-in views (zoom 14+)
  } else if (cameraHeight < 2000000) {
    zoomFactor = 0.1; // Moderate zoom scaling for zoom levels 12-13
  }

  // Apply zoom factor based on the camera's FOV and height to reduce large areas
  deltaLat *= zoomFactor * (fov / Math.PI); // FOV scaling adjusts the rectangle size
  deltaLon *= zoomFactor * (fov / Math.PI); // Apply similar scaling to longitude

  // Factor in the tilt angle to scale the rectangle
  const cameraPitch = camera.pitch; // The pitch (tilt) of the camera
  if (cameraPitch === undefined) {
    return undefined;
  }
  const maxTiltAngle = Math.PI / 4; // Example of max tilt threshold (45 degrees)
  const tiltFactor = Math.max(0, 1 - Math.abs(cameraPitch) / maxTiltAngle);

  // Apply the tilt factor to reduce the green rectangle size at sharp tilt angles
  deltaLat *= tiltFactor;
  deltaLon *= tiltFactor;

  // Calculate the new boundaries for the green rectangle
  /*let minLat = centerCartographic.latitude - deltaLat;
  let maxLat = centerCartographic.latitude + deltaLat;
  const minLon = centerCartographic.longitude - deltaLon;
  const maxLon = centerCartographic.longitude + deltaLon;*/

  // Apply a minimum size threshold to prevent the green rectangle from becoming invisible
  const minSize = 0.0005; // This threshold value prevents the rectangle from shrinking too much

  // Ensure the green rectangle doesn't shrink below the minimum size
  deltaLat = Math.max(deltaLat, minSize);
  deltaLon = Math.max(deltaLon, minSize);

  // Calculate the new boundaries after applying the minimum size
  const minLatClamped = centerCartographic.latitude - deltaLat;
  const maxLatClamped = centerCartographic.latitude + deltaLat;
  const minLonClamped = centerCartographic.longitude - deltaLon;
  const maxLonClamped = centerCartographic.longitude + deltaLon;

  // Clamp the new green rectangle to the full view rectangle (red rectangle)
  const clampedMinLat = CesiumMath.clamp(minLatClamped, fullRect.south, fullRect.north);
  const clampedMaxLat = CesiumMath.clamp(maxLatClamped, fullRect.south, fullRect.north);
  const clampedMinLon = CesiumMath.clamp(minLonClamped, fullRect.west, fullRect.east);
  const clampedMaxLon = CesiumMath.clamp(maxLonClamped, fullRect.west, fullRect.east);

  // Reduce the upper boundary more as the pitch increases (horizon visible)
  const pitchAdjustment = Math.min(1.0, cameraPitch / CesiumMath.PI_OVER_TWO); // Normalize pitch to [0, 1]
  const reducedMaxLat = fullRect.north - (fullRect.north - fullRect.south) * pitchAdjustment;

  // Adjust maxLat after the pitch adjustment
  const finalMaxLat = Math.min(clampedMaxLat, reducedMaxLat);

  // Return the new rectangle after ensuring it's within bounds
  return new Rectangle(
    CesiumMath.negativePiToPi(clampedMinLon),
    CesiumMath.clamp(clampedMinLat, -CesiumMath.PI_OVER_TWO, CesiumMath.PI_OVER_TWO),
    CesiumMath.negativePiToPi(clampedMaxLon),
    CesiumMath.clamp(finalMaxLat, -CesiumMath.PI_OVER_TWO, CesiumMath.PI_OVER_TWO)
  );
};

export const createRectangleAround = (
  centerCartographic: { longitude: number; latitude: number },
  widthMeters: number,
  heightMeters: number,
): Polygon => {
  const ellipsoid = Ellipsoid.WGS84;
  const lat = centerCartographic.latitude;
  const lon = centerCartographic.longitude;

  const metersPerDegreeLat = (Math.PI / 180) * ellipsoid.maximumRadius;
  const metersPerDegreeLon = (Math.PI / 180) * ellipsoid.maximumRadius; /** Math.cos(lat)*/

  const dLat = heightMeters / 2 / metersPerDegreeLat;
  const dLon = widthMeters / 2 / metersPerDegreeLon;

  const north = lat + dLat;
  const south = lat - dLat;
  const east = lon + dLon;
  const west = lon - dLon;

  return {
    type: 'Polygon',
    coordinates: [
      [
        [west, north],
        [east, north],
        [east, south],
        [west, south],
        [west, north], // close the ring
      ],
    ],
  };
};

export const defaultVisualizationHandler = (viewer: CesiumViewer, dataSource: GeoJsonDataSource, processEntityIds: string[], color: string, extent?: BBox, labeling?: ICesiumWFSLayerLabelingOptions): void => {
  const is2D = viewer.scene.mode === SceneMode.SCENE2D;

  const getGeoJsonFromEntity = (entity: Entity): Polygon | undefined => {
    if (entity.polygon) {
      // Polygon
      const polygonData = entity.polygon.hierarchy?.getValue(JulianDate.now()) as PolygonHierarchy;
      const positions = polygonData.positions.map((position) => {
        const worldPosCartographic = Cartographic.fromCartesian(position);
        const correctedCarto = new Cartographic(
          CesiumMath.toDegrees(worldPosCartographic.longitude),
          CesiumMath.toDegrees(worldPosCartographic.latitude),
          is2D ? 500 : undefined //viewer.scene.sampleHeight(Cartographic.fromCartesian(position))
        );
        return [correctedCarto.longitude, correctedCarto.latitude, correctedCarto.height];
      });

      // return turf.polygon(positions);
      return {
        type: 'Polygon',
        coordinates: [positions],
      };
    }
  };

  const pixelSizeInMeters = (
    scene: Scene,
    position: Cartesian3,
    pixelWidth: number,
    pixelHeight: number
  ): { widthMeters: number; heightMeters: number } | null => {
    const screenPosition = SceneTransforms.wgs84ToWindowCoordinates(scene, position);

    if (!screenPosition) return null;

    const xRight = screenPosition.x + pixelWidth;
    const yBottom = screenPosition.y + pixelHeight;

    const screenRight = new Cartesian2(xRight, screenPosition.y);
    const screenBottom = new Cartesian2(screenPosition.x, yBottom);

    const worldRight = scene.camera.pickEllipsoid(screenRight, scene.globe.ellipsoid);
    const worldBottom = scene.camera.pickEllipsoid(screenBottom, scene.globe.ellipsoid);

    if (!worldRight || !worldBottom) return null;

    const widthMeters = Cartesian3.distance(position, worldRight);
    const heightMeters = Cartesian3.distance(position, worldBottom);

    return { widthMeters, heightMeters };
  };

  const createRectangleAround = (
    centerCartographic: { longitude: number; latitude: number },
    widthMeters: number,
    heightMeters: number
  ): Polygon => {
    const ellipsoid = Ellipsoid.WGS84;
    const lat = centerCartographic.latitude;
    const lon = centerCartographic.longitude;

    const metersPerDegreeLat = (Math.PI / 180) * ellipsoid.maximumRadius;
    const metersPerDegreeLon = (Math.PI / 180) * ellipsoid.maximumRadius; /** Math.cos(lat)*/

    const dLat = heightMeters / 2 / metersPerDegreeLat;
    const dLon = widthMeters / 2 / metersPerDegreeLon;

    const north = lat + dLat;
    const south = lat - dLat;
    const east = lon + dLon;
    const west = lon - dLon;

    return {
      type: 'Polygon',
      coordinates: [
        [
          [west, north],
          [east, north],
          [east, south],
          [west, south],
          [west, north], // close the ring
        ],
      ],
    };
  };

  const calcIntersectionRation = (polygon1: turf.Geometry, polygon2: turf.Geometry) => {
    return area(polygon1) / area(polygon2);
  };

  if (!viewer.dataSources.getByName(dataSource.name)[0]) {
    return;
  }

  const labelPos = [] as turf.Feature<turf.Point>[];

  dataSource?.entities.values.forEach((entity: Entity) => {
    if (extent && labeling && is2D) {
      try {
        const extentPolygon = bboxPolygon(extent);
        const featureClippedPolygon = intersect(getGeoJsonFromEntity(entity) as Polygon, extentPolygon) as Feature<Polygon, Properties>;
        if (featureClippedPolygon) {
          const labelValue = entity.properties?.label.getValue(JulianDate.now());
          const featureClippedPolygonCenter = centroid(featureClippedPolygon as unknown as Polygon, {
            properties: {
              label: labelValue,
            },
          });

          const labelPixelSize = { width: labelValue.width, height: labelValue.height };
          const [longitude, latitude, height = 0] = featureClippedPolygonCenter.geometry.coordinates;
          const cartesian = Cartesian3.fromDegrees(longitude, latitude, height);
          const sizeMeters = pixelSizeInMeters(viewer.scene, cartesian, labelPixelSize.width, labelPixelSize.height);

          if (sizeMeters) {
            const labelRect = createRectangleAround({ longitude, latitude }, sizeMeters.widthMeters, sizeMeters.heightMeters);

            const labelIntersection = intersect(featureClippedPolygon, {
              type: 'Feature',
              properties: {},
              geometry: labelRect,
            });
            const intersectionRatio = calcIntersectionRation(labelIntersection?.geometry as turf.Geometry, labelRect);
            if (intersectionRatio > 0.7) {
              labelPos.push(featureClippedPolygonCenter);
            }
          }
        }
      } catch (e) {
        console.log('*** Label placement failed: turf.intersect() failed ***', 'entity -->', entity, 'extent -->', extent);
      }
    }
    if (processEntityIds.length > 0 && !processEntityIds.some((validId) => entity.id.startsWith(validId))) {
      return;
    }
    if (entity.polygon) {
      entity.polygon = new PolygonGraphics({
        hierarchy: entity.polygon.hierarchy,
        material: is2D ? CesiumColor.fromCssColorString(color).withAlpha(0.2) : CesiumColor.fromCssColorString(color).withAlpha(0.5),
        outline: true,
        outlineColor: CesiumColor.fromCssColorString(color),
        outlineWidth: 3,
        height: is2D ? 10000 : undefined, // Mount Everest peak reaches an elevation of approximately 8848.86 meters above sea level
        perPositionHeight: false,
      });
    }
    if (entity.polyline) {
      entity.polyline = new PolylineGraphics({
        positions: entity.polyline.positions,
        material: CesiumColor.fromCssColorString(color).withAlpha(0.5),
        clampToGround: true,
        width: 4,
      });
    }
    if (entity.billboard) {
      const worldPos = entity.position?.getValue(JulianDate.now()) as Cartesian3;
      const worldPosCartographic = Cartographic.fromCartesian(worldPos);
      const correctedCarto = new Cartographic(
        worldPosCartographic.longitude,
        worldPosCartographic.latitude,
        is2D ? 500 : viewer.scene.sampleHeight(Cartographic.fromCartesian(worldPos))
      );

      const correctedCartesian = Cartesian3.fromRadians(correctedCarto.longitude, correctedCarto.latitude, correctedCarto.height);

      const POINT_STROKE = '#FFFF00';

      entity.position = correctedCartesian as unknown as PositionProperty;
      entity.billboard = new BillboardGraphics({
        image:
          'data:image/svg+xml;base64,' +
          btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
            <circle cx="8" cy="8" r="6" fill="${color}33" stroke="${POINT_STROKE}80" stroke-width="2"/>
          </svg>
        `), //${color}33 - with opacity 0.2 ; #FFFF0080 - with opacity 0.5
        verticalOrigin: VerticalOrigin.BOTTOM,
        heightReference: HeightReference.NONE, // Ensures it's not clamped and floats above
        scale: 1.0,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
    }
  });

  viewer.dataSources.remove(viewer.dataSources.getByName(`${labeling?.dataSourcePrefix}${dataSource.name}`)[0]);
  if (labeling && is2D) {
    const labelsGeoJsonDataSource = new GeoJsonDataSource(`${labeling?.dataSourcePrefix}${dataSource.name}`);
    viewer.dataSources.add(labelsGeoJsonDataSource);
    labelsGeoJsonDataSource
      .load({
        type: 'FeatureCollection',
        features: labelPos,
      })
      .then((dataSource) => {
        dataSource?.entities.values.forEach((entity: Entity) => {
          entity.billboard = new BillboardGraphics({
          image: entity.properties?.label.getValue(JulianDate.now()).dataURL,
          heightReference: HeightReference.NONE, // Ensures it's not clamped and floats above
          scale: 1.0,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
      });
    });
  }
};

const DEFAULT_RECTANGLE_FACTOR = 0.2;

export const applyFactor = (rect: CesiumRectangle, factor = DEFAULT_RECTANGLE_FACTOR): CesiumRectangle => {
  if (rect.width === 0) {
    rect.east = rect.east +   0.0001 * factor;
    rect.west = rect.west - 0.0001 * factor;
    rect.south = rect.south - 0.0001 * factor;
    rect.north = rect.north + 0.0001 * factor;

    return rect;
  }
  rect.east = rect.east + rect.width * factor;
  rect.west = rect.west - rect.width * factor;
  rect.south = rect.south - rect.height * factor;
  rect.north = rect.north + rect.height * factor;

  return rect;
}
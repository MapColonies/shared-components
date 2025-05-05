import { Cartesian3, Math as CesiumMath, defined, PerspectiveFrustum, Rectangle, SceneMode } from 'cesium';
import { BBox, Feature, Point } from 'geojson';
import bboxPolygon from '@turf/bbox-polygon';
import { point } from '@turf/helpers';
import pointToPolygonDistance from '@turf/point-to-polygon-distance';
import { CesiumViewer } from '../map';
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
  const fullRect = camera.computeViewRectangle(scene.globe.ellipsoid);

  // Check if fullRect is valid before proceeding
  if (!defined(fullRect) || !fullRect) {
    console.error('computeViewRectangle returned invalid rectangle.');
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

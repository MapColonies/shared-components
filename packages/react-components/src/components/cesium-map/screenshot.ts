import type { CesiumViewer } from './map';

export interface ICaptureDimensions {
  width: number;
  height: number;
}

export interface ICaptureOptions extends ICaptureDimensions {
  pixelRatio?: number;
  format?: 'image/png' | 'image/jpeg';
  quality?: number;
  waitForTiles?: boolean;
}

export interface ICenteredCropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  fits: boolean;
}

export interface ICesiumScreenshotApi {
  capture(options: ICaptureOptions): Promise<Blob>;
  captureViewport(options?: Omit<ICaptureOptions, 'width' | 'height'>): Promise<Blob>;
}

const DEFAULT_FORMAT = 'image/png';
const WAIT_FOR_TILES_TIMEOUT_MS = 5000;

export const calculateCenteredCropRegion = (
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): ICenteredCropRegion => {
  const width = Math.min(targetWidth, sourceWidth);
  const height = Math.min(targetHeight, sourceHeight);
  return {
    x: (sourceWidth - width) / 2,
    y: (sourceHeight - height) / 2,
    width,
    height,
    fits: targetWidth <= sourceWidth && targetHeight <= sourceHeight,
  };
};

const waitForTilesToSettle = (viewer: CesiumViewer, timeoutMs: number): Promise<void> => {
  return new Promise((resolve) => {
    if (viewer.scene.globe.tilesLoaded) {
      resolve();
      return;
    }
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      removeListener();
      clearTimeout(timer);
      resolve();
    };
    const removeListener = viewer.scene.globe.tileLoadProgressEvent.addEventListener(
      (pendingRequests: number) => {
        if (pendingRequests === 0) finish();
      }
    );
    const timer = setTimeout(finish, timeoutMs);
  });
};

const renderAndCrop = async (viewer: CesiumViewer, options: ICaptureOptions): Promise<Blob> => {
  if (viewer.isDestroyed()) {
    throw new Error('capture: Cesium viewer is not available');
  }
  const sourceCanvas = viewer.scene?.canvas;
  if (!sourceCanvas) {
    throw new Error('capture: Cesium scene canvas is not available');
  }
  if (options.width <= 0 || options.height <= 0) {
    throw new Error(`capture: invalid dimensions ${options.width}x${options.height}`);
  }

  if (options.waitForTiles) {
    await waitForTilesToSettle(viewer, WAIT_FOR_TILES_TIMEOUT_MS);
  }

  viewer.scene.render();

  const crop = calculateCenteredCropRegion(
    sourceCanvas.width,
    sourceCanvas.height,
    options.width,
    options.height
  );
  if (!crop.fits) {
    throw new Error(
      `capture: requested capture size ${options.width}x${options.height} exceeds the current viewport ${sourceCanvas.width}x${sourceCanvas.height}`
    );
  }

  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = options.width;
  targetCanvas.height = options.height;
  const targetContext = targetCanvas.getContext('2d');
  if (!targetContext) {
    throw new Error('capture: could not create 2D context for the target canvas');
  }

  try {
    targetContext.drawImage(
      sourceCanvas,               // source image
      crop.x, crop.y,             // starting position in SOURCE
      crop.width, crop.height,    // SIZE TO COPY from source — equals options.width/height when it fits
      0, 0,                       // starting position in TARGET
      options.width,              // SIZE TO PAINT to in target
      options.height);
  } catch (err) {
    throw new Error(
      `capture: failed to draw source canvas (possibly tainted by cross-origin imagery): ${String(err)}`
    );
  }

  return await new Promise<Blob>((resolve, reject) => {
    targetCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('capture: canvas.toBlob() returned null — canvas may be tainted by cross-origin imagery'));
          return;
        }
        resolve(blob);
      },
      options.format ?? DEFAULT_FORMAT,
      options.quality
    );
  });
};

export const CesiumScreenshotMixin = (viewer: CesiumViewer): void => {
  if (Object.prototype.hasOwnProperty.call(viewer, 'screenshot')) {
    throw new Error('screenshot is already defined by another mixin.');
  }

  const api: ICesiumScreenshotApi = {
    capture: (options) => renderAndCrop(viewer, options),
    captureViewport: (options) =>
      renderAndCrop(viewer, {
        ...options,
        width: viewer.scene.canvas.width,
        height: viewer.scene.canvas.height,
      }),
  };

  Object.defineProperty(viewer, 'screenshot', { value: api, writable: false, configurable: false });
};

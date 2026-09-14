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

export interface ICropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ICesiumScreenshotApi {
  capture(options: ICaptureOptions): Promise<Blob>;
  captureViewport(options?: Omit<ICaptureOptions, 'width' | 'height'>): Promise<Blob>;
}

const DEFAULT_FORMAT = 'image/png';
const MAX_RESOLUTION_SCALE = 4;
const WAIT_FOR_TILES_TIMEOUT_MS = 5000;

export const calculateCoverCropRegion = (sourceAspect: number, targetAspect: number): ICropRegion => {
  if (sourceAspect > targetAspect) {
    // Source is relatively wider than the target: crop its width, keep full height.
    const width = targetAspect / sourceAspect;
    return { x: (1 - width) / 2, y: 0, width, height: 1 };
  }
  if (sourceAspect < targetAspect) {
    // Source is relatively taller than the target: crop its height, keep full width.
    const height = sourceAspect / targetAspect;
    return { x: 0, y: (1 - height) / 2, width: 1, height };
  }
  return { x: 0, y: 0, width: 1, height: 1 };
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

  const targetAspect = options.width / options.height;
  const originalResolutionScale = viewer.resolutionScale;

  try {
    const baseCrop = calculateCoverCropRegion(sourceCanvas.width / sourceCanvas.height, targetAspect);
    const baseCropWidthPx = baseCrop.width * sourceCanvas.width;
    const baseCropHeightPx = baseCrop.height * sourceCanvas.height;
    const requiredMultiplier = Math.max(
      options.width / baseCropWidthPx,
      options.height / baseCropHeightPx,
      1
    ) * (options.pixelRatio ?? 1);
    const newResolutionScale = Math.min(originalResolutionScale * requiredMultiplier, MAX_RESOLUTION_SCALE);

    if (newResolutionScale !== originalResolutionScale) {
      viewer.resolutionScale = newResolutionScale;
      viewer.resize();
    }

    viewer.scene.render();

    const crop = calculateCoverCropRegion(sourceCanvas.width / sourceCanvas.height, targetAspect);
    const sx = crop.x * sourceCanvas.width;
    const sy = crop.y * sourceCanvas.height;
    const sWidth = crop.width * sourceCanvas.width;
    const sHeight = crop.height * sourceCanvas.height;

    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = options.width;
    targetCanvas.height = options.height;
    const targetContext = targetCanvas.getContext('2d');
    if (!targetContext) {
      throw new Error('capture: could not create 2D context for the target canvas');
    }

    try {
      targetContext.drawImage(
        sourceCanvas,       // source image
        sx, sy,             // starting position in SOURCE
        sWidth, sHeight,    // SIZE TO COPY from source
        0, 0,               // starting position in TARGET
        options.width,      // SIZE TO PAINT to in target
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
  } finally {
    if (viewer.resolutionScale !== originalResolutionScale) {
      viewer.resolutionScale = originalResolutionScale;
      viewer.resize();
    }
  }
};

export const CesiumScreenshotMixin = (viewer: CesiumViewer): void => {
  if (Object.prototype.hasOwnProperty.call(viewer, 'screenshot')) {
    throw new Error('screenshot is already defined by another mixin.');
  }

  let queue: Promise<unknown> = Promise.resolve();
  const enqueue = <T,>(task: () => Promise<T>): Promise<T> => {
    const result = queue.then(task, task);
    queue = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  };

  const api: ICesiumScreenshotApi = {
    capture: (options) => enqueue(() => renderAndCrop(viewer, options)),
    captureViewport: (options) =>
      enqueue(() =>
        renderAndCrop(viewer, {
          ...options,
          width: viewer.scene.canvas.width,
          height: viewer.scene.canvas.height,
        })
      ),
  };

  Object.defineProperty(viewer, 'screenshot', { value: api, writable: false, configurable: false });
};

import { CesiumViewer } from './map';

/**
 * Named output sizes for {@link captureCesiumScreenshot}.
 * Thumbnail/preview/detail image dimensions: a small list-row-scale
 * thumbnail, a medium preview-card size, and a larger detail size.
 * All share a 1:1 (square) aspect ratio so the same "cover" crop logic 
 * applies uniformly regardless of the source canvas's own ratio.
 */
export enum CesiumScreenshotSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

export interface ICesiumScreenshotDimensions {
  width: number;
  height: number;
}

export const CESIUM_SCREENSHOT_SIZES: Readonly<Record<CesiumScreenshotSize, ICesiumScreenshotDimensions>> = {
  [CesiumScreenshotSize.SMALL]: { width: 128, height: 128 },
  [CesiumScreenshotSize.MEDIUM]: { width: 256, height: 256 },
  [CesiumScreenshotSize.LARGE]: { width: 1024, height: 1024 },
};

export interface ICaptureCesiumScreenshotOptions {
  size: CesiumScreenshotSize;
  format?: 'image/png' | 'image/jpeg';
  quality?: number;
}

const DEFAULT_FORMAT = 'image/png';

/**
 * Captures the Cesium viewer's canvas as an image, resized to one of the predefined
 * {@link CesiumScreenshotSize} dimensions.
 *
 * Captures exactly what is currently rendered on screen right now — it does not wait for
 * in-flight imagery/terrain tiles to finish loading. Callers that need a "settled" view should
 * wait for their own readiness signal (e.g. `scene.globe.tileLoadProgressEvent` /
 * `scene.globe.tilesLoaded`) before calling this function; an unbounded internal wait is 
 * deliberately not built in here.
 *
 * Only the Cesium canvas itself is captured — Cesium/DOM widgets rendered alongside it
 * (compass, base-layer picker, credits, etc.) are separate DOM elements outside the canvas and
 * are therefore never included, with no special-casing required.
 *
 * Requires the viewer to have been constructed with `contextOptions.webgl.preserveDrawingBuffer`
 * enabled (set by default in `CesiumMap`) — without it, the WebGL drawing buffer is not
 * guaranteed to still hold the last-rendered frame by the time this function reads it.
 *
 * @returns a Blob in the requested format. Rejects with a descriptive Error if the viewer/canvas
 * is unavailable, the size is invalid, or the browser refuses to encode the canvas (e.g. a
 * cross-origin imagery response tainted the canvas).
 */
export const captureCesiumScreenshot = (
  viewer: CesiumViewer | undefined,
  options: ICaptureCesiumScreenshotOptions
): Promise<Blob> => {
  if (!viewer || viewer.isDestroyed()) {
    return Promise.reject(new Error('captureCesiumScreenshot: Cesium viewer is not available'));
  }

  const sourceCanvas = viewer.scene?.canvas;
  if (!sourceCanvas) {
    return Promise.reject(new Error('captureCesiumScreenshot: Cesium scene canvas is not available'));
  }

  const dimensions = CESIUM_SCREENSHOT_SIZES[options.size];
  if (!dimensions) {
    return Promise.reject(new Error(`captureCesiumScreenshot: unknown size "${String(options.size)}"`));
  }

  // Flush the current camera/scene state to the (preserveDrawingBuffer-enabled) WebGL buffer
  // immediately before reading it, without altering camera position or recreating the viewer.
  viewer.scene.render();

  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = dimensions.width;
  targetCanvas.height = dimensions.height;
  const targetContext = targetCanvas.getContext('2d');
  if (!targetContext) {
    return Promise.reject(new Error('captureCesiumScreenshot: could not create 2D context for the target canvas'));
  }

  // "Cover" crop: preserve aspect ratio, fill the entire target, crop overflow — never stretch.
  const sourceRatio = sourceCanvas.width / sourceCanvas.height;
  const targetRatio = dimensions.width / dimensions.height;
  let sx = 0;
  let sy = 0;
  let sWidth = sourceCanvas.width;
  let sHeight = sourceCanvas.height;
  if (sourceRatio > targetRatio) {
    sWidth = sourceCanvas.height * targetRatio;
    sx = (sourceCanvas.width - sWidth) / 2;
  } else if (sourceRatio < targetRatio) {
    sHeight = sourceCanvas.width / targetRatio;
    sy = (sourceCanvas.height - sHeight) / 2;
  }

  try {
    targetContext.drawImage(
      sourceCanvas,       // source image
      sx, sy,             // starting position in SOURCE
      sWidth, sHeight,    // SIZE TO COPY from source
      0, 0,               // starting position in TARGET
      dimensions.width,   // SIZE TO PAINT to in target
      dimensions.height);
  } catch (err) {
    return Promise.reject(
      new Error(`captureCesiumScreenshot: failed to draw source canvas (possibly tainted by cross-origin imagery): ${String(err)}`)
    );
  }

  return new Promise<Blob>((resolve, reject) => {
    targetCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('captureCesiumScreenshot: canvas.toBlob() returned null — canvas may be tainted by cross-origin imagery'));
          return;
        }
        resolve(blob);
      },
      options.format ?? DEFAULT_FORMAT,
      options.quality
    );
  });
};

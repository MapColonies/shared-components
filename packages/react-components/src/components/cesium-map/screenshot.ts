import type { CesiumViewer } from './map';

import './screenshot.css';

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

export interface ICesiumScreenshotApi {
  capture(options: ICaptureOptions): Promise<Blob>;
  captureViewport(options?: Omit<ICaptureOptions, 'width' | 'height'>): Promise<Blob>;
  startCapturePreview(dimensions: ICaptureDimensions): void;
  stopCapturePreview(): void;
}

const DEFAULT_FORMAT = 'image/png';
const WAIT_FOR_TILES_TIMEOUT_MS = 5000;

interface ICenteredCropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  fits: boolean;
}

const calculateCenteredCropRegion = (
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
    throw new Error('[Shared-Components][CesiumCapture]: Cesium viewer is not available');
  }
  const sourceCanvas = viewer.scene?.canvas;
  if (!sourceCanvas) {
    throw new Error('[Shared-Components][CesiumCapture]: Cesium scene canvas is not available');
  }
  if (options.width <= 0 || options.height <= 0) {
    throw new Error(`[Shared-Components][CesiumCapture]: invalid dimensions ${options.width}x${options.height}`);
  }

  if (options.waitForTiles) {
    await waitForTilesToSettle(viewer, WAIT_FOR_TILES_TIMEOUT_MS);
  }

  viewer.scene.render(); // ALEX: worth to check if this is needed, but it seems to be required to get the latest frame rendered before cropping

  const crop = calculateCenteredCropRegion(
    sourceCanvas.width,
    sourceCanvas.height,
    options.width,
    options.height
  );
  if (!crop.fits) {
    throw new Error(
      `[Shared-Components][CesiumCapture]: requested capture size ${options.width}x${options.height} exceeds the current viewport ${sourceCanvas.width}x${sourceCanvas.height}`
    );
  }

  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = options.width;
  targetCanvas.height = options.height;
  const targetContext = targetCanvas.getContext('2d');
  if (!targetContext) {
    throw new Error('[Shared-Components][CesiumCapture]: could not create 2D context for the target canvas');
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
      `[Shared-Components][CesiumCapture]: failed to draw source canvas (possibly tainted by cross-origin imagery): ${String(err)}`
    );
  }

  return await new Promise<Blob>((resolve, reject) => {
    targetCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('[Shared-Components][CesiumCapture]: canvas.toBlob() returned null — canvas may be tainted by cross-origin imagery'));
          return;
        }
        resolve(blob);
      },
      options.format ?? DEFAULT_FORMAT,
      options.quality
    );
  });
};

interface ICapturePreviewElements {
  root: HTMLDivElement;
  dimTop: HTMLDivElement;
  dimBottom: HTMLDivElement;
  dimLeft: HTMLDivElement;
  dimRight: HTMLDivElement;
  rect: HTMLDivElement;
  label: HTMLDivElement;
}

interface ICapturePreview extends ICapturePreviewElements {
  resizeObserver: ResizeObserver;
  dimensions: ICaptureDimensions;
}

const createCapturePreviewElements = (): ICapturePreviewElements => {
  const root = document.createElement('div');
  root.className = 'screenshot-capture-overlay';

  const createDim = (): HTMLDivElement => {
    const dim = document.createElement('div');
    dim.className = 'screenshot-capture-dim';
    root.appendChild(dim);
    return dim;
  };

  const rect = document.createElement('div');
  rect.className = 'screenshot-capture-rect';
  root.appendChild(rect);

  const label = document.createElement('div');
  label.className = 'screenshot-capture-label';
  rect.appendChild(label);

  return { root, dimTop: createDim(), dimBottom: createDim(), dimLeft: createDim(), dimRight: createDim(), rect, label };
};

export const CesiumScreenshotMixin = (viewer: CesiumViewer): void => {
  if (Object.prototype.hasOwnProperty.call(viewer, 'screenshot')) {
    throw new Error('[Shared-Components][CesiumCapture]: screenshot is already defined by another mixin');
  }

  let preview: ICapturePreview | null = null;

  const positionCapturePreview = (): void => {
    if (!preview || viewer.isDestroyed()) {
      return;
    }
    const canvas = viewer.scene?.canvas;
    if (!canvas) {
      return;
    }
    const pixelRatio = canvas.clientWidth > 0 ? canvas.width / canvas.clientWidth : 1;
    const region = calculateCenteredCropRegion(
      canvas.width,
      canvas.height,
      preview.dimensions.width,
      preview.dimensions.height
    );
    const left = region.x / pixelRatio;
    const top = region.y / pixelRatio;
    const width = region.width / pixelRatio;
    const height = region.height / pixelRatio;

    preview.rect.style.left = `${left}px`;
    preview.rect.style.top = `${top}px`;
    preview.rect.style.width = `${width}px`;
    preview.rect.style.height = `${height}px`;
    preview.label.textContent = `${preview.dimensions.width}×${preview.dimensions.height}`;

    preview.dimTop.style.left = '0';
    preview.dimTop.style.top = '0';
    preview.dimTop.style.right = '0';
    preview.dimTop.style.height = `${top}px`;

    preview.dimBottom.style.left = '0';
    preview.dimBottom.style.top = `${top + height}px`;
    preview.dimBottom.style.right = '0';
    preview.dimBottom.style.bottom = '0';

    preview.dimLeft.style.left = '0';
    preview.dimLeft.style.top = `${top}px`;
    preview.dimLeft.style.width = `${left}px`;
    preview.dimLeft.style.height = `${height}px`;

    preview.dimRight.style.left = `${left + width}px`;
    preview.dimRight.style.top = `${top}px`;
    preview.dimRight.style.right = '0';
    preview.dimRight.style.height = `${height}px`;
  };

  const startCapturePreview = (dimensions: ICaptureDimensions): void => {
    if (viewer.isDestroyed()) {
      return;
    }
    if (!preview) {
      const elements = createCapturePreviewElements();
      viewer.container.appendChild(elements.root);
      const resizeObserver = new ResizeObserver(() => positionCapturePreview());
      resizeObserver.observe(viewer.container);
      preview = { ...elements, resizeObserver, dimensions };
    } else {
      preview.dimensions = dimensions;
    }
    positionCapturePreview();
  };

  const stopCapturePreview = (): void => {
    if (!preview) {
      return;
    }
    preview.resizeObserver.disconnect();
    preview.root.remove();
    preview = null;
  };

  const originalDestroy = viewer.destroy.bind(viewer);
  viewer.destroy = ((): void => {
    stopCapturePreview();
    originalDestroy();
  }) as typeof viewer.destroy;

  const api: ICesiumScreenshotApi = {
    capture: (options) => renderAndCrop(viewer, options),
    captureViewport: (options) =>
      renderAndCrop(viewer, {
        ...options,
        width: viewer.scene.canvas.width,
        height: viewer.scene.canvas.height,
      }),
    startCapturePreview,
    stopCapturePreview,
  };

  Object.defineProperty(viewer, 'screenshot', { value: api, writable: false, configurable: false });
};

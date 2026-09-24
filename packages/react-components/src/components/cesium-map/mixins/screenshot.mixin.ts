import { createDomElement } from '../../utils/dom';
import { isCesiumSceneLoading } from '../../utils/tile-loading';
import type { CesiumViewer } from '../map';

import '@map-colonies/react-core/dist/circular-progress/styles';
import './screenshot.css';

const SPINNER_SIZE_PX = 28;
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const createIndeterminateSpinner = (sizePx: number): HTMLDivElement => {
  const wrapper = createDomElement('div', 'rmwc-circular-progress rmwc-circular-progress--indeterminate');
  wrapper.style.fontSize = `${sizePx}px`;
  wrapper.setAttribute('role', 'progressbar');
  wrapper.setAttribute('aria-valuemin', '0');
  wrapper.setAttribute('aria-valuemax', '1');

  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('class', 'rmwc-circular-progress__circle');
  svg.setAttribute('viewBox', `0 0 ${sizePx} ${sizePx}`);

  const circle = document.createElementNS(SVG_NAMESPACE, 'circle');
  circle.setAttribute('class', 'rmwc-circular-progress__path');
  circle.setAttribute('cx', String(sizePx / 2));
  circle.setAttribute('cy', String(sizePx / 2));
  circle.setAttribute('r', String(sizePx / 2.4));

  svg.appendChild(circle);
  wrapper.appendChild(svg);
  return wrapper;
};

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

export type ScreenshotLoadingListener = (isLoading: boolean) => void;

export interface ICesiumScreenshotApi {
  capture(options: ICaptureOptions): Promise<Blob>;
  captureViewport(options?: Omit<ICaptureOptions, 'width' | 'height'>): Promise<Blob>;
  startCapturePreview(dimensions: ICaptureDimensions): void;
  stopCapturePreview(): void;
  isContentLoading(): boolean;
  onLoadingChange(listener: ScreenshotLoadingListener): () => void;
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

const waitForScreenshotContent = (viewer: CesiumViewer, timeoutMs: number): Promise<void> => {
  return new Promise((resolve) => {
    if (!isCesiumSceneLoading(viewer)) {
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
    const removeListener = viewer.scene.postRender.addEventListener(() => {
      if (!isCesiumSceneLoading(viewer)) finish();
    });
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
    await waitForScreenshotContent(viewer, WAIT_FOR_TILES_TIMEOUT_MS);
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

  const targetCanvas = createDomElement('canvas');
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
  spinner: HTMLDivElement;
}

interface ICapturePreview extends ICapturePreviewElements {
  resizeObserver: ResizeObserver;
  dimensions: ICaptureDimensions;
}

const createCapturePreviewElements = (): ICapturePreviewElements => {
  const root = createDomElement('div', 'screenshot-capture-overlay');

  const createDim = (): HTMLDivElement => {
    const dim = createDomElement('div', 'screenshot-capture-dim');
    root.appendChild(dim);
    return dim;
  };

  const rect = createDomElement('div', 'screenshot-capture-rect');
  root.appendChild(rect);

  const label = createDomElement('div', 'screenshot-capture-label');
  rect.appendChild(label);

  const spinner = createDomElement('div', 'screenshot-capture-spinner');
  spinner.appendChild(createIndeterminateSpinner(SPINNER_SIZE_PX));
  rect.appendChild(spinner);

  return { root, dimTop: createDim(), dimBottom: createDim(), dimLeft: createDim(), dimRight: createDim(), rect, label, spinner };
};

export const CesiumScreenshotMixin = (viewer: CesiumViewer): void => {
  if (Object.prototype.hasOwnProperty.call(viewer, 'screenshot')) {
    throw new Error('[Shared-Components][CesiumCapture]: screenshot is already defined by another mixin');
  }

  let preview: ICapturePreview | null = null;
  let isLoadingTracked = false;
  let removePostRenderListener: (() => void) | null = null;
  const loadingListeners = new Set<ScreenshotLoadingListener>();

  const updatePreviewSpinner = (isLoading: boolean): void => {
    preview?.spinner.classList.toggle('screenshot-capture-spinner--visible', isLoading);
  };

  const checkLoadingChanged = (): void => {
    const nextIsLoading = isCesiumSceneLoading(viewer);
    if (nextIsLoading !== isLoadingTracked) {
      isLoadingTracked = nextIsLoading;
      loadingListeners.forEach((listener) => listener(isLoadingTracked));
    }
    updatePreviewSpinner(isLoadingTracked);
  };

  const ensureLoadingTracking = (): void => {
    if (removePostRenderListener || viewer.isDestroyed()) {
      return;
    }
    isLoadingTracked = isCesiumSceneLoading(viewer);
    updatePreviewSpinner(isLoadingTracked);
    removePostRenderListener = viewer.scene.postRender.addEventListener(checkLoadingChanged);
  };

  const stopLoadingTrackingIfIdle = (): void => {
    if (preview || loadingListeners.size > 0) {
      return;
    }
    if (removePostRenderListener) {
      removePostRenderListener();
      removePostRenderListener = null;
    }
  };

  const onLoadingChange = (listener: ScreenshotLoadingListener): (() => void) => {
    loadingListeners.add(listener);
    ensureLoadingTracking();
    listener(isLoadingTracked);
    return (): void => {
      loadingListeners.delete(listener);
      stopLoadingTrackingIfIdle();
    };
  };

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
    ensureLoadingTracking();
    positionCapturePreview();
  };

  const stopCapturePreview = (): void => {
    if (!preview) {
      return;
    }
    preview.resizeObserver.disconnect();
    preview.root.remove();
    preview = null;
    stopLoadingTrackingIfIdle();
  };

  const originalDestroy = viewer.destroy.bind(viewer);
  viewer.destroy = ((): void => {
    stopCapturePreview();
    if (removePostRenderListener) {
      removePostRenderListener();
      removePostRenderListener = null;
    }
    loadingListeners.clear();
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
    isContentLoading: () => isCesiumSceneLoading(viewer),
    onLoadingChange,
  };

  Object.defineProperty(viewer, 'screenshot', { value: api, writable: false, configurable: false });
};

import * as Cesium from 'cesium';
import { get } from 'lodash';

interface ActiveLayersMixinOptions {
  locale?: { [key: string]: string };
  containerSelector?: string;
}

export function ActiveLayersMixin(viewer: Cesium.Viewer, options: ActiveLayersMixinOptions) {
  const DEFAULT_OPTIONS = { containerSelector: '.cesium-viewer-toolbar' };
  options = { ...DEFAULT_OPTIONS, ...options };

  class ActiveLayers {
    viewer: Cesium.Viewer;
    options: any;
    contentDiv: HTMLElement | null;

    constructor(viewer: Cesium.Viewer, options: any) {
      this.viewer = viewer;
      this.options = options;
      this.contentDiv = null;

      this.createToggleButtonAndDiv();
    }

    createToggleButtonAndDiv() {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'cesium-toolbar-button cesium-button';
      const icon = `
        <svg width="100%" height="100%" viewBox="0 0 24 24">
          <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/>
        </svg>`;
      buttonContainer.innerHTML = icon;
      buttonContainer.onclick = () => {
        this.toggleContent();
      };

      this.contentDiv = document.createElement('div');
      this.contentDiv.className = 'cesium-mcMixin-dropDown cesium-mcMixin-dropDown-visible';
      this.contentDiv.style.display = 'none';

      const toolbar = document.querySelector(this.options.containerSelector);
      if (toolbar) {
        toolbar.appendChild(buttonContainer);
        toolbar.appendChild(this.contentDiv);
      }
      this.populateContent();
    }

    populateContent() {
      if (this.contentDiv) {
        this.contentDiv.innerHTML = `<div class="cesium-mcMixin-sectionTitle">${get(this.options.locale, 'ACTIVE_LAYERS_TITLE') ?? 'Active Layers'}</div>`;
        // TODO
      }
    }

    toggleContent() {
      if (this.contentDiv) {
        this.contentDiv.style.display = this.contentDiv.style.display === 'none' ? 'block' : 'none';
      }
    }

    destroy() {
      if (this.contentDiv) {
        try {
          if (this.contentDiv.parentNode) {
            document.body.removeChild(this.contentDiv);
          }
        } catch (error) {
          console.error('Error removing active layers:', error);
        } finally {
          this.contentDiv = null;
        }
      }
    }
  }

  if (typeof Cesium === "undefined") {
    throw new Error("[ActiveLayersMixin] Cesium is required.");
  }

  if (!Cesium.defined(viewer)) {
    throw new Cesium.DeveloperError("[ActiveLayersMixin] Viewer is required.");
  }

  const activeLayers = new ActiveLayers(viewer, options);

  const viewerDestroyFunc = viewer.destroy;

  viewer.destroy = function () {
    viewerDestroyFunc.call(viewer);
    activeLayers.destroy();
  };

  Object.defineProperties(viewer, {
    activeLayers: {
      get: function () {
        return activeLayers;
      }
    }
  });
}

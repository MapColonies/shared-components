import * as Cesium from 'cesium';
import { get } from 'lodash';

interface ActiveLayersMixinOptions {
  locale?: { [key: string]: string };
  containerSelector?: string;
}

export function ActiveLayersMixin(viewer: Cesium.Viewer, options: ActiveLayersMixinOptions) {
  const DEFAULT_OPTIONS = { containerSelector: '.cesium-widget' };
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
      buttonContainer.className = 'cesium-cesiumInspector-button';
      buttonContainer.innerHTML = get(this.options.locale, 'ACTIVE_LAYERS_TITLE') ?? 'Active Layers';
      buttonContainer.onclick = () => {
        this.toggleContent();
      };

      this.contentDiv = document.createElement('div');
      this.contentDiv.className = 'cesium-cesiumInspector-dropDown';
      this.contentDiv.style.display = 'none';

      const inspector = document.createElement('div');
      inspector.className = 'cesium-cesiumInspector cesium-cesiumInspector-hidden';
      inspector.appendChild(buttonContainer);
      inspector.appendChild(this.contentDiv);

      const container = document.createElement('div');
      container.className = 'cesium-viewer-cesiumInspectorContainer active-layers';
      container.appendChild(inspector);

      const widget = document.querySelector(this.options.containerSelector);
      if (widget) {
        widget.appendChild(container);
      }

      this.populateContent();
    }

    populateContent() {
      if (this.contentDiv) {
        this.contentDiv.innerHTML = `bla bla bla\n bla1 bla2\n bla3 bla4<br/>kuku muku kuku muku`;
      }
    }

    toggleContent() {
      if (this.contentDiv) {
        this.contentDiv.style.display = this.contentDiv.style.display === 'none' ? 'block' : 'none';
        const inspector = this.contentDiv.parentElement;
        if (inspector) {
          if (inspector.classList.contains('cesium-cesiumInspector-hidden')) {
            inspector.classList.remove('cesium-cesiumInspector-hidden');
            inspector.classList.add('cesium-cesiumInspector-visible');
          } else {
            inspector.classList.remove('cesium-cesiumInspector-visible');
            inspector.classList.add('cesium-cesiumInspector-hidden');
          }
        }
      }
    }

    destroy() {
      if (this.contentDiv) {
        try {
          const parentNode = this.contentDiv.parentNode;
          if (parentNode) {
            parentNode.removeChild(this.contentDiv);
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

import * as Cesium from 'cesium';
import { get } from 'lodash';
// import InspectorShared from '@cesium/widgets/Source/InspectorShared.js';

export function DebugPanelMixin(viewer: Cesium.Viewer, options: any = {}) {
  const DEFAULT_OPTIONS = { containerSelector: '.cesium-viewer-toolbar' };
  
  options = { ...DEFAULT_OPTIONS, ...options };

  class DebugPanel {
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
      this.contentDiv.className = 'cesium-baseLayerPicker-dropDown cesium-baseLayerPicker-dropDown-visible';
      this.contentDiv.style.display = 'none';
      this.populateContent();

      const toolbar = document.querySelector(this.options.containerSelector);
      if (toolbar) {
        toolbar.appendChild(buttonContainer);
        toolbar.appendChild(this.contentDiv);
      }
    }

    populateContent() {
      if (this.contentDiv) {
        this.contentDiv.innerHTML = `<div class="cesium-baseLayerPicker-sectionTitle">${get(this.options.locale, 'DEBUG_PANEL_TITLE') ?? 'Debugger Tool'}</div>`;
        this.contentDiv.innerHTML += `<WFS locale={${this.options.locale}} />`;
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
          console.error('Error removing debug panel:', error);
        } finally {
          this.contentDiv = null;
        }
      }
    }
  }

  if (typeof Cesium === "undefined") {
    throw new Error("[DebugPanelMixin] Cesium is required.");
  }

  if (!Cesium.defined(viewer)) {
    throw new Cesium.DeveloperError("[DebugPanelMixin] Viewer is required.");
  }

  const debugPanel = new DebugPanel(viewer, options);

  const viewerDestroyFunc = viewer.destroy;

  viewer.destroy = function () {
    viewerDestroyFunc.call(viewer);
    debugPanel.destroy();
  };

  Object.defineProperties(viewer, {
    debugPanel: {
      get: function () {
        return debugPanel;
      }
    }
  });
}

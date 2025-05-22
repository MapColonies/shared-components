import * as Cesium from 'cesium';
import InspectorShared from '@cesium/widgets/Source/InspectorShared.js';

export function DebugPanelMixin(viewer: Cesium.Viewer, options: any = {}) {
  const DEFAULT_OPTIONS = { jsonData: {} };
  
  options = { ...DEFAULT_OPTIONS, ...options };

  class DebugPanel {
    viewer: Cesium.Viewer;
    options: any;
    contentDiv: HTMLElement | null;

    constructor(viewer: Cesium.Viewer, options: any) {
      this.viewer = viewer;
      this.options = options;
      this.contentDiv = null;

      this.createToggleButton();
      this.createContentDiv();
    }

    createToggleButton() {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'cesium-toolbar-button cesium-button';
      const icon = `
        <svg width="100%" height="100%" viewBox="0 0 24 24">
          <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/>
        </svg>`;
      buttonContainer.innerHTML = icon;

      buttonContainer.onclick = () => {
        this.toggleContent();
        console.log('#############', InspectorShared);
      };

      // Append the button to the Cesium viewer toolbar
      const toolbar = document.querySelector('.cesium-viewer-toolbar');
      if (toolbar) {
        toolbar.appendChild(buttonContainer);
      }
    }

    createContentDiv() {
      this.contentDiv = document.createElement('div');
      this.contentDiv.className = 'cesium-baseLayerPicker-dropDown cesium-baseLayerPicker-dropDown-visible';
      this.contentDiv.style.display = 'none';

      this.populateContent();

      document.body.appendChild(this.contentDiv);
    }

    populateContent() {
      if (this.contentDiv) {
        this.contentDiv.innerHTML = `<pre>${JSON.stringify(this.options.jsonData, null, 2)}</pre>`;
      }
    }

    toggleContent() {
      if (this.contentDiv) {
        this.contentDiv.style.display = this.contentDiv.style.display === 'none' ? 'block' : 'none';
      }
    }

    destroy() {
      if (this.contentDiv) {
        document.body.removeChild(this.contentDiv);
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

import React from 'react'; // <- Important: import React to use JSX syntax (in order to fix error: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.)
import * as Cesium from 'cesium';
import { get } from 'lodash';
import { createRoot } from 'react-dom/client';
import { WFS } from '../debug/wfs';
import { IDebugPanel } from '../map';

interface DebugPanelMixinOptions {
  debugPanel: IDebugPanel;
  locale?: { [key: string]: string };
  containerSelector?: string;
}

export function DebugPanelMixin(viewer: Cesium.Viewer, options: DebugPanelMixinOptions) {
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
        <svg width="100%" height="100%" viewBox="-3 -3 26 26">
          <path d="M7 8a1 1 0 0 0-1 1v4a3 3 0 1 0 6 0v-4a1 1 0 0 0-1-1H7zm8.236-1h1.647V5a1 1 0 1 1 2 0v3a2 2 0 0 1-2 2H16v1h3a1 1 0 0 1 0 2h-3v1h.883a2 2 0 0 1 2 2v3a1 1 0 0 1-2 0v-3h-1.224A5.002 5.002 0 0 1 4.34 15H3v3a1 1 0 0 1-2 0v-3a2 2 0 0 1 2-2h1v-1H1a1 1 0 0 1 0-2h3v-1H3a2 2 0 0 1-2-2V5a1 1 0 1 1 2 0v3h1.764A2 2 0 0 1 6 7.17V5a2 2 0 0 1 2-2h.737c-.343-.598-.988-1-1.726-1H5a1 1 0 1 1 0-2h2.01A3.98 3.98 0 0 1 10 1.348 3.98 3.98 0 0 1 12.99 0H15a1 1 0 0 1 0 2h-2.01c-.74 0-1.384.402-1.727 1H12a2 2 0 0 1 2 2v2.17a2 2 0 0 1 1.236.83zM8 7h4V5H8v2z" fill="orange" />
          <circle cx="12" cy="12" r="10" fill="none" stroke="orange" stroke-width="2" />
          <line x1="4" y1="4" x2="20" y2="20" stroke="orange" stroke-width="2" />
        </svg>`;
      /*const icon = `
        <svg width="100%" height="100%" viewBox="-3 -3 26 26">
          <path d="M7 9a1 1 0 0 0-1 1v4a4 4 0 1 0 8 0v-4a1 1 0 0 0-1-1H7zm8.236-1h1.647V5a1 1 0 1 1 2 0v3a2 2 0 0 1-2 2H16v1h3a1 1 0 0 1 0 2h-3v1h.883a2 2 0 0 1 2 2v3a1 1 0 0 1-2 0v-3h-1.224A6.002 6.002 0 0 1 4.34 16H3v3a1 1 0 0 1-2 0v-3a2 2 0 0 1 2-2h1v-1H1a1 1 0 0 1 0-2h3v-1H3a2 2 0 0 1-2-2V5a1 1 0 1 1 2 0v3h1.764A3 3 0 0 1 6 7.17V5a2 2 0 0 1 2-2h.737c-.343-.598-.988-1-1.726-1H5a1 1 0 1 1 0-2h2.01A3.98 3.98 0 0 1 10 1.348 3.98 3.98 0 0 1 12.99 0H15a1 1 0 0 1 0 2h-2.01c-.74 0-1.384.402-1.727 1H12a2 2 0 0 1 2 2v2.17a3 3 0 0 1 1.236.83zM8 7h4V5H8v2z"></path>
        </svg>`;*/
      /*const icon = `
        <svg width="100%" height="100%" viewBox="0 0 24 24">
          <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/>
        </svg>`;*/
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
        this.contentDiv.innerHTML = `<div class="cesium-mcMixin-sectionTitle">${get(this.options.locale, 'DEBUG_PANEL_TITLE') ?? 'Debugger Tool'}</div>`;
        if (this.options.debugPanel.wfs) {
          const wfsContainer = document.createElement('div');
          const root = createRoot(wfsContainer);
          this.contentDiv.appendChild(wfsContainer);
          root.render(<WFS locale={this.options.locale} viewer={this.viewer as any} />);
        }
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

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

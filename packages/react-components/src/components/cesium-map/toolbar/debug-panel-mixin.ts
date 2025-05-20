import * as Cesium from 'cesium';

export function DebugPanelMixin(viewer: Cesium.Viewer, options: any = {}) {
  const DEFAULT_OPTIONS = { title: 'Debugger Tool' };

  options = { ...DEFAULT_OPTIONS, ...options };

  class DebugPanel {
    viewer: Cesium.Viewer;
    options: any;
    dialogElement: HTMLElement | null;

    constructor(viewer: Cesium.Viewer, options: any) {
      this.viewer = viewer;
      this.options = options;
      this.dialogElement = null;

      this.createDebugPanel();
    }

    private createDebugPanel() {
      const iconContainer = document.createElement('div');
      iconContainer.className = 'cesium-toolbar-button cesium-button';
      const icon = `
        <svg width="100%" height="100%" viewBox="0 0 24 24">
          <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/>
        </svg>`;
      iconContainer.innerHTML = icon;

      iconContainer.onclick = () => {
        this.toggleDialog();
      };

      // Append the icon to the Cesium viewer toolbar
      const toolbar = document.querySelector('.cesium-viewer-toolbar');
      toolbar?.appendChild(iconContainer);

      // Create the dialog
      this.dialogElement = this.createDialog();
    }

    private createDialog(): HTMLElement {
      const dialog = document.createElement('div');
      dialog.className = 'debugPanel';
      dialog.style.display = 'none'; // Initially hidden

      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = this.options.title;

      const content = document.createElement('div');
      content.className = 'content';

      dialog.appendChild(title);
      dialog.appendChild(content);

      document.body.appendChild(dialog);
      return dialog;
    }

    private toggleDialog() {
      if (this.dialogElement) {
        this.dialogElement.style.display = this.dialogElement.style.display === 'none' ? 'block' : 'none';
      }
    }

    destroy() {
      if (this.dialogElement) {
        document.body.removeChild(this.dialogElement);
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

import * as Cesium from 'cesium';

interface LegendMixinOptions {
  toggleSidebar: () => void;
  containerSelector?: string;
}

export function LegendMixin(viewer: Cesium.Viewer, options: LegendMixinOptions) {
  const DEFAULT_OPTIONS = { containerSelector: '.cesium-viewer-toolbar' };
  options = { ...DEFAULT_OPTIONS, ...options };

  class Legend {
    viewer: Cesium.Viewer;
    options: LegendMixinOptions;

    constructor(viewer: Cesium.Viewer, options: LegendMixinOptions) {
      this.viewer = viewer;
      this.options = options;

      this.createIconButton();
    }

    createIconButton() {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'cesium-toolbar-button cesium-button';

      const iconSVG = `
        <svg height="100%" width="100%" viewBox="-45 -45 650 650">
          <path d="M322.4,173.9l-129,16.2l-4.6,21.4l25.3,4.7c16.5,3.9,19.8,9.9,16.2,26.4l-41.5,195.3c-10.9,50.5,5.9,74.3,45.5,74.3
            c30.7,0,66.3-14.2,82.5-33.6l4.9-23.4c-11.3,9.9-27.7,13.9-38.6,13.9c-15.5,0-21.1-10.9-17.1-30L322.4,173.9z"></path>
          <circle cx="270.1" cy="56.3" r="56.3"></circle>
        </svg>`;
      buttonContainer.innerHTML = iconSVG;

      buttonContainer.addEventListener('click', () => {
        if (typeof this.options.toggleSidebar === 'function') {
          this.options.toggleSidebar();
        }
      });

      const toolbar = document.querySelector(this.options.containerSelector ?? '.cesium-viewer-toolbar');
      if (toolbar) {
        toolbar.appendChild(buttonContainer);
      }
    }
  }

  if (typeof Cesium === "undefined") {
    throw new Error("[LegendMixin] Cesium is required.");
  }

  if (!Cesium.defined(viewer)) {
    throw new Cesium.DeveloperError("[LegendMixin] Viewer is required.");
  }

  const legend = new Legend(viewer, options);

  const viewerDestroyFunc = viewer.destroy;

  viewer.destroy = function () {
    viewerDestroyFunc.call(viewer);
  };

  Object.defineProperties(viewer, {
    legend: {
      get: function () {
        return legend;
      }
    }
  });
}

import * as Cesium from 'cesium';
import { get } from 'lodash';
import { IBaseMaps } from '../map';

interface BaseMapPickerMixinOptions {
  baseMaps: IBaseMaps;
  terrains: Cesium.CesiumTerrainProvider[];
  locale?: { [key: string]: string };
  containerSelector?: string;
}

export function BaseMapPickerMixin(viewer: Cesium.Viewer, options: BaseMapPickerMixinOptions) {
  const DEFAULT_OPTIONS = { containerSelector: '.cesium-viewer-toolbar' };
  options = { ...DEFAULT_OPTIONS, ...options };

  class BaseMapPicker {
    viewer: Cesium.Viewer;
    options: any;
    baseLayerPicker: Cesium.BaseLayerPicker | undefined;
    
    constructor(viewer: Cesium.Viewer, options: any) {
      this.viewer = viewer;
      this.options = options;
      this.baseLayerPicker = undefined;

      let currentModel: Cesium.ProviderViewModel | undefined = undefined;

      const baseMapsImageryProviders = this.options.baseMaps.maps.map((baseMapLayer: any) => {
        const providers: Cesium.ImageryProvider[] = [];
        
        baseMapLayer.baseRasterLayers.sort((a: any, b: any) => a.zIndex - b.zIndex).forEach((layer: any) => {
          switch (layer.type) {
            case 'WMS_LAYER':
              const wmsProvider = new Cesium.WebMapServiceImageryProvider(layer.options);
              wmsProvider.defaultAlpha = layer.opacity;
              providers.push(wmsProvider);
              break;
            case 'XYZ_LAYER':
              const xyzProvider = new Cesium.UrlTemplateImageryProvider(layer.options);
              xyzProvider.defaultAlpha = layer.opacity;
              providers.push(xyzProvider);
              break;
            case 'WMTS_LAYER':
              const wmtsLayerOptions = layer.options;
              wmtsLayerOptions.tilingScheme = new Cesium.GeographicTilingScheme();
              const wmtsProvider = new Cesium.WebMapTileServiceImageryProvider(wmtsLayerOptions);
              wmtsProvider.defaultAlpha = layer.opacity;
              providers.push(wmtsProvider);
              break;
            default:
              break;
          }
        });

        const providerModel = new Cesium.ProviderViewModel({
          name: baseMapLayer.title,
          tooltip: baseMapLayer.title,
          iconUrl: baseMapLayer.thumbnail,
          creationFunction: () => {
            return providers;
          }
        });

        if (baseMapLayer.isCurrent) {
          currentModel = providerModel;
        }

        return providerModel;
      });

      const terrainProviders = this.options.terrains.map((terrain: Cesium.CesiumTerrainProvider) => {
        return new Cesium.ProviderViewModel({
          name: 'Terrain',
          tooltip: 'Default Terrain',
          iconUrl: 'Cesium/Widgets/Images/TerrainProviders/Ellipsoid.png',
          creationFunction: () => {
            return terrain;
          }
        });
      });

      this.baseLayerPicker = new Cesium.BaseLayerPicker(
        document.querySelector(this.options.containerSelector) as HTMLElement, {
          globe: viewer.scene.globe,
          imageryProviderViewModels: baseMapsImageryProviders,
          selectedImageryProviderViewModel: currentModel,
          terrainProviderViewModels: terrainProviders,
          selectedTerrainProviderViewModel: terrainProviders[0],
        }
      );

      // const viewModel = this.baseLayerPicker?.viewModel;
      // if (viewModel) {
      //   viewModel.selectedImageryProviderViewModel.changed.addEventListener(() => {
      //     const model = viewModel.selectedImageryProviderViewModel;
      //     if (model) {
      //       this.viewer.imageryLayers.removeAll();
      //       const providers = model.creationFunction();
      //       providers.forEach((provider: Cesium.ImageryProvider) => {
      //         this.viewer.imageryLayers.addImageryProvider(provider);
      //       });
      //     }
      //   });
      // }

      const titles = document.querySelectorAll('.cesium-baseLayerPicker-sectionTitle');
      if (titles.length > 0) {
        titles[0].innerHTML = get(this.options.locale, 'MAP_SETTINGS_BASE_MAP_TITLE') ?? 'Base Map';
      }
      if (titles.length > 1) {
        titles[1].innerHTML = get(this.options.locale, 'MAP_SETTINGS_TERRAIN_TITLE') ?? 'Terrain';
      }
    }

    destroy() {
      Cesium.destroyObject(this.baseLayerPicker);
      return Cesium.destroyObject(this);
    }
  }

  if (typeof Cesium === "undefined") {
    throw new Error("[BaseMapPickerMixin] Cesium is required.");
  }

  if (!Cesium.defined(viewer)) {
    throw new Cesium.DeveloperError("[BaseMapPickerMixin] Viewer is required.");
  }

  if (typeof options.baseMaps === 'undefined') {
  }

  const cesiumBaseMapPicker = new BaseMapPicker(viewer, options);

  const viewerDestroyFunc = viewer.destroy;

  viewer.destroy = function () {
    viewerDestroyFunc.call(viewer);
    cesiumBaseMapPicker.destroy();
  };

  Object.defineProperties(viewer, {
    baseMapPicker: {
      get: function () {
        return cesiumBaseMapPicker;
      }
    }
  });
}

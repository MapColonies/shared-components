/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Cesium3DTileset as CesiumTileset,
  ImageryLayer,
  UrlTemplateImageryProvider,
  WebMapServiceImageryProvider,
  WebMapTileServiceImageryProvider,
  Event,
  Rectangle,
  SingleTileImageryProvider,
} from 'cesium';
import { get, isEmpty, set } from 'lodash';
import { Feature, Point, Polygon } from 'geojson';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import {
  CustomUrlTemplateImageryProvider,
  CustomWebMapServiceImageryProvider,
  CustomWebMapTileServiceImageryProvider,
  HAS_TRANSPARENCY_META_PROP,
} from './helpers/customImageryProviders';
import { pointToGeoJSON } from './helpers/geojson/point.geojson';
import { cesiumRectangleContained } from './helpers/utils';
import { RCesiumOSMLayerOptions, RCesiumWMSLayerOptions, RCesiumWMTSLayerOptions, RCesiumXYZLayerOptions } from './layers';
import type { ICesiumWFSLayer, ICesiumWFSLayerMeta } from './layers/wfs.layer';
import { IMapLegend } from './legend';
import type { CesiumViewer, IBaseMap } from './map';
import { CesiumCartesian2, CesiumImageryProvider } from './proxied.types';

const INC = 1;
const DEC = -1;

export interface ILayerManagerMetaMapping {
  layer: {
    id: string;
    name: string;
    footprint?: string;
  };
  dataLayer?: {
    name?: string;
    fields?: string;
  };
}

let mapping: ILayerManagerMetaMapping = {
  layer: {
    id: 'id',
    name: 'name',
  },
};

const configureLayerManagerMetaMapping = (metaMapping: ILayerManagerMetaMapping): void => {
  mapping = { ...metaMapping };
};

export const getLayerManagerMetaMapping = (): ILayerManagerMetaMapping => {
  return { ...mapping };
};

export interface ICesiumImageryLayerMeta {
  id?: string;
  parentBaseMapId?: string;
  zIndex?: number;
  type?: LayerType;
  opacity?: number;
  show?: boolean;
  options?: RCesiumOSMLayerOptions | RCesiumWMSLayerOptions | RCesiumWMTSLayerOptions | RCesiumXYZLayerOptions;
  skipRelevancyCheck?: boolean;
  isRelevantToExtent?: boolean;
  hasTransparency?: boolean;
  examinedTiles?: Array<{ x?: number; y?: number; level?: number }>;
  [key: string]: unknown;
}

export interface ICesiumImageryLayer extends InstanceType<typeof ImageryLayer> {
  meta?: ICesiumImageryLayerMeta;
}

export type LayerType = 'OSM_LAYER' | 'WMTS_LAYER' | 'WMS_LAYER' | 'XYZ_LAYER';

export interface IRasterLayer {
  id: string;
  type: LayerType;
  opacity: number;
  zIndex: number;
  options: RCesiumOSMLayerOptions | RCesiumWMSLayerOptions | RCesiumWMTSLayerOptions | RCesiumXYZLayerOptions;
  show?: boolean;
  [key: string]: unknown;
}

export interface ICesium3DModelMeta {
  id?: string;
  [key: string]: unknown;
}

export interface ICesium3DModel {
  tileset: CesiumTileset;
  meta: ICesium3DModelMeta;
}

export interface ICesiumDataLayerField {
  fieldName: string;
  aliasFieldName: string;
  [key: string]: unknown;
}

export type LegendExtractor = (layers: (any & { meta: any })[]) => IMapLegend[];

export const TRANSPARENT_LAYER_ID = 'TRANSPARENT_BASE_LAYER';

export const getLayerId = (layer: ICesiumImageryLayer | ICesiumWFSLayer | ICesium3DModel): string | undefined => {
  return get(layer.meta, mapping.layer.id) as string | undefined;
};

export const getLayerIdFromMeta = (meta: ICesiumImageryLayerMeta | ICesiumWFSLayerMeta | ICesium3DModelMeta | undefined): string | undefined => {
  return get(meta, mapping.layer.id) as string | undefined;
};

export const getLayerName = (layer: ICesiumImageryLayer | ICesiumWFSLayer | ICesium3DModel): string | undefined => {
  return get(layer.meta, mapping.layer.name) as string | undefined;
};

export const getLayerFootprint = (meta: ICesiumWFSLayerMeta | undefined): unknown => {
  return get(meta, mapping.layer.footprint ?? '');
};

export const getDataLayerName = (meta: ICesiumWFSLayerMeta): string | undefined => {
  return get(meta, mapping.dataLayer?.name ?? '') as string | undefined;
};

export const getDataLayerFields = (meta: ICesiumWFSLayerMeta | undefined): ICesiumDataLayerField[] => {
  return (get(meta, mapping.dataLayer?.fields ?? '') as ICesiumDataLayerField[] | undefined) ?? [];
};

export const isServiceLayer = (layerId: string | undefined): boolean => {
  return isEmpty(layerId) || layerId === TRANSPARENT_LAYER_ID;
};

export const isManagedImageryLayer = (layerId: string | undefined): boolean => {
  return !isServiceLayer(layerId);
};

export const getParentBaseMapId = (meta: Record<string, unknown> | undefined): string | undefined => {
  return get(meta, 'parentBaseMapId') as string | undefined;
};

export const isBaseMapLayer = (meta: Record<string, unknown> | undefined): boolean => {
  return !!getParentBaseMapId(meta);
};

export const getImageryProvider = (layer: ICesiumImageryLayer): CesiumImageryProvider => {
  return get(layer, 'imageryProvider');
};

export const getImageryProviderUrl = (layer: ICesiumImageryLayer): string | undefined => {
  return get(layer, '_imageryProvider._resource._url');
};

export const getImageryProviderName = (provider: CesiumImageryProvider): string => {
  return provider.constructor.name;
};

class LayerManager {
  public mapViewer: CesiumViewer;

  public legendsList: IMapLegend[];
  public layerUpdated: Event;
  public dataLayerUpdated: Event;
  public modelUpdated: Event;
  private readonly layers: ICesiumImageryLayer[];
  private readonly dataLayers: ICesiumWFSLayer[];
  private readonly models: ICesium3DModel[];
  private readonly legendsExtractor?: LegendExtractor;
  private readonly layerManagerFootprintMetaFieldPath?: string;
  private shouldOptimizedTileRequests?: boolean;
  private relevancyListenersCleanup: Array<() => void>;
  private relevancyLayerUpdatedHandler?: (meta: Record<string, unknown>) => void;

  public constructor(
    mapViewer: CesiumViewer,
    layerManagerMetaMapping: ILayerManagerMetaMapping,
    legendsExtractor?: LegendExtractor,
    onLayersUpdate?: () => void,
    shouldOptimizedTileRequests?: boolean
  ) {
    this.mapViewer = mapViewer;
    // eslint-disable-next-line
    this.layers = (this.mapViewer.imageryLayers as any)._layers;
    this.dataLayers = [];
    this.models = [];
    this.legendsList = [];
    this.legendsExtractor = legendsExtractor;
    this.layerUpdated = new Event();
    this.dataLayerUpdated = new Event();
    this.modelUpdated = new Event();
    this.layerManagerFootprintMetaFieldPath = layerManagerMetaMapping.layer.footprint;
    this.shouldOptimizedTileRequests = shouldOptimizedTileRequests ?? false;
    this.relevancyListenersCleanup = [];

    configureLayerManagerMetaMapping(layerManagerMetaMapping);

    if (onLayersUpdate) {
      this.addLayerUpdatedListener(onLayersUpdate);
    }

    // Binding layer's relevancy check to Cesium lifecycle if optimized tile requests enabled
    if (this.shouldOptimizedTileRequests) {
      this.bindRelevancyListeners();
    }
  }

  public get layerList(): ICesiumImageryLayer[] {
    return this.layers;
  }

  public get dataLayerList(): ICesiumWFSLayer[] {
    return this.dataLayers;
  }

  public get modelList(): ICesium3DModel[] {
    return this.models;
  }

  public addDataLayer(dataLayer: ICesiumWFSLayer): void {
    this.dataLayers.push({ ...dataLayer });
    this.dataLayerUpdated.raiseEvent(this.dataLayers);
  }

  // A general place to extend layer's data. Should be done when all providers (different types) are initialized
  public addMetaToLayer(meta: any, layerPredicate: (layer: ImageryLayer, idx: number) => boolean): void {
    Promise.resolve().then(() => {
      const layer = this.layers.find(layerPredicate);
      if (layer) {
        layer.meta = { ...(layer.meta ?? {}), ...meta };
        this.setLegends();
        this.layerUpdated.raiseEvent(meta);
      }
    });
  }

  public addMetaToDataLayer(meta: any): void {
    const dataLayerId = getLayerIdFromMeta(meta);
    if (dataLayerId === undefined) {
      return;
    }
    const dataLayer = this.findDataLayerById(dataLayerId);
    if (dataLayer) {
      dataLayer.meta = { ...(dataLayer.meta ?? {}), ...meta };
      this.dataLayerUpdated.raiseEvent(this.dataLayers, dataLayerId as any);
    }
  }

  public setBaseMapLayers(baseMap: IBaseMap): void {
    const sortedBaseMapLayers = baseMap.baseRasterLayers.sort((layer1, layer2) => layer1.zIndex - layer2.zIndex);
    sortedBaseMapLayers.forEach((layer, idx) => {
      this.addRasterLayer(layer, idx, baseMap.id);
    });

    /**
     *  Set transparent layer as the first layer. if using optimized tile requests.
     *
     *  Apparently, cesium layer's rectangle is not affective when:
     *  - There is only one active layer && The layer's rectangle contains the extent rectangle.
     *
     *  As a result, when using optimized tile requesting and we zoom in a discrete layer,
     *  there are some visual artifacts due to tiles requesting outside of the layer's rectangle boundary.
     *
     *  A simple workaround would be adding a transparent layer as the very first layer at all times,
     *  so that we ensure the rectangle will always be affective.
     */

    if (this.shouldOptimizedTileRequests) {
      this.removeLayer(TRANSPARENT_LAYER_ID);
      this.addTransparentImageryProvider();
    }
  }

  public addRasterLayer(layer: IRasterLayer, index: number, parentId: string): void {
    let cesiumLayer: ICesiumImageryLayer | undefined;
    switch (layer.type) {
      case 'XYZ_LAYER': {
        const options = layer.options as UrlTemplateImageryProvider.ConstructorOptions;

        const providerInstance = this.shouldOptimizedTileRequests
          ? new CustomUrlTemplateImageryProvider(options, this.mapViewer)
          : new UrlTemplateImageryProvider(options);

        cesiumLayer = this.mapViewer.imageryLayers.addImageryProvider(providerInstance, index);

        break;
      }
      case 'WMS_LAYER': {
        const options = layer.options as WebMapServiceImageryProvider.ConstructorOptions;

        const providerInstance = this.shouldOptimizedTileRequests
          ? new CustomWebMapServiceImageryProvider(options, this.mapViewer)
          : new WebMapServiceImageryProvider(options);

        cesiumLayer = this.mapViewer.imageryLayers.addImageryProvider(providerInstance, index);
        break;
      }
      case 'WMTS_LAYER': {
        const options = layer.options as WebMapTileServiceImageryProvider.ConstructorOptions;

        const providerInstance = this.shouldOptimizedTileRequests
          ? new CustomWebMapTileServiceImageryProvider(options, this.mapViewer)
          : new WebMapTileServiceImageryProvider(options);

        cesiumLayer = this.mapViewer.imageryLayers.addImageryProvider(providerInstance, index);

        break;
      }
      case 'OSM_LAYER':
        break;
    }
    if (cesiumLayer) {
      cesiumLayer.alpha = layer.opacity;
      cesiumLayer.meta = {
        parentBaseMapId: parentId,
        ...layer,
      };
      if (layer.show !== undefined) {
        cesiumLayer.show = layer.show;
      }
    }
  }

  public removeLayer(layerId: string): void {
    const layer = this.findLayerById(layerId);
    if (layer) {
      this.mapViewer.imageryLayers.remove(layer, true);
    }
  }

  public removeDataLayer(dataLayerId: string): void {
    const dataLayer = this.findDataLayerById(dataLayerId);
    if (dataLayer) {
      const index = this.dataLayers.indexOf(dataLayer);
      if (index > -1) {
        this.dataLayers.splice(index, 1);
      }
      this.dataLayerUpdated.raiseEvent(this.dataLayers);
    }
  }

  public removeBaseMapLayers(): void {
    const layerToDelete = this.layers.filter((layer) => {
      return isBaseMapLayer(layer.meta);
    });
    layerToDelete.forEach((layer) => {
      this.mapViewer.imageryLayers.remove(layer, true);
    });
    // TODO: remove vector layers
  }

  public removeNotBaseMapLayers(): void {
    const layerToDelete = this.layers.filter((layer) => {
      return !isBaseMapLayer(layer.meta);
    });
    layerToDelete.forEach((layer) => {
      this.mapViewer.imageryLayers.remove(layer, true);
    });
    // TODO: remove vector layers
  }

  public raise(layerId: string, positions = 1): void {
    const layer = this.findLayerById(layerId);
    const order = (layer?.meta as Record<string, unknown>).zIndex as number;

    if (layer) {
      for (let position = 0; position < positions; position++) {
        this.mapViewer.imageryLayers.raise(layer);
      }
    }

    this.updateLayersOrder(layerId, order, order + positions);
    this.reinvokeOptimizationAfterOrderChange();
  }

  public lower(layerId: string, positions = 1): void {
    const layer = this.findLayerById(layerId);
    const order = (layer?.meta as Record<string, unknown>).zIndex as number;
    const lowerLimit = this.getBaseLayersCount();
    const layerIdx = this.mapViewer.imageryLayers.indexOf(layer as ImageryLayer);

    if (layerIdx - positions <= lowerLimit) {
      positions = layerIdx - lowerLimit;
    }

    if (layer) {
      for (let position = 0; position < positions; position++) {
        this.mapViewer.imageryLayers.lower(layer);
      }
    }

    this.updateLayersOrder(layerId, order, order - positions);
    this.reinvokeOptimizationAfterOrderChange();
  }

  public raiseToTop(layerId: string): void {
    const layer = this.findLayerById(layerId);
    const order = (layer?.meta as Record<string, unknown>).zIndex as number;

    if (layer) {
      this.mapViewer.imageryLayers.raiseToTop(layer);
    }

    this.updateLayersOrder(layerId, order, this.mapViewer.imageryLayers.length - this.getBaseLayersCount() - 1);
    this.reinvokeOptimizationAfterOrderChange();
  }

  public lowerToBottom(layerId: string): void {
    const layer = this.findLayerById(layerId);
    // const order = (layer?.meta as Record<string, unknown>).zIndex as number;
    const lowerLimit = this.getBaseLayersCount();
    const layerIdx = this.mapViewer.imageryLayers.indexOf(layer as ImageryLayer);

    this.lower(layerId, layerIdx - lowerLimit);
    // if (layer) {
    //   this.mapViewer.imageryLayers.lowerToBottom(layer);
    // }

    // this.updateLayersOrder(layerId, order, 0);
  }

  public length(): number {
    return this.mapViewer.imageryLayers.length;
  }

  public show(layerId: string, isShow: boolean): void {
    const layer = this.get(layerId);
    if (layer !== undefined) {
      layer.show = isShow;
    }
  }

  public showAllNotBase(isShow: boolean): void {
    const nonBaseLayers = this.layers.filter((layer) => {
      return !isBaseMapLayer(layer.meta);
    });
    nonBaseLayers.forEach((layer: ICesiumImageryLayer) => {
      const layerId = getLayerId(layer);
      if (layerId !== undefined) {
        this.show(layerId, isShow);
      }
    });
  }

  public get(layerId: string): ICesiumImageryLayer | undefined {
    const layerInt = this.findLayerById(layerId);

    const layerIdx = this.mapViewer.imageryLayers.indexOf(layerInt as ImageryLayer);

    return layerIdx ? this.mapViewer.imageryLayers.get(layerIdx) : undefined;
  }

  public pickImageryLayers(position: CesiumCartesian2): ICesiumImageryLayer[] | undefined {
    const pickRay = this.mapViewer.camera.getPickRay(position);
    let nonBaseLayers: ICesiumImageryLayer[] | undefined = undefined;

    if (pickRay) {
      nonBaseLayers = this.mapViewer.imageryLayers.pickImageryLayers(pickRay, this.mapViewer.scene)?.filter((layer: ICesiumImageryLayer) => {
        return !isBaseMapLayer(layer.meta);
      });
    }

    return nonBaseLayers;
  }

  public findLayerByPOI(x: number, y: number, onlyShown = true): ICesiumImageryLayer[] | undefined {
    if (this.layerManagerFootprintMetaFieldPath) {
      const position = pointToGeoJSON(this.mapViewer, x, y) as Feature<Point> | undefined;
      if (position === undefined) return undefined;

      const nonBaseLayers = this.layers.filter((layer) => {
        return !isBaseMapLayer(layer.meta);
      });

      const selectedVisibleLayers = nonBaseLayers.filter((layer) => {
        const layerFootprint = get(layer.meta, this.layerManagerFootprintMetaFieldPath as string) as Polygon | undefined;
        if (layerFootprint !== undefined) {
          /* eslint-disable */
          const isInLayer = booleanPointInPolygon(position.geometry, {
            type: 'Feature',
            properties: {},
            geometry: layerFootprint,
          });
          /* eslint-enable */

          return isInLayer && (onlyShown ? layer.show : true);
        } else {
          console.warn('[LayerManager] [findLayerByPOI] CesiumImageryLayer has no defined footprint', layer.meta);
          return false;
        }
      });

      return selectedVisibleLayers.sort((layer1, layer2) => {
        // @ts-ignore
        return layer2.meta?.zIndex - layer1.meta?.zIndex;
      });
    } else {
      console.warn('[LayerManager] [findLayerByPOI] layerManagerFootprintMetaFieldPath is not defined');
      return [];
    }
  }

  public addTransparentImageryProvider(): void {
    // Worldwide transparent layer
    const transparentTileUrl = `${import.meta.env.BASE_URL}assets/img/transparent-tile.png`;
    /* eslint-disable @typescript-eslint/no-magic-numbers */
    const rectangle = new Rectangle(-3.141592653589793, -1.5707963267948966, 3.141592653589793, 1.5707963267948966);
    /* eslint-enable @typescript-eslint/no-magic-numbers */

    void SingleTileImageryProvider.fromUrl(transparentTileUrl, { rectangle }).then((provider) => {
      const transparentLayer = this.mapViewer.imageryLayers.addImageryProvider(provider, 0);

      const transparentLayerMeta: Record<string, unknown> = {
        skipRelevancyCheck: true,
        parentBaseMapId: 'TRANSPARENT_LAYER',
      };
      set(transparentLayerMeta, mapping.layer.id, TRANSPARENT_LAYER_ID);
      (transparentLayer as ICesiumImageryLayer).meta = transparentLayerMeta;
    });
  }

  public addLayerUpdatedListener(callback: (meta: any) => void): void {
    this.layerUpdated.addEventListener(callback, this);
  }

  public removeLayerUpdatedListener(callback: (meta: any) => void): void {
    this.layerUpdated.removeEventListener(callback, this);
  }

  public addDataLayerUpdatedListener(callback: (meta: any) => void): void {
    this.dataLayerUpdated.addEventListener(callback, this);
  }

  public removeDataLayerUpdatedListener(callback: (meta: any) => void): void {
    this.dataLayerUpdated.removeEventListener(callback, this);
  }

  public addModelUpdatedListener(callback: (models: ICesium3DModel[]) => void): void {
    this.modelUpdated.addEventListener(callback, this);
  }

  public removeModelUpdatedListener(callback: (models: ICesium3DModel[]) => void): void {
    this.modelUpdated.removeEventListener(callback, this);
  }

  public setShouldOptimizedTileRequests(shouldOptimize: boolean): void {
    if (this.shouldOptimizedTileRequests === shouldOptimize) {
      return;
    }

    this.shouldOptimizedTileRequests = shouldOptimize;

    if (shouldOptimize) {
      this.bindRelevancyListeners();
      this.removeLayer(TRANSPARENT_LAYER_ID);
      this.addTransparentImageryProvider();
      this.markRelevantLayersForExtent();
      this.hideNonRelevantLayers();
      return;
    }

    this.unbindRelevancyListeners();
    this.removeLayer(TRANSPARENT_LAYER_ID);
    this.restoreAllLayersVisibility();
    this.clearLayersRelevancy();
  }

  public findDataLayerById(dataLayerId: string): ICesiumWFSLayer | undefined {
    return this.dataLayers.find((dataLayer) => {
      return getLayerId(dataLayer) === dataLayerId;
    });
  }

  public addModel(model: ICesium3DModel): void {
    this.models.push({ ...model });
    this.modelUpdated.raiseEvent(this.models);
  }

  public removeModel(modelId: string): void {
    const model = this.findModelById(modelId);
    if (model) {
      const index = this.models.indexOf(model);
      if (index > -1) {
        this.models.splice(index, 1);
      }
      this.modelUpdated.raiseEvent(this.models);
    }
  }

  public findModelById(modelId: string): ICesium3DModel | undefined {
    return this.models.find((model) => getLayerId(model) === modelId);
  }

  private setLegends(): void {
    if (typeof this.legendsExtractor !== 'undefined') {
      this.legendsList = this.legendsExtractor(this.layers);
    }
  }

  private getBaseLayersCount(): number {
    const baseLayers = this.layers.filter((layer) => {
      return isBaseMapLayer(layer.meta);
    });
    return baseLayers.length;
  }

  private findLayerById(layerId: string): ICesiumImageryLayer | undefined {
    return this.layers.find((layer) => {
      return getLayerId(layer) === layerId;
    });
  }

  private updateLayersOrder(_id: string, from: number, to: number): void {
    const move = from > to ? INC : DEC;
    const min = from < to ? from : to;
    const max = from < to ? to : from;
    this.layers.forEach((layer) => {
      if (!isBaseMapLayer(layer.meta)) {
        const layerOrder = layer.meta?.zIndex as number;
        (layer.meta as Record<string, unknown>).zIndex =
          layerOrder >= min && layerOrder <= max && layerOrder !== from ? layerOrder + move : layerOrder === from ? to : layerOrder;
      }
    });
  }

  private hideNonRelevantLayers(): void {
    for (const layer of this.layers) {
      if (getLayerId(layer) === TRANSPARENT_LAYER_ID) {
        continue;
      }
      const isRelevantToExtent = layer.meta?.isRelevantToExtent;
      if (typeof isRelevantToExtent !== 'boolean') {
        continue;
      }

      if (isRelevantToExtent !== layer.show) {
        layer.show = isRelevantToExtent;
      }
    }
  }

  private restoreAllLayersVisibility(): void {
    for (const layer of this.layers) {
      if (getLayerId(layer) === TRANSPARENT_LAYER_ID) {
        continue;
      }
      layer.show = true;
    }
  }

  private clearLayersRelevancy(): void {
    for (const layer of this.layers) {
      if (getLayerId(layer) === TRANSPARENT_LAYER_ID) {
        continue;
      }
      if (layer.meta && 'isRelevantToExtent' in layer.meta) {
        const { isRelevantToExtent, ...restMeta } = layer.meta;
        void isRelevantToExtent;
        layer.meta = restMeta;
      }
    }
  }

  private bindRelevancyListeners(): void {
    if (this.relevancyListenersCleanup.length > 0) {
      return;
    }

    this.relevancyLayerUpdatedHandler = (meta: Record<string, unknown>) => {
      const newMetaKeys = Object.keys(meta);
      const shouldTriggerRelevancyCheck = newMetaKeys.length === 1 && newMetaKeys[0] === HAS_TRANSPARENCY_META_PROP;
      if (shouldTriggerRelevancyCheck) {
        this.markRelevantLayersForExtent();
        this.hideNonRelevantLayers();
      }
    };

    this.addLayerUpdatedListener(this.relevancyLayerUpdatedHandler);
    this.relevancyListenersCleanup.push(() => {
      if (this.relevancyLayerUpdatedHandler) {
        this.removeLayerUpdatedListener(this.relevancyLayerUpdatedHandler);
      }
    });

    const removeLayerRemovedListener = this.mapViewer.imageryLayers.layerRemoved.addEventListener(() => {
      this.setLegends();
      this.markRelevantLayersForExtent();
      this.hideNonRelevantLayers();
    });
    this.relevancyListenersCleanup.push(removeLayerRemovedListener);

    const removeLayerMovedListener = this.mapViewer.imageryLayers.layerMoved.addEventListener(() => {
      this.markRelevantLayersForExtent();
      this.hideNonRelevantLayers();
    });
    this.relevancyListenersCleanup.push(removeLayerMovedListener);

    const removeLayerAddedListener = this.mapViewer.imageryLayers.layerAdded.addEventListener(() => {
      this.markRelevantLayersForExtent();
      this.hideNonRelevantLayers();
    });
    this.relevancyListenersCleanup.push(removeLayerAddedListener);

    const removeMoveEndListener = this.mapViewer.camera.moveEnd.addEventListener(() => {
      this.markRelevantLayersForExtent();
      this.hideNonRelevantLayers();
    });
    this.relevancyListenersCleanup.push(removeMoveEndListener);
  }

  private unbindRelevancyListeners(): void {
    this.relevancyListenersCleanup.forEach((cleanup) => {
      cleanup();
    });
    this.relevancyListenersCleanup = [];
    this.relevancyLayerUpdatedHandler = undefined;
  }

  private reinvokeOptimizationAfterOrderChange(): void {
    if (!this.shouldOptimizedTileRequests) {
      return;
    }
    this.markRelevantLayersForExtent();
    this.hideNonRelevantLayers();
  }

  private markRelevantLayersForExtent(): void {
    try {
      const extent = this.mapViewer.camera.computeViewRectangle() as Rectangle;
      if (isEmpty(extent)) {
        return;
      }
      // Iterating in reverse order so that top layer is first
      for (let i = this.layers.length - 1; i >= 0; i--) {
        const layer = this.layers[i];
        const intersectsExtent = !isEmpty(layer.rectangle) && Rectangle.intersection(extent, layer.rectangle) instanceof Rectangle;
        if (layer.meta?.skipRelevancyCheck === true) {
          layer.meta = { ...layer.meta, isRelevantToExtent: true };
          continue;
        }
        if (!intersectsExtent) {
          layer.meta = { ...(layer.meta ?? {}), isRelevantToExtent: false };
          continue;
        }
        let isOccludedByOpaqueLayerAbove = false;
        // Iterating from top layer until the current layer (exclusive)
        for (let j = this.layers.length - 1; j > i; j--) {
          const layerAbove = this.layers[j];
          if (layerAbove.show === false) {
            continue;
          }
          const layerAboveHasTransparency = layerAbove.meta?.[HAS_TRANSPARENCY_META_PROP] === true;
          const layerAboveIsOpaque = layerAbove.meta?.[HAS_TRANSPARENCY_META_PROP] === false;
          const layerAboveIntersectsExtent =
            !isEmpty(layerAbove.rectangle) && Rectangle.intersection(extent, layerAbove.rectangle) instanceof Rectangle;
          const layerAboveCoversCurrentExtent = !isEmpty(layerAbove.rectangle) && cesiumRectangleContained(extent, layerAbove.rectangle as Rectangle);
          if (layerAboveIntersectsExtent && layerAboveCoversCurrentExtent && layerAboveIsOpaque && !layerAboveHasTransparency) {
            isOccludedByOpaqueLayerAbove = true;
            break;
          }
        }
        // Layer is relevant if it intersects extent and has no opaque layer above it
        layer.meta = {
          ...(layer.meta ?? {}),
          isRelevantToExtent: !isOccludedByOpaqueLayerAbove,
        };
      }
    } catch (e) {
      console.error(e);
    }
  }
}

export default LayerManager;

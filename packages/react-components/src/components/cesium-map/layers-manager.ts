/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ImageryLayer,
  UrlTemplateImageryProvider,
  WebMapServiceImageryProvider,
  WebMapTileServiceImageryProvider,
  Event,
  Rectangle,
  SingleTileImageryProvider,
} from 'cesium';
import { get, isEmpty } from 'lodash';
import { Feature, Point, Polygon } from 'geojson';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { RCesiumOSMLayerOptions, RCesiumWMSLayerOptions, RCesiumWMTSLayerOptions, RCesiumXYZLayerOptions } from './layers';
import { CesiumViewer } from './map';
import { IBaseMap } from './settings/settings';
import { pointToGeoJSON } from './tools/geojson/point.geojson';
import { IMapLegend } from './map-legend';
import {
  CustomUrlTemplateImageryProvider,
  CustomWebMapServiceImageryProvider,
  CustomWebMapTileServiceImageryProvider,
  HAS_TRANSPARENCY_META_PROP,
} from './helpers/customImageryProviders';
import { cesiumRectangleContained } from './helpers/utils';
import { ICesiumWFSLayer } from './layers/wfs.layer';
import { CesiumCartesian2 } from './proxied.types';

const INC = 1;
const DEC = -1;

export interface ICesiumImageryLayer extends InstanceType<typeof ImageryLayer> {
  meta?: Record<string, unknown>;
}

export type LayerType = 'OSM_LAYER' | 'WMTS_LAYER' | 'WMS_LAYER' | 'XYZ_LAYER';

export interface IRasterLayer {
  id: string;
  type: LayerType;
  opacity: number;
  zIndex: number;
  show?: boolean;
  options: RCesiumOSMLayerOptions | RCesiumWMSLayerOptions | RCesiumWMTSLayerOptions | RCesiumXYZLayerOptions;
  details?: Record<string, unknown>;
}

export interface IVectorLayer {
  id: string;
  opacity: number;
  zIndex: number;
  url: string;
}

export type LegendExtractor = (layers: (any & { meta: any })[]) => IMapLegend[];

const TRANSPARENT_LAYER_ID = 'TRANSPARENT_BASE_LAYER';

class LayerManager {
  public mapViewer: CesiumViewer;

  public legendsList: IMapLegend[];
  public layerUpdated: Event;
  public dataLayerUpdated: Event;
  private readonly layers: ICesiumImageryLayer[];
  private readonly dataLayers: ICesiumWFSLayer[];
  private readonly legendsExtractor?: LegendExtractor;
  private readonly layerManagerFootprintMetaFieldPath: string | undefined;

  public constructor(
    mapViewer: CesiumViewer,
    legendsExtractor?: LegendExtractor,
    onLayersUpdate?: () => void,
    layerManagerFootprintMetaFieldPath?: string
  ) {
    this.mapViewer = mapViewer;
    // eslint-disable-next-line
    this.layers = (this.mapViewer.imageryLayers as any)._layers;
    this.dataLayers = [];
    this.legendsList = [];
    this.legendsExtractor = legendsExtractor;
    this.layerUpdated = new Event();
    this.dataLayerUpdated = new Event();
    this.layerManagerFootprintMetaFieldPath = layerManagerFootprintMetaFieldPath;

    if (onLayersUpdate) {
      this.layerUpdated.addEventListener(onLayersUpdate, this);
    }

    // Binding layer's relevancy check to Cesium lifecycle if optimized tile requests enabled.
    if (this.mapViewer.shouldOptimizedTileRequests) {
      this.layerUpdated.addEventListener((meta: Record<string, unknown>) => {
        const newMetaKeys = Object.keys(meta);
        const shouldTriggerRelevancyCheck = newMetaKeys.length === 1 && newMetaKeys[0] === HAS_TRANSPARENCY_META_PROP;
        if (shouldTriggerRelevancyCheck) {
          this.markRelevantLayersForExtent();
          this.hideNonRelevantLayers();
        }
      });

      this.mapViewer.imageryLayers.layerRemoved.addEventListener(() => {
        this.setLegends();
        this.markRelevantLayersForExtent();
        this.hideNonRelevantLayers();
      });

      this.mapViewer.imageryLayers.layerMoved.addEventListener(() => {
        this.markRelevantLayersForExtent();
        this.hideNonRelevantLayers();
      });

      this.mapViewer.imageryLayers.layerAdded.addEventListener(() => {
        this.markRelevantLayersForExtent();
        this.hideNonRelevantLayers();
      });

      this.mapViewer.camera.moveEnd.addEventListener(() => {
        this.markRelevantLayersForExtent();
        this.hideNonRelevantLayers();
      });
    }
  }

  public get layerList(): ICesiumImageryLayer[] {
    return this.layers;
  }

  public get dataLayerList(): ICesiumWFSLayer[] {
    return this.dataLayers;
  }

  public addDataLayer(dataLayer: ICesiumWFSLayer): void {
    this.dataLayers.push({...dataLayer});
    this.dataLayerUpdated.raiseEvent(this.dataLayers);
  }

  // A general place to extend layer's data. Should be done when all providers(different types) are initialized
  public addMetaToLayer(meta: any, layerPredicate: (layer: ImageryLayer, idx: number) => boolean): void {
    const layersReadyPromises = this.layers.map((item) => item.imageryProvider.readyPromise);

    Promise.all(layersReadyPromises).then((data) => {
      const layer = this.layers.find(layerPredicate);
      if (layer) {
        layer.meta = { ...(layer.meta ?? {}), ...meta };
        this.setLegends();
        this.layerUpdated.raiseEvent(meta);
      }
    });
  }

  // A general place to extend data layer's data
  public addMetaToDataLayer(meta: any): void {
    const dataLayer = this.findDataLayerById(meta.id);
    if (dataLayer) {
      dataLayer.meta = { ...(dataLayer.meta ?? {}), ...meta };
      this.dataLayerUpdated.raiseEvent(this.dataLayers);
    }
  }

  public setBaseMapLayers(baseMap: IBaseMap): void {
    const sortedBaseMapLayers = baseMap.baseRasteLayers.sort((layer1, layer2) => layer1.zIndex - layer2.zIndex);
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

    if (this.mapViewer.shouldOptimizedTileRequests) {
      this.removeLayer(TRANSPARENT_LAYER_ID);
      this.addTransparentImageryProvider();
    }
  }

  public addRasterLayer(layer: IRasterLayer, index: number, parentId: string): void {
    let cesiumLayer: ICesiumImageryLayer | undefined;
    switch (layer.type) {
      case 'XYZ_LAYER': {
        const options = layer.options as UrlTemplateImageryProvider.ConstructorOptions;

        const providerInstance = this.mapViewer.shouldOptimizedTileRequests
          ? new CustomUrlTemplateImageryProvider(options, this.mapViewer)
          : new UrlTemplateImageryProvider(options);

        cesiumLayer = this.mapViewer.imageryLayers.addImageryProvider(providerInstance, index);

        break;
      }
      case 'WMS_LAYER': {
        const options = layer.options as WebMapServiceImageryProvider.ConstructorOptions;

        const providerInstance = this.mapViewer.shouldOptimizedTileRequests
          ? new CustomWebMapServiceImageryProvider(options, this.mapViewer)
          : new WebMapServiceImageryProvider(options);

        cesiumLayer = this.mapViewer.imageryLayers.addImageryProvider(providerInstance, index);
        break;
      }
      case 'WMTS_LAYER': {
        const options = layer.options as WebMapTileServiceImageryProvider.ConstructorOptions;

        const providerInstance = this.mapViewer.shouldOptimizedTileRequests
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
        parentBasetMapId: parentId,
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
    }
  }

  public removeBaseMapLayers(): void {
    const layerToDelete = this.layers.filter((layer) => {
      const parentId = get(layer.meta, 'parentBasetMapId') as string;
      return parentId ? true : false;
    });
    layerToDelete.forEach((layer) => {
      this.mapViewer.imageryLayers.remove(layer, true);
    });
    // TODO: remove vector layers
  }

  public removeNotBaseMapLayers(): void {
    const layerToDelete = this.layers.filter((layer) => {
      const parentId = get(layer.meta, 'parentBasetMapId') as string;
      return parentId ? false : true;
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
  }

  public raiseToTop(layerId: string): void {
    const layer = this.findLayerById(layerId);
    const order = (layer?.meta as Record<string, unknown>).zIndex as number;

    if (layer) {
      this.mapViewer.imageryLayers.raiseToTop(layer);
    }

    this.updateLayersOrder(layerId, order, this.mapViewer.imageryLayers.length - this.getBaseLayersCount() - 1);
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
      const parentId = get(layer.meta, 'parentBasetMapId') as string;
      return parentId ? false : true;
    });
    nonBaseLayers.forEach((layer: ICesiumImageryLayer) => {
      this.show(layer.meta?.id as string, isShow);
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
        const parentId = get(layer.meta, 'parentBasetMapId') as string;
        return parentId ? false : true;
      });
    }

    return nonBaseLayers;
  }

  public findLayerByPOI(x: number, y: number, onlyShown = true): ICesiumImageryLayer[] | undefined {
    if (this.layerManagerFootprintMetaFieldPath) {
      const position = pointToGeoJSON(this.mapViewer, x, y) as Feature<Point>;

      const nonBaseLayers = this.layers.filter((layer) => {
        const parentId = get(layer.meta, 'parentBasetMapId') as string;
        return parentId ? false : true;
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
      console.warn('[LayerManager] [findLayerByPOI]layerManagerFootprintMetaFieldPath is not defined');
      return [];
    }
  }

  public addTransparentImageryProvider(): void {
    // Worldwide transparent layer
    const transparentLayer = this.mapViewer.imageryLayers.addImageryProvider(
      new SingleTileImageryProvider({
        url: './assets/img/transparent-tile.png',
        /* eslint-disable @typescript-eslint/no-magic-numbers */
        rectangle: new Rectangle(-3.141592653589793, -1.5707963267948966, 3.141592653589793, 1.5707963267948966),
        /* eslint-enable @typescript-eslint/no-magic-numbers */
      }),
      0
    );

    (transparentLayer as ICesiumImageryLayer).meta = {
      id: TRANSPARENT_LAYER_ID,
      skipRelevancyCheck: true,
      parentBasetMapId: 'TRANSPARENT_LAYER',
    };
  }

  public addDataLayerUpdatedListener(callback: (meta: any) => void): void {
    this.dataLayerUpdated.addEventListener(callback, this);
  }

  public removeDataLayerUpdatedListener(callback: (meta: any) => void): void {
    this.dataLayerUpdated.removeEventListener(callback, this);
  }

  public findDataLayerById(dataLayerId: string): ICesiumWFSLayer | undefined {
    return this.dataLayers.find((dataLayer) => {
      return dataLayer.meta.id === dataLayerId;
    });
  }

  private setLegends(): void {
    if (typeof this.legendsExtractor !== 'undefined') {
      this.legendsList = this.legendsExtractor(this.layers);
    }
  }

  private getBaseLayersCount(): number {
    const baseLayers = this.layers.filter((layer) => {
      const parentId = get(layer.meta, 'parentBasetMapId') as string;
      return parentId ? true : false;
    });
    return baseLayers.length;
  }

  private findLayerById(layerId: string): ICesiumImageryLayer | undefined {
    return this.layers.find((layer) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return layer.meta !== undefined ? layer.meta.id === layerId : false;
    });
  }

  private updateLayersOrder(id: string, from: number, to: number): void {
    const move = from > to ? INC : DEC;
    const min = from < to ? from : to;
    const max = from < to ? to : from;

    this.layers.forEach((layer) => {
      const parentId = get(layer.meta, 'parentBasetMapId') as string;
      if (!parentId) {
        const layerOrder = layer.meta?.zIndex as number;
        (layer.meta as Record<string, unknown>).zIndex =
          layerOrder >= min && layerOrder <= max && layerOrder !== from ? layerOrder + move : layerOrder === from ? to : layerOrder;
      }
    });
  }

  private hideNonRelevantLayers(): void {
    for (const layer of this.layers) {
      if (layer.meta?.relevantToExtent !== layer.show && layer.imageryProvider.ready) {
        layer.show = (layer.meta?.relevantToExtent as boolean | undefined) ?? true;
      }
    }
  }

  private markRelevantLayersForExtent(): void {
    try {
      const extent = this.mapViewer.camera.computeViewRectangle() as Rectangle;

      // Iterating in reverse order so that top layer is first.
      for (let i = this.layers.length - 1; i >= 0; i--) {
        const layer = this.layers[i];
        const intersectsExtent = !isEmpty(extent) && !isEmpty(layer.rectangle) && Rectangle.intersection(extent, layer.rectangle);

        // Iterating from top layer until the current. (inclusive)
        for (let j = this.layers.length - 1; j >= i; j--) {
          if (layer.meta?.skipRelevancyCheck === true) {
            layer.meta = { ...layer.meta, relevantToExtent: true };
            continue;
          }

          const layerAbove = this.layers[j];
          const layerAboveHasTransparency = layerAbove.meta?.[HAS_TRANSPARENCY_META_PROP] === true;

          if (layer !== layerAbove) {
            // Layer is relevant if in extent and there is no layer above it which is opaque and contains it.
            if (intersectsExtent instanceof Rectangle) {
              if (cesiumRectangleContained(extent, layer.rectangle)) {
                // Layer contains the extent.
                if (cesiumRectangleContained(extent, layerAbove.rectangle) && !layerAboveHasTransparency) {
                  layer.meta = {
                    ...(layer.meta ?? {}),
                    relevantToExtent: false,
                  };
                  break;
                } else {
                  layer.meta = {
                    ...(layer.meta ?? {}),
                    relevantToExtent: true,
                  };
                }
              }

              if (cesiumRectangleContained(extent, layerAbove.rectangle) && !layerAboveHasTransparency) {
                layer.meta = { ...(layer.meta ?? {}), relevantToExtent: false };
                break;
              }

              if (cesiumRectangleContained(layer.rectangle, layerAbove.rectangle)) {
                layer.meta = {
                  ...(layer.meta ?? {}),
                  relevantToExtent: layerAboveHasTransparency,
                };

                // Once there is layer above that hides it, no need to continue to check.
                if (!layerAboveHasTransparency) {
                  break;
                }
              } else {
                // Not contained by layer above it, and inside the extent.
                layer.meta = { ...(layer.meta ?? {}), relevantToExtent: true };
              }
            } else {
              layer.meta = { ...(layer.meta ?? {}), relevantToExtent: false };
            }
          } else {
            // Handle top layer
            if (i === this.layers.length - 1) {
              layer.meta = {
                ...(layer.meta ?? {}),
                relevantToExtent: intersectsExtent instanceof Rectangle,
              };
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

export default LayerManager;

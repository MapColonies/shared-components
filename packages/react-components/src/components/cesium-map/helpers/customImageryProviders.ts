import {
  Request,
  ImageryProvider,
  UrlTemplateImageryProvider,
  WebMapServiceImageryProvider,
  WebMapTileServiceImageryProvider,
  ImageryLayer,
  ImageryTypes,
} from 'cesium';
import { get } from 'lodash';
import { getImageryProviderUrl, ICesiumImageryLayer } from '../layers-manager';
import { CesiumViewer } from '../map';
import { imageHasTransparency } from './utils';

export interface CustomImageryProvider extends ImageryProvider {
  readonly layerListInstance: ICesiumImageryLayer[];
  tileTransparencyCheckedCounter: number;
  examinedTilesForTransparencyCheck: IExaminedTileCoordinates[];
  mapViewer: CesiumViewer;
  readonly maxTilesForTransparencyCheck: number;
}

interface IExaminedTileCoordinates {
  x: number;
  y: number;
  level: number;
}

const NUMBER_OF_TILES_TO_CHECK = 3;
export const HAS_TRANSPARENCY_META_PROP = 'hasTransparency';
export const EXAMINED_TILES_META_PROP = 'examinedTiles';

function customCommonRequestImage(
  this: CustomImageryProvider,
  requestImageFn: ImageryProvider['requestImage'],
  x: number,
  y: number,
  level: number,
  request?: Request | undefined
): Promise<ImageryTypes> | undefined {
  // custom Logic
  setTimeout(() => {
    const requestedLayerMeta = this.layerListInstance.find(
      /* eslint-disable */
      (layer: ImageryLayer): boolean => {
        return getImageryProviderUrl(layer) === (this as any)._resource?._url;
      }
      /* eslint-enable */
    )?.meta;

    const layerHasTransparency = get(requestedLayerMeta, HAS_TRANSPARENCY_META_PROP) === true;

    if (this.tileTransparencyCheckedCounter < NUMBER_OF_TILES_TO_CHECK && !layerHasTransparency) {
      console.log(JSON.stringify({ x, y, level }));
      this.examinedTilesForTransparencyCheck = [...this.examinedTilesForTransparencyCheck, { x, y, level }].slice(0, NUMBER_OF_TILES_TO_CHECK);

      this.mapViewer.layersManager?.addMetaToLayer(
        { [EXAMINED_TILES_META_PROP]: this.examinedTilesForTransparencyCheck },
        /* eslint-disable */
        (layer: ImageryLayer): boolean => {
          return getImageryProviderUrl(layer) === (this as any)._resource._url;
        }
        /* eslint-enable */
      );
      void imageHasTransparency(request?.url as string, this).then((hasTransparency) => {
        this.mapViewer.layersManager?.addMetaToLayer(
          { [HAS_TRANSPARENCY_META_PROP]: hasTransparency },
          /* eslint-disable */
          (layer: ImageryLayer): boolean => {
            return getImageryProviderUrl(layer) === (this as any)._resource._url;
          }
          /* eslint-enable */
        );
      });
    }
  }, 0);

  return requestImageFn(x, y, level, request);
}

export class CustomUrlTemplateImageryProvider extends UrlTemplateImageryProvider {
  public readonly layerListInstance: ICesiumImageryLayer[];
  public readonly mapViewer: CesiumViewer;
  public readonly maxTilesForTransparencyCheck = NUMBER_OF_TILES_TO_CHECK;

  public tileTransparencyCheckedCounter = 0;
  public examinedTilesForTransparencyCheck: IExaminedTileCoordinates[] = [];

  public constructor(opts: UrlTemplateImageryProvider.ConstructorOptions, mapViewer: CesiumViewer) {
    super(opts);
    this.layerListInstance = mapViewer.layersManager?.layerList as ICesiumImageryLayer[];
    this.mapViewer = mapViewer;
  }

  public requestImage(x: number, y: number, level: number, request?: Request | undefined): Promise<ImageryTypes> | undefined {
    return customCommonRequestImage.call(this, super.requestImage.bind(this), x, y, level, request);
  }
}

export class CustomWebMapServiceImageryProvider extends WebMapServiceImageryProvider {
  public readonly layerListInstance: ICesiumImageryLayer[];
  public readonly mapViewer: CesiumViewer;
  public readonly maxTilesForTransparencyCheck = NUMBER_OF_TILES_TO_CHECK;

  public tileTransparencyCheckedCounter = 0;
  public examinedTilesForTransparencyCheck: IExaminedTileCoordinates[] = [];

  public constructor(opts: WebMapServiceImageryProvider.ConstructorOptions, mapViewer: CesiumViewer) {
    super(opts);
    this.layerListInstance = mapViewer.layersManager?.layerList as ICesiumImageryLayer[];
    this.mapViewer = mapViewer;
  }

  public requestImage(x: number, y: number, level: number, request?: Request | undefined): Promise<ImageryTypes> | undefined {
    return customCommonRequestImage.call(this, super.requestImage.bind(this), x, y, level, request);
  }
}

export class CustomWebMapTileServiceImageryProvider extends WebMapTileServiceImageryProvider {
  public readonly layerListInstance: ICesiumImageryLayer[];
  public readonly mapViewer: CesiumViewer;
  public readonly maxTilesForTransparencyCheck = NUMBER_OF_TILES_TO_CHECK;

  public tileTransparencyCheckedCounter = 0;
  public examinedTilesForTransparencyCheck: IExaminedTileCoordinates[] = [];

  public constructor(opts: WebMapTileServiceImageryProvider.ConstructorOptions, mapViewer: CesiumViewer) {
    super(opts);
    this.layerListInstance = mapViewer.layersManager?.layerList as ICesiumImageryLayer[];
    this.mapViewer = mapViewer;
  }

  public requestImage(x: number, y: number, level: number, request?: Request | undefined): Promise<ImageryTypes> | undefined {
    return customCommonRequestImage.call(this, super.requestImage.bind(this), x, y, level, request);
  }
}

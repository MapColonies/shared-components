import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  ComponentProps,
  MouseEvent,
  useMemo
} from 'react';
import { createPortal } from 'react-dom';
import { Viewer, CesiumComponentRef } from 'resium';
import {
  Viewer as CesiumViewerCls,
  Cartesian3,
  SceneMode,
  Cartesian2,
  Matrix4,
  PerspectiveFrustum,
  PerspectiveOffCenterFrustum,
  OrthographicFrustum,
  TerrainProvider,
  Ray,
} from 'cesium';
import { isNumber, isArray } from 'lodash';
import { LinearProgress, ThemeProvider, useTheme } from '@map-colonies/react-core';
import { Box } from '../box';
import { useMappedCesiumTheme } from '../theme';
import { getAltitude, toDegrees } from '../utils/map';
import { Proj } from '../utils/projections';
import { ActiveLayersWidget } from './active-layers/active-layers-widget';
import { BaseMapWidget } from './base-map/base-map-widget';
import { WFSDebugWidget } from './debug/wfs-debug-widget';
import { DEFAULT_TERRAIN_PROVIDER_URL } from './helpers/constants';
import { pointToLonLat } from './helpers/geojson/point.geojson';
import LayerManager, { IRasterLayer, IVectorLayer, LegendExtractor } from './layers-manager';
import { LegendWidget, IMapLegend, LegendSidebar } from './legend';
import { CesiumSceneMode } from './proxied.types';
import { CesiumCompassTool } from './tools/cesium-compass.tool';
import { CoordinatesTrackerTool } from './tools/coordinates-tracker.tool';
import { ScaleTrackerTool } from './tools/scale-tracker.tool';
import { ZoomButtons } from './tools/zoom-buttons';
import { ZoomLevelTrackerTool } from './tools/zoom-level-tracker.tool';

import './map.css';
import '@map-colonies/react-core/dist/linear-progress/styles';

interface ViewerProps extends ComponentProps<typeof Viewer> {}

const DEFAULT_HEIGHT = 212;
const DEFAULT_WIDTH = 260;
const DEFAULT_DYNAMIC_HEIGHT_INCREMENT = 0;

interface ICameraPosition {
  longitude: number;
  latitude: number;
  height: number | undefined;
}

interface ICameraState {
  position: ICameraPosition;
  direction?: Cartesian3;
  up?: Cartesian3;
  right?: Cartesian3;
  transform?: Matrix4;
  frustum?: PerspectiveFrustum | PerspectiveOffCenterFrustum | OrthographicFrustum;
}

export class CesiumViewer extends CesiumViewerCls {
  public layersManager?: LayerManager;

  public constructor(container: string | Element, options?: CesiumViewerCls.ConstructorOptions) {
    super(container, options);
  }
}

export type MapViewState = {
  currentZoomLevel: number;
  shouldOptimizedTileRequests: boolean;
};

interface IMapViewState {
  viewState: MapViewState;
  setViewState: React.Dispatch<React.SetStateAction<MapViewState>>;
}

interface IMapContext extends IMapViewState {
  mapViewer: CesiumViewer;
}

const mapContext = createContext<IMapContext | null>(null);
const MapViewProvider = mapContext.Provider;

export interface IContextMenuData {
  data: Record<string, unknown>[];
  position: {
    x: number;
    y: number;
  };
  coordinates: { latitude: number; longitude: number };
  style?: Record<string, string>;
  size?: {
    height: number;
    width: number;
  };
  handleClose: () => void;
  contextEvt: MouseEvent | TouchEvent | KeyboardEvent | React.MouseEvent | React.TouchEvent | React.KeyboardEvent;
}

export interface IBaseMap {
  id: string;
  title?: string;
  thumbnail?: string;
  isCurrent?: boolean;
  isForPreview?: boolean;
  baseRasterLayers: IRasterLayer[];
  baseVectorLayers: IVectorLayer[];
}

export interface IBaseMaps {
  maps: IBaseMap[];
}

export interface ITerrain {
  id: string;
  url: string;
  title?: string;
  thumbnail?: string;
  isCurrent?: boolean;
  terrainProvider?: TerrainProvider;
}

interface ILegends {
  legendsList?: IMapLegend[];
  emptyText?: string;
  title?: string;
  actionsTexts?: { docText: string; imgText: string };
  mapLegendsExtractor?: LegendExtractor;
}

export interface IDebugPanel {
  wfs?: Record<string, unknown>;
}

export interface CesiumMapProps extends ViewerProps {
  showMousePosition?: boolean;
  showZoomLevel?: boolean;
  showScale?: boolean;
  showLoadingProgress?: boolean;
  showCompass?: boolean;
  projection?: Proj;
  center?: [number, number];
  zoom?: number;
  locale?: { [key: string]: string };
  sceneModes?: (typeof CesiumSceneMode)[];
  baseMaps?: IBaseMaps;
  terrains?: ITerrain[];
  useOptimizedTileRequests?: boolean;
  terrainProvider?: TerrainProvider;
  imageryContextMenu?: React.ReactElement<IContextMenuData>;
  imageryContextMenuSize?: {
    height: number;
    width: number;
    dynamicHeightIncrement?: number;
  };
  legends?: ILegends;
  layerManagerFootprintMetaFieldPath?: string;
  displayZoomButtons?: boolean;
  debugPanel?: IDebugPanel;
}

export const useCesiumMap = (): CesiumViewer => {
  const mapViewer = useContext(mapContext);

  if (mapViewer === null) {
    throw new Error('map context is null, please check the provider');
  }

  return mapViewer.mapViewer;
};

export const useCesiumMapViewstate = (): IMapViewState => {
  // @ts-ignore
  const { mapViewer, ...rest } = useContext<IMapContext | null>(mapContext);

  if (rest === null) {
    throw new Error('map context viewstate is null, please check the provider');
  }

  return rest;
};

export const CesiumMap: React.FC<CesiumMapProps> = (props) => {
  const ref = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [mapViewRef, setMapViewRef] = useState<CesiumViewer>();
  const [projection, setProjection] = useState<Proj>();
  const [showMousePosition, setShowMousePosition] = useState<boolean>();
  const [showZoomLevel, setShowZoomLevel] = useState<boolean>();
  const [showScale, setShowScale] = useState<boolean>();
  const [showCompass, setShowCompass] = useState<boolean>();
  const [showLoadingProgress, setShowLoadingProgress] = useState<boolean>();
  const [isLoadingTiles, setIsLoadingTiles] = useState<boolean>(false);
  const [isLoadingDataLayer, setIsLoadingDataLayer] = useState<boolean>(false);
  const [locale, setLocale] = useState<{ [key: string]: string }>();
  const cameraStateRef = useRef<ICameraState | undefined>();
  const [sceneModes, setSceneModes] = useState<(typeof CesiumSceneMode)[] | undefined>();
  const [legendsList, setLegendsList] = useState<IMapLegend[]>([]);
  const [baseMaps, setBaseMaps] = useState<IBaseMaps | undefined>();
  const [terrains, setTerrains] = useState<ITerrain[] | undefined>();
  const [showImageryMenu, setShowImageryMenu] = useState<boolean>(false);
  const imageryMenuEvent = useRef<MouseEvent>();
  const [imageryMenuPosition, setImageryMenuPosition] = useState<Record<string, unknown> | undefined>(undefined);
  const [isLegendsSidebarOpen, setIsLegendsSidebarOpen] = useState<boolean>(false);
  const [rightClickCoordinates, setRightClickCoordinates] = useState<{
    longitude: number;
    latitude: number;
  }>();
  const [displayZoomButtons, setDisplayZoomButtons] = useState<boolean>();
  const [viewState, setViewState] = useState<MapViewState>();
  const theme = useTheme();
  const themeCesium = useMappedCesiumTheme(theme);

  const isLoadingProgress = useMemo(() => {
    return isLoadingTiles || isLoadingDataLayer;
  }, [isLoadingTiles, isLoadingDataLayer]);

  useEffect(() => {
    setViewState({
      currentZoomLevel: -1,
      shouldOptimizedTileRequests: props.useOptimizedTileRequests ?? false,
    });
  }, []);

  const viewerProps: ViewerProps = {
    fullscreenButton: true,
    timeline: false,
    animation: false,
    baseLayerPicker: false,
    geocoder: true,
    navigationHelpButton: false,
    homeButton: true,
    sceneModePicker: true,
    imageryProvider: false,
    ...(props as ViewerProps),
  };

  const getImageryMenuStyle = (
    x: number,
    y: number,
    menuWidth: number,
    menuHeight: number,
    menuDynamicHeightIncrement: number
  ): Record<string, string> => {
    const container = (mapViewRef as CesiumViewer).container;
    const mapWidth = container.clientWidth;
    const mapHeight = container.clientHeight;
    const calculatedHeight = menuHeight + menuDynamicHeightIncrement;
    return {
      left: `${mapWidth - x < menuWidth ? x - (menuWidth - (mapWidth - x)) : x}px`,
      top: `${mapHeight - y < calculatedHeight ? y - (calculatedHeight - (mapHeight - y)) : y}px`,
    };
  };

  const contextMenuHandler = useCallback(
    (evt: any) => {
      if (ref.current !== null) {
        const viewer: CesiumViewer = ref.current.cesiumElement as CesiumViewer;

        const pos = { x: evt.offsetX, y: evt.offsetY } as Record<string, unknown>;

        setShowImageryMenu(false);
        setImageryMenuPosition(pos);
        setRightClickCoordinates(pointToLonLat(viewer, pos.x as number, pos.y as number));
        setShowImageryMenu(true);
        imageryMenuEvent.current = evt as unknown as MouseEvent;
      }
    },
    [ref]
  );

  useEffect(() => {
    if (ref.current !== null) {
      const viewer: CesiumViewer = ref.current.cesiumElement as CesiumViewer;
      if (props.imageryContextMenu) {
        // Previews implementation with cesium's events wont expose the native 'contextmenu' event in its callback.
        // We need the native event for the new context menu component.
        // This is a workaround.

        viewer.scene.canvas.removeEventListener('contextmenu', contextMenuHandler);

        viewer.scene.canvas.addEventListener('contextmenu', contextMenuHandler);
      }
    }
    setMapViewRef(ref.current?.cesiumElement);
  }, [ref, props.imageryContextMenu]);

  const contextValue = useMemo(() => {
    if (mapViewRef) {
      const mv = mapViewRef.layersManager
        ? mapViewRef
        : Object.assign(mapViewRef, {
            layersManager: new LayerManager(
              mapViewRef,
              props.legends?.mapLegendsExtractor,
              () => {
                setLegendsList(mapViewRef.layersManager?.legendsList as IMapLegend[]);
              },
              props.layerManagerFootprintMetaFieldPath,
              viewState?.shouldOptimizedTileRequests
            ),
          });
      return {
        mapViewer: mv,
        viewState,
        setViewState,
      };
    }
  }, [props.useOptimizedTileRequests, props.legends, props.layerManagerFootprintMetaFieldPath, mapViewRef, viewState]);

  useEffect(() => {
    setSceneModes(
      props.sceneModes ?? ([CesiumSceneMode.SCENE2D, CesiumSceneMode.SCENE3D, CesiumSceneMode.COLUMBUS_VIEW] as unknown as (typeof CesiumSceneMode)[])
    );
  }, [props.sceneModes]);

  useEffect(() => {
    setBaseMaps(props.baseMaps);
    const currentMap = props.baseMaps?.maps.find((map: IBaseMap) => map.isCurrent);
    if (currentMap && mapViewRef) {
      mapViewRef.layersManager?.setBaseMapLayers(currentMap);
    }
  }, [props.baseMaps, mapViewRef]);

  useEffect(() => {
    const newTerrains = props.terrains || ((mapViewRef && mapViewRef.terrainProvider) ? [{
      id: '1',
      url: DEFAULT_TERRAIN_PROVIDER_URL,
      title: 'Default Terrain',
      thumbnail: 'Cesium/Widgets/Images/TerrainProviders/Ellipsoid.png',
      isCurrent: true,
      terrainProvider: mapViewRef.terrainProvider
    }] : undefined);
    setTerrains(newTerrains);
  }, [props.terrains, mapViewRef]);

  useEffect(() => {
    setProjection(props.projection ?? Proj.WGS84);
  }, [props.projection]);

  useEffect(() => {
    setLocale(props.locale);
  }, [props.locale]);

  useEffect(() => {
    setShowMousePosition(props.showMousePosition ?? true);
  }, [props.showMousePosition]);

  useEffect(() => {
    setShowZoomLevel(props.showZoomLevel ?? true);
  }, [props.showZoomLevel]);

  useEffect(() => {
    setShowScale(props.showScale ?? true);
  }, [props.showScale]);

  useEffect(() => {
    setShowCompass(props.showCompass ?? true);
  }, [props.showCompass]);

  useEffect(() => {
    setShowLoadingProgress(props.showLoadingProgress ?? true);
  }, [props.showLoadingProgress]);

  useEffect(() => {
    const getCameraPosition = (): ICameraPosition => {
      if (mapViewRef === undefined) {
        return {
          longitude: 0,
          latitude: 0,
          height: 0,
        };
      }

      const getCameraPositionCartographic = (): ICameraPosition => {
        const camPos = mapViewRef.camera.positionCartographic;
        return {
          longitude: toDegrees(camPos.longitude),
          latitude: toDegrees(camPos.latitude),
          height: camPos.height,
        };
      };

      // https://stackoverflow.com/questions/33348761/get-center-in-cesium-map
      if (mapViewRef.scene.mode === SceneMode.SCENE3D) {
        const windowPosition = new Cartesian2(
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          mapViewRef.container.clientWidth / 2,
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          mapViewRef.container.clientHeight / 2
        );
        const pickRay = mapViewRef.scene.camera.getPickRay(windowPosition);
        const pickPosition = mapViewRef.scene.globe.pick(pickRay as Ray, mapViewRef.scene);

        // When camera is tilted towards the sky in 3d mode, pick couldn't pick the position and returns undefined,
        // Then the cartesianToCartographic will crash the map.
        if (!pickPosition)
          return {
            longitude: 0,
            latitude: 0,
            height: 0,
          };

        const pickPositionCartographic = mapViewRef.scene.globe.ellipsoid.cartesianToCartographic(pickPosition as Cartesian3);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return pickPositionCartographic !== undefined
          ? {
              longitude: toDegrees(pickPositionCartographic.longitude),
              latitude: toDegrees(pickPositionCartographic.latitude),
              height: mapViewRef.scene.camera.positionCartographic.height,
            }
          : getCameraPositionCartographic();
      } else {
        return getCameraPositionCartographic();
      }
    };

    if (mapViewRef) {
      mapViewRef.camera.moveEnd.addEventListener(() => {
        if (mapViewRef.scene.mode !== SceneMode.MORPHING) {
          const camera = mapViewRef.camera;

          const store: ICameraState = {
            position: getCameraPosition(),
            direction: camera.direction.clone(),
            up: camera.up.clone(),
            right: camera.right.clone(),
            transform: camera.transform.clone(),
            frustum: camera.frustum.clone(),
          };
          cameraStateRef.current = store;
        }
      });
      if (showLoadingProgress) {
        mapViewRef.scene.globe.tileLoadProgressEvent.addEventListener(function () {
          if (mapViewRef.scene.globe.tilesLoaded) {
            setIsLoadingTiles(false);
          } else {
            setIsLoadingTiles(true);
          }
        });
        mapViewRef.layersManager?.addDataLayerUpdatedListener(() => {
          let loading = false;
          mapViewRef.layersManager?.dataLayerList.forEach((dataLayer) => {
            if (
              typeof dataLayer.meta.items === 'number' &&
              typeof dataLayer.meta.total === 'number' &&
              dataLayer.meta.items > 0 &&
              dataLayer.meta.items < dataLayer.meta.total
            ) {
              loading = true;
              return;
            }
          });
          setIsLoadingDataLayer(loading);
        });
      }
    }
  }, [mapViewRef]);

  useEffect(() => {
    const morphCompleteHandler = (): void => {
      if (mapViewRef && cameraStateRef.current) {
        const cameraState = cameraStateRef.current;
        void mapViewRef.camera.flyTo({
          destination: Cartesian3.fromDegrees(cameraState.position.longitude, cameraState.position.latitude, cameraState.position.height),
          duration: 0,
        });
      }
    };
    if (mapViewRef) {
      mapViewRef.scene.morphComplete.addEventListener(morphCompleteHandler);
    }
    return (): void => {
      if (mapViewRef) {
        try {
          mapViewRef.scene.morphComplete.removeEventListener(morphCompleteHandler);
        } catch (e) {
          console.error('morphCompleteHandler event not cleaned');
        }
      }
    };
  }, [mapViewRef]);

  useEffect(() => {
    const zoom = props.zoom;
    const center = props.center;
    if (mapViewRef && isNumber(zoom) && isArray(center)) {
      void mapViewRef.camera.flyTo({
        destination: Cartesian3.fromDegrees(center[0], center[1], getAltitude(zoom)),
        duration: 0,
      });
    }
  }, [props.zoom, props.center, mapViewRef]);

  useEffect(() => {
    setDisplayZoomButtons(props.displayZoomButtons ?? true);
  }, [props.displayZoomButtons]);

  const updateLegendToggle = () => {
    setIsLegendsSidebarOpen(prev => !prev);
  };

  const bindCustomToolsToViewer = useCallback((): JSX.Element | undefined => {
    return (
      mapViewRef &&
      createPortal(
        <>
          {showLoadingProgress && isLoadingProgress && <LinearProgress style={{ position: 'absolute', top: 0, height: '10px', zIndex: 4 }} />}
          {showCompass && <CesiumCompassTool locale={locale} />}
          <Box className="bottomToolsContainer">
            {showMousePosition && <CoordinatesTrackerTool projection={projection} />}
            {showZoomLevel && <ZoomLevelTrackerTool locale={locale} valueBy="RENDERED_TILES" />}
            {showScale && <ScaleTrackerTool locale={locale} />}
          </Box>
          {displayZoomButtons && <ZoomButtons />}
        </>,
        document.querySelector('.cesium-viewer') as Element
      )
    );
  }, [mapViewRef, locale, projection, sceneModes, showMousePosition, showScale, isLoadingProgress]);

  const bindToolsToToolbar = useCallback((): JSX.Element | undefined => {
    return (
      mapViewRef &&
      createPortal(
        <>
          <BaseMapWidget baseMaps={baseMaps} terrains={terrains} locale={locale} />
          {props.debugPanel?.wfs && <WFSDebugWidget locale={locale} />}
          <LegendWidget legendToggle={updateLegendToggle} />
        </>,
        document.querySelector('.cesium-viewer-toolbar') as Element
      )
    );
  }, [mapViewRef, locale, baseMaps, terrains]);

  const bindInspectorsToWidgets = useCallback((): JSX.Element | undefined => {
    return (
      mapViewRef &&
      createPortal(
        <Box className="cesium-viewer-cesiumInspectorContainer widgetsContainer">
          <ActiveLayersWidget locale={locale} />
        </Box>,
        document.querySelector('.cesium-widget') as Element
      )
    );
  }, [mapViewRef, locale]);

  return (
    <ThemeProvider id="cesiumTheme" options={themeCesium}>
      <Viewer className="viewer" full ref={ref} {...viewerProps}>
        <MapViewProvider value={contextValue as IMapContext}>
          <LegendSidebar
            title={props.legends?.title}
            isOpen={isLegendsSidebarOpen}
            toggleSidebar={updateLegendToggle}
            noLegendsText={props.legends?.emptyText}
            legends={props.legends?.legendsList ?? legendsList}
            actionsTexts={props.legends?.actionsTexts}
          />
          {props.children}
          {bindCustomToolsToViewer()}
          {bindToolsToToolbar()}
          {bindInspectorsToWidgets()}
          {
            props.imageryContextMenu &&
            showImageryMenu &&
            imageryMenuPosition &&
            rightClickCoordinates &&
            React.cloneElement(props.imageryContextMenu, {
              data: mapViewRef?.layersManager?.findLayerByPOI(
                imageryMenuPosition.x as number,
                imageryMenuPosition.y as number,
                false
              ) as unknown as Record<string, unknown>[],
              position: {
                x: imageryMenuPosition.x as number,
                y: imageryMenuPosition.y as number,
              },
              coordinates: rightClickCoordinates,
              style: getImageryMenuStyle(
                imageryMenuPosition.x as number,
                imageryMenuPosition.y as number,
                props.imageryContextMenuSize?.width ?? DEFAULT_WIDTH,
                props.imageryContextMenuSize?.height ?? DEFAULT_HEIGHT,
                props.imageryContextMenuSize?.dynamicHeightIncrement ?? DEFAULT_DYNAMIC_HEIGHT_INCREMENT
              ),
              size: props.imageryContextMenuSize ?? {
                height: DEFAULT_HEIGHT,
                width: DEFAULT_WIDTH,
              },
              handleClose: () => {
                setShowImageryMenu(!showImageryMenu);
              },
              contextEvt: imageryMenuEvent.current,
            })
          }
        </MapViewProvider>
      </Viewer>
    </ThemeProvider>
  );
};

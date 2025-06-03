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
import { LinearProgress } from '@map-colonies/react-core';
import { getAltitude, toDegrees } from '../utils/map';
import { Box } from '../box';
import { Proj } from '../utils/projections';
import { CoordinatesTrackerTool } from './tools/coordinates-tracker.tool';
import { pointToLonLat } from './helpers/geojson/point.geojson';
import { ScaleTrackerTool } from './tools/scale-tracker.tool';
import { ZoomLevelTrackerTool } from './tools/zoom-level-tracker.tool';
import { /*CesiumSettings, */IBaseMap, IBaseMaps } from './settings/settings';
import { ZoomButtons } from './tools/zoom-buttons';
import { IMapLegend, MapLegendSidebar/*, MapLegendToggle*/ } from './legend';
import LayerManager, { LegendExtractor } from './layers-manager';
import { LegendTool } from './legend/legend.tool';
import { CesiumSceneMode, CesiumSceneModeEnum } from './proxied.types';
import { ActiveLayersTool } from './tools/active-layers.tool';
import { BaseMapPickerTool } from './tools/base-map-picker.tool';
import CesiumCompassTool from './tools/cesium-compass.tool';
import { DebugPanelTool } from './tools/debug-panel.tool';
// import { DebugPanel } from './debug/debug-panel';
// import { WFS } from './debug/wfs';

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
  public currentZoomLevel?: number;
  private useOptimizedTileRequests?: boolean;

  public constructor(container: string | Element, options?: CesiumViewerCls.ConstructorOptions) {
    super(container, options);
  }

  public get shouldOptimizedTileRequests(): boolean {
    return this.useOptimizedTileRequests ?? false;
  }

  public set shouldOptimizedTileRequests(useOptimizedTileRequests: boolean) {
    this.useOptimizedTileRequests = useOptimizedTileRequests;
  }
}

const mapContext = createContext<CesiumViewer | null>(null);
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
  sceneModes?: CesiumSceneModeEnum[];
  baseMaps?: IBaseMaps;
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

  return mapViewer;
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
  const [sceneModes, setSceneModes] = useState<CesiumSceneModeEnum[] | undefined>();
  const [legendsList, setLegendsList] = useState<IMapLegend[]>([]);
  const [baseMaps, setBaseMaps] = useState<IBaseMaps | undefined>();
  const [showImageryMenu, setShowImageryMenu] = useState<boolean>(false);
  const imageryMenuEvent = useRef<MouseEvent>();
  const [imageryMenuPosition, setImageryMenuPosition] = useState<Record<string, unknown> | undefined>(undefined);
  const [isLegendsSidebarOpen, setIsLegendsSidebarOpen] = useState<boolean>(false);
  const [rightClickCoordinates, setRightClickCoordinates] = useState<{
    longitude: number;
    latitude: number;
  }>();
  const [displayZoomButtons, setDisplayZoomButtons] = useState<boolean>();
  const [debugPanel, setDebugPanel] = useState<IDebugPanel | undefined>();

  const isLoadingProgress = useMemo(() => {
    return isLoadingTiles || isLoadingDataLayer;
  }, [isLoadingTiles, isLoadingDataLayer]);

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

  useEffect(() => {
    if (mapViewRef) {
      mapViewRef.shouldOptimizedTileRequests = props.useOptimizedTileRequests ?? false;

      mapViewRef.layersManager = new LayerManager(
        mapViewRef,
        props.legends?.mapLegendsExtractor,
        () => {
          setLegendsList(mapViewRef.layersManager?.legendsList as IMapLegend[]);
        },
        props.layerManagerFootprintMetaFieldPath
      );
    }
  }, [mapViewRef]);

  useEffect(() => {
    if (mapViewRef) {
      mapViewRef.shouldOptimizedTileRequests = props.useOptimizedTileRequests ?? false;
    }
  }, [props.useOptimizedTileRequests, mapViewRef]);

  useEffect(() => {
    setSceneModes(props.sceneModes ?? [CesiumSceneMode.SCENE2D, CesiumSceneMode.SCENE3D, CesiumSceneMode.COLUMBUS_VIEW]);
  }, [props.sceneModes]);

  useEffect(() => {
    setBaseMaps(props.baseMaps);
    const currentMap = props.baseMaps?.maps.find((map: IBaseMap) => map.isCurrent);
    if (currentMap && mapViewRef) {
      mapViewRef.layersManager?.setBaseMapLayers(currentMap);
    }
  }, [props.baseMaps, mapViewRef]);

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
    setDebugPanel(props.debugPanel);
  }, [props.debugPanel, mapViewRef]);

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
              dataLayer.meta.items < dataLayer.meta.total) {
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
          <Box>
            {showCompass && <CesiumCompassTool locale={locale} />}
          </Box>
          <Box className="sideToolsContainer">
            {/* {
              debugPanel &&
              <DebugPanel locale={locale}>
                {debugPanel.wfs && <WFS locale={locale} />}
              </DebugPanel>
            } */}
            {/* <CesiumSettings sceneModes={sceneModes as CesiumSceneModeEnum[]} baseMaps={baseMaps} locale={locale} /> */}
            {/* <MapLegendToggle onClick={(): void => setIsLegendsSidebarOpen(!isLegendsSidebarOpen)} /> */}
            {/* {
              showBasemaps &&
              <CesiumToolbarWidget 
                header={<kuku/>} 
                icon={<icon src={'https://example.com/icon.png'}/></icon>}
                content={<BaseMapPickerMixin />}  
              </CesiumToolbarWidget>
            } */}
            <BaseMapPickerTool baseMaps={baseMaps} terrainProvider={props.terrainProvider} locale={locale} />
            <DebugPanelTool debugPanel={debugPanel} locale={locale} />
            <ActiveLayersTool locale={locale} />
            <LegendTool toggleSidebar={updateLegendToggle} />
          </Box>
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
  }, [baseMaps, locale, mapViewRef, projection, sceneModes, showMousePosition, showScale, isLegendsSidebarOpen, isLoadingProgress]);

  return (
    <Viewer className="viewer" full ref={ref} {...viewerProps}>
      <MapViewProvider value={mapViewRef as CesiumViewer}>
        <MapLegendSidebar
          title={props.legends?.title}
          isOpen={isLegendsSidebarOpen}
          toggleSidebar={updateLegendToggle}
          noLegendsText={props.legends?.emptyText}
          legends={props.legends?.legendsList ?? legendsList}
          actionsTexts={props.legends?.actionsTexts}
        />
        {props.children}
        {bindCustomToolsToViewer()}
        {props.imageryContextMenu &&
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
          })}
      </MapViewProvider>
    </Viewer>
  );
};

import { Cesium3DTileset, Rectangle } from 'cesium';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Tooltip, Typography } from '@map-colonies/react-core';
import bbox from '@turf/bbox';
import { Box } from '../../box';
import {
  getImageryProvider,
  getImageryProviderName,
  getLayerId,
  ICesiumImageryLayer,
  isBaseMapLayer,
  isManagedImageryLayer,
  isServiceLayer,
  TRANSPARENT_LAYER_ID,
} from '../layers-manager';
import { useCesiumMap } from '../map';

import './active-layers-panel.css';

const IMAGERY = 'Imagery';
const SERVICE = 'Service';
const DATA = 'Data';
const THREE_D = '3D';
const TRANSPARENT_LAYER = 'TRANSPARENT_LAYER_FOR_OPTIMIZATION';
const SERVICE_LAYER = 'LAYER_WITH_NO_ID #';

interface IActiveLayer {
  id: string;
  name: string;
  isDisabled: boolean;
  rect?: Rectangle;
  zoomToTarget?: Cesium3DTileset;
}

interface ISection {
  id: string;
  values: IActiveLayer[];
}

interface IActiveLayersPanelProps {
  locale?: { [key: string]: string };
}

const GENERIC_PATH_SEGMENTS = new Set(['data', 'act', 'assets', 'cesium', 'tiles', 'tileset', '3d', 'model', 'models']);

const extractModelName = (rawUrl: string): string => {
  try {
    const { hostname, pathname } = new URL(rawUrl);
    const segments = pathname.split('/').filter((s) => s.length > 0 && !s.includes('.'));
    const named = [...segments]
      .reverse()
      .find((s) => !GENERIC_PATH_SEGMENTS.has(s.toLowerCase()) && /[a-zA-Z]/.test(s));
    return named ?? hostname;
  } catch {
    return rawUrl;
  }
};

export const ActiveLayersPanel: React.FC<IActiveLayersPanelProps> = ({ locale }) => {
  const mapViewer = useCesiumMap();
  const [sections, setSections] = useState<ISection[]>([
    { id: IMAGERY, values: [] },
    { id: SERVICE, values: [] },
    { id: DATA, values: [] },
    { id: THREE_D, values: [] }
  ]);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const getLabel = (key: string) => {
    return get(locale, key.toUpperCase()) ?? key;
  };

  const getLayerList = (): ICesiumImageryLayer[] => {
    return mapViewer.layersManager?.layerList ?? [];
  };

  const getImageryLayers = (): IActiveLayer[] => {
    const layerList = getLayerList();
    return layerList.length > 0
      ? layerList.map((layer): IActiveLayer | undefined => {
          const meta = get(layer, 'meta');
          const layerId = getLayerId(layer);
          if (!isManagedImageryLayer(layerId)) {
            return undefined;
          }
          return {
            id: layerId as string,
            name: (get(meta, 'layerRecord.productName') ?? layerId) as string,
            rect: layer.rectangle,
            isDisabled: isBaseMapLayer(meta as Record<string, unknown>)
          };
        }).filter((item): item is IActiveLayer => item !== undefined)
      : [];
  };

  const getServiceLayers = (): IActiveLayer[] => {
    const layerList = getLayerList();
    return layerList.length > 0
      ? layerList.map((layer, i): IActiveLayer | undefined => {
          const layerId = getLayerId(layer);
          if (!isServiceLayer(layerId)) {
            return undefined;
          }
          const isTransparentLayer = layerId === TRANSPARENT_LAYER_ID;
          const providerName = getImageryProviderName(getImageryProvider(layer));
          const name = isTransparentLayer
            ? TRANSPARENT_LAYER
            : `${SERVICE_LAYER} ${String(i + 1)}`;

          return {
            id: `SERVICE_LAYER_${String(i)}`,
            name: isTransparentLayer ? name : providerName ?? name,
            rect: layer.rectangle,
            isDisabled: true
          };
        }).filter((item): item is IActiveLayer => item !== undefined)
      : [];
  };

  const getDataLayers = (): IActiveLayer[] => {
    return mapViewer.layersManager?.dataLayerList.map((dataLayer) => {
      return {
        id: getLayerId(dataLayer) as string,
        name: (get(dataLayer.meta, 'layerRecord.featureStructure.aliasLayerName') ?? get(dataLayer.meta, 'layerRecord.productName')) as string,
        rect: Rectangle.fromDegrees(...bbox((dataLayer.meta?.layerRecord as Record<string, unknown>)?.footprint)),
        isDisabled: false
      }; }) || [];
  };

  const get3DModels = (): IActiveLayer[] => {
    return (mapViewer.layersManager?.modelList ?? []).map((model, index): IActiveLayer => {
      const modelUrl = get(model.tileset, 'resource.url') as string | undefined;
      const modelName = (get(model.meta, 'layerRecord.productName') ?? extractModelName(modelUrl ?? `Model #${String(index + 1)}`)) as string;
      return {
        id: (getLayerId(model) as string) ?? `3D_MODEL_${String(index)}`,
        name: modelName,
        zoomToTarget: model.tileset,
        isDisabled: false,
      };
    });
  };

  useEffect(() => {
    const updateSections = () => {
      const newSections = [
        {
          id: IMAGERY,
          values: getImageryLayers()
        },
        {
          id: SERVICE,
          values: getServiceLayers()
        },
        {
          id: DATA,
          values: getDataLayers()
        },
        {
          id: THREE_D,
          values: get3DModels()
        },
      ];
      setSections(newSections);
      setCollapsedSections(newSections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {}));
    };
    updateSections();
  }, []);

  useEffect(() => {
    if (!mapViewer.layersManager) { return; }
    const handleLayerEvent = (): void => {
      setSections((prev) =>
        prev.map((item) =>
          item.id === IMAGERY
            ? {
                ...item,
                values: getImageryLayers()
              }
            : item.id === SERVICE
              ? {
                  ...item,
                  values: getServiceLayers()
                }
              : item
        )
      );
    };
    mapViewer.layersManager.addLayerUpdatedListener(handleLayerEvent);
    mapViewer.imageryLayers.layerAdded.addEventListener(handleLayerEvent);
    mapViewer.imageryLayers.layerRemoved.addEventListener(handleLayerEvent);
    return () => {
      if (get(mapViewer, '_cesiumWidget') !== undefined) {
        mapViewer.layersManager?.removeLayerUpdatedListener(handleLayerEvent);
        mapViewer.imageryLayers.layerAdded.removeEventListener(handleLayerEvent);
        mapViewer.imageryLayers.layerRemoved.removeEventListener(handleLayerEvent);
      }
    };
  }, [mapViewer.layersManager?.layerList]);

  useEffect(() => {
    if (!mapViewer.layersManager) { return; }
    const handleDataLayerEvent = (): void => {
      setSections((prev) =>
        prev.map((item) =>
          item.id === DATA
            ? {
                ...item,
                values: getDataLayers()
              }
            : item
        )
      );
    };
    mapViewer.layersManager.addDataLayerUpdatedListener(handleDataLayerEvent);
    return () => {
      mapViewer.layersManager?.removeDataLayerUpdatedListener(handleDataLayerEvent);
    };
  }, [mapViewer.layersManager?.dataLayerList]);

  useEffect(() => {
    if (!mapViewer.layersManager) { return; }
    const handle3DModelEvent = (): void => {
      setSections((prev) =>
        prev.map((item) =>
          item.id === THREE_D
            ? {
                ...item,
                values: get3DModels()
              }
            : item
        )
      );
    };
    mapViewer.layersManager.addModelUpdatedListener(handle3DModelEvent);
    return () => {
      mapViewer.layersManager?.removeModelUpdatedListener(handle3DModelEvent);
    };
  }, [mapViewer.layersManager?.modelList]);

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFlyTo = (activeLayer: IActiveLayer) => {
    if (activeLayer.zoomToTarget !== undefined) {
      void mapViewer.zoomTo(activeLayer.zoomToTarget);
      return;
    }
    if (activeLayer.rect !== undefined) {
      mapViewer.camera.flyTo({ destination: activeLayer.rect });
    }
  };

  return (
    <Box className="activeLayersPanel">
      {
        sections.filter(item => item.values.length > 0).map((section) => (
          <Box
            key={section.id}
            className={`cesium-cesiumInspector-section ${collapsedSections[section.id] ? 'cesium-cesiumInspector-section-collapsed' : ''}`}
            onClick={() => toggleSection(section.id)}
          >
            <Typography tag="h3" className="cesium-cesiumInspector-sectionHeader">
              {getLabel(section.id)}
            </Typography>
            <Box className="cesium-cesiumInspector-sectionContent">
              {
                section.values.map((activeLayer: IActiveLayer) => (
                  <Box key={activeLayer.id} className="layer">
                    <Tooltip content={activeLayer.name}>
                      <Box className={`name ${activeLayer.isDisabled ? 'disabled' : ''}`}><bdi>{activeLayer.name}</bdi></Box>
                    </Tooltip>
                    <Box className="icons">
                      <Tooltip content={get(locale, 'FLY_TO') ?? 'Fly To'}>
                        <Box className="icon" onClick={(event) => { event.stopPropagation(); handleFlyTo(activeLayer); }}>
                          <svg fill="var(--mdc-theme-cesium-color)" width="100%" height="100%" viewBox="0 0 256 256">
                            <path d="M236,120H223.66406A96.15352,96.15352,0,0,0,136,32.33618V20a8,8,0,0,0-16,0V32.33618A96.15352,96.15352,0,0,0,32.33594,120H20a8,8,0,0,0,0,16H32.33594A96.15352,96.15352,0,0,0,120,223.66382V236a8,8,0,0,0,16,0V223.66382A96.15352,96.15352,0,0,0,223.66406,136H236a8,8,0,0,0,0-16Zm-40,16h11.59912A80.14164,80.14164,0,0,1,136,207.59912V196a8,8,0,0,0-16,0v11.59912A80.14164,80.14164,0,0,1,48.40088,136H60a8,8,0,0,0,0-16H48.40088A80.14164,80.14164,0,0,1,120,48.40088V60a8,8,0,0,0,16,0V48.40088A80.14164,80.14164,0,0,1,207.59912,120H196a8,8,0,0,0,0,16Z"/>
                            <polygon points="128,80 80,170 128,150 176,170" fill="var(--mdc-theme-cesium-color)"/>
                          </svg>
                        </Box>
                      </Tooltip>
                      {/* <Tooltip content={get(locale, 'REMOVE') ?? 'Remove'}>
                        <Box className={`icon ${activeLayer.isDisabled ? 'disabled' : ''}`} onClick={(event) => { event.stopPropagation(); }}>
                          <svg width="100%" height="100%" viewBox="0 0 16 16" fill="var(--mdc-theme-cesium-color)">
                            <path fillRule="evenodd" clipRule="evenodd" d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"/>
                          </svg>
                        </Box>
                      </Tooltip> */}
                    </Box>
                  </Box>
                ))
              }
            </Box>
          </Box>
        ))
      }
    </Box>
  );
};

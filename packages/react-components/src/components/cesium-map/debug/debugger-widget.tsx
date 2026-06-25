import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { get } from 'lodash';
import { Checkbox, Tooltip } from '@map-colonies/react-core';
import { Box } from '../../box';
import { EXAMINED_TILES_META_PROP, HAS_TRANSPARENCY_META_PROP } from '../helpers/customImageryProviders';
import { ICesiumWFSLayer, ICesiumWFSLayerMeta } from '../layers/wfs.layer';
import { getLayerId, getLayerIdFromMeta, getLayerName, isManagedImageryLayer } from '../layers-manager';
import { useCesiumMap, useCesiumMapViewstate } from '../map';
import { CesiumIcon } from '../widget/cesium-icon';
import { CesiumTool } from '../widget/cesium-tool';
import { IWidgetProps, WidgetWrapper } from '../widget/widget-wrapper';
import { WFS } from './wfs';

import './debugger-widget.css';

export interface IDebuggerWidgetProps extends IWidgetProps {
  locale?: { [key: string]: string };
}

interface LayerDebugMeta {
  id?: string;
  isRelevantToExtent?: boolean;
  [key: string]: unknown;
}

interface LayerDebugItem {
  layerId: string;
  layerName?: string;
  meta: LayerDebugMeta;
}

type DebuggerSectionId = 'data' | 'layers' | 'tools';

const DebuggerComponent: React.FC<IDebuggerWidgetProps> = ({ locale, isOpen, setIsOpen }) => {
  const [featureTypes, setFeatureTypes] = useState<ICesiumWFSLayerMeta[]>([]);
  const [layersMeta, setLayersMeta] = useState<LayerDebugItem[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Record<DebuggerSectionId, boolean>>({
    data: false,
    layers: false,
    tools: false,
  });
  const title = useMemo(() => get(locale, 'DEBUG_PANEL_TITLE') ?? 'Debug', [locale]);
  const dataSectionTitle = useMemo(() => get(locale, 'DEBUG_SECTION_DATA') ?? 'Data', [locale]);
  const layersSectionTitle = useMemo(() => get(locale, 'DEBUG_SECTION_LAYERS') ?? 'Layers', [locale]);
  const toolsSectionTitle = useMemo(() => get(locale, 'DEBUG_SECTION_TOOLS') ?? 'Tools', [locale]);
  const optimizationLabel = useMemo(() => get(locale, 'TILE_REQUESTS_OPTIMIZATION_CHECKBOX') ?? 'Tile requests optimization', [locale]);
  const cesiumInspectorLabel = useMemo(() => get(locale, 'CESIUM_INSPECTOR_CHECKBOX') ?? 'Cesium Inspector', [locale]);
  const withTransparencyTiles = useMemo(() => get(locale, 'WITH_TRANSPARENCY_TOOLTIP') ?? 'This layer has tiles with transparency', [locale]);
  const withoutTransparencyTiles = useMemo(() => get(locale, 'WITHOUT_TRANSPARENCY_TOOLTIP') ?? 'This layer has tiles WITHOUT transparency', [locale]);

  const mapViewer = useCesiumMap();
  const { viewState, setViewState } = useCesiumMapViewstate();

  const toggleSection = (sectionId: DebuggerSectionId): void => {
    setCollapsedSections((prevState) => ({
      ...prevState,
      [sectionId]: !prevState[sectionId],
    }));
  };

  const updateLayersMeta = useCallback((): void => {
    if (!mapViewer.layersManager?.layerList) { return; }
    const nextLayersMeta = mapViewer.layersManager.layerList
      .map((layer): LayerDebugItem | undefined => {
        const layerId = getLayerId(layer);
        if (!isManagedImageryLayer(layerId)) {
          return undefined;
        }
        return {
          layerId: layerId as string,
          layerName: getLayerName(layer),
          meta: (layer.meta ?? {}) as LayerDebugMeta,
        };
      })
      .filter((item): item is LayerDebugItem => item !== undefined);
    setLayersMeta(nextLayersMeta);
  }, [mapViewer.layersManager]);

  useEffect(() => {
    let moveEndRefreshTimeoutId: ReturnType<typeof setTimeout> | undefined;
    const scheduleLayerMetaRefresh = (): void => {
      if (moveEndRefreshTimeoutId !== undefined) {
        clearTimeout(moveEndRefreshTimeoutId);
      }
      moveEndRefreshTimeoutId = setTimeout(() => {
        updateLayersMeta();
      }, 0);
    };

    const removeTileLoad = mapViewer.scene.globe.tileLoadProgressEvent.addEventListener((tilesLoadingCount) => {
      if (tilesLoadingCount === 0) {
        updateLayersMeta();
        removeTileLoad();
      }
    });
    const removeMoveEnd = mapViewer.camera.moveEnd.addEventListener(() => {
      scheduleLayerMetaRefresh();
    });
    const removeLayerRemoved = mapViewer.imageryLayers.layerRemoved.addEventListener(() => {
      scheduleLayerMetaRefresh();
    });
    mapViewer.layersManager?.addLayerUpdatedListener(updateLayersMeta);
    return (): void => {
      if (moveEndRefreshTimeoutId !== undefined) {
        clearTimeout(moveEndRefreshTimeoutId);
      }
      removeTileLoad();
      removeMoveEnd();
      removeLayerRemoved();
      mapViewer.layersManager?.removeLayerUpdatedListener(updateLayersMeta);
    };
  }, [mapViewer, updateLayersMeta]);

  useEffect(() => {
    updateLayersMeta();
  }, [updateLayersMeta, viewState?.shouldOptimizedTileRequests]);

  useEffect(() => {
    if (!mapViewer.layersManager) { return; }
    const handleDataLayerUpdated = (dataLayers: ICesiumWFSLayer[], layerId?: string | undefined): void => {
      dataLayers.forEach((layer: ICesiumWFSLayer): void => {
        if (layerId !== undefined && layerId !== getLayerId(layer)) {
          return;
        }
        const { options, meta } = layer;
        const { zoomLevel } = options;
        const { id, items, total, cache, currentZoomLevel, layerRecord } = meta;
        setFeatureTypes((prevFeatureTypes) => {
          const existingIndex = prevFeatureTypes.findIndex((featureType) => getLayerIdFromMeta(featureType) === id);
          if (existingIndex >= 0) {
            if (
              JSON.stringify(prevFeatureTypes[existingIndex]) !==
              JSON.stringify({ id, items, total, cache, currentZoomLevel, layerRecord, zoomLevel })
            ) {
              const updatedFeatureTypes = [...prevFeatureTypes];
              updatedFeatureTypes[existingIndex] = { id, items, total, cache, currentZoomLevel, layerRecord, zoomLevel };
              return updatedFeatureTypes;
            }
          } else {
            return [...prevFeatureTypes, { id, items, total, cache, currentZoomLevel, layerRecord, zoomLevel }];
          }
          return prevFeatureTypes;
        });
      });
      const activeDataLayerIds = new Set(mapViewer.layersManager?.dataLayerList.map((layer) => getLayerId(layer)));
      setFeatureTypes((prevFeatureTypes) => prevFeatureTypes.filter((featureType) => activeDataLayerIds.has(getLayerIdFromMeta(featureType))));
    };
    mapViewer.layersManager.addDataLayerUpdatedListener(handleDataLayerUpdated);
    return () => {
      mapViewer.layersManager?.removeDataLayerUpdatedListener(handleDataLayerUpdated);
    };
  }, [mapViewer.layersManager?.dataLayerList]);

  return (
    <>
      <CesiumIcon onClick={() => setIsOpen(!isOpen)}>
        <svg width="100%" height="100%" viewBox="0 0 24 24">
          <g fill="var(--mdc-theme-cesium-color)" transform="translate(4.6 4.6) scale(0.0295)">
            <g transform="translate(-1)">
              <g>
                <g>
                  <path d="M508.517,257.027l-106.445-57.318v-20.506c0-4.71-3.814-8.533-8.533-8.533h-25.6v-8.533 c0-6.562-0.683-12.962-1.783-19.217l56.346-24.141c3.14-1.34,5.171-4.429,5.171-7.842V17.07h51.2 c4.719,0,8.533-3.823,8.533-8.533s-3.814-8.533-8.533-8.533h-59.733c-4.719,0-8.533,3.823-8.533,8.533v96.777l-48.751,20.898 c-7.859-22.852-22.886-42.377-42.496-55.757c8.713-6.187,14.447-16.307,14.447-27.784c0-18.825-15.309-34.133-34.133-34.133 c-4.719,0-8.533,3.823-8.533,8.533s3.814,8.533,8.533,8.533c9.412,0,17.067,7.654,17.067,17.067 c0,9.412-7.654,17.067-17.067,17.067c-0.017,0-0.026,0.009-0.043,0.009c-13.133-5.487-27.529-8.542-42.624-8.542 s-29.491,3.055-42.624,8.542c-0.017,0-0.026-0.009-0.043-0.009c-9.412,0-17.067-7.654-17.067-17.067 c0-9.412,7.654-17.067,17.067-17.067c4.719,0,8.533-3.823,8.533-8.533s-3.814-8.533-8.533-8.533 c-18.825,0-34.133,15.309-34.133,34.133c0,11.477,5.734,21.598,14.447,27.784c-19.61,13.38-34.637,32.905-42.496,55.757 l-48.751-20.898V8.537c0-4.71-3.814-8.533-8.533-8.533H35.138c-4.719,0-8.533,3.823-8.533,8.533s3.814,8.533,8.533,8.533h51.2 v93.867c0,3.413,2.031,6.502,5.171,7.842l56.346,24.141c-1.101,6.255-1.784,12.655-1.784,19.217v8.533h-25.6 c-4.719,0-8.533,3.823-8.533,8.533v20.506L5.494,257.027c-4.147,2.227-5.709,7.407-3.473,11.554 c1.545,2.867,4.489,4.489,7.526,4.489c1.365,0,2.748-0.324,4.036-1.024l108.766-58.564l134.673,75.418l135.202-75.11 l108.203,58.257c1.289,0.7,2.671,1.024,4.036,1.024c3.038,0,5.982-1.621,7.526-4.489 C514.225,264.434,512.664,259.255,508.517,257.027z M350.872,170.67H163.138v-8.533c0-51.755,42.112-93.867,93.867-93.867 c51.755,0,93.867,42.112,93.867,93.867V170.67z" />
                  <path d="M450.208,343.32l-48.136-40.115v-75.366l-136.533,75.853v173.747c76.015-4.454,136.533-67.524,136.533-144.632v-7.381 l32.205,26.837l-39.97,87.945c-1.135,2.492-0.998,5.385,0.358,7.765l34.133,59.733c1.57,2.756,4.446,4.301,7.415,4.301 c1.434,0,2.893-0.367,4.224-1.126c4.096-2.338,5.521-7.552,3.174-11.648l-31.966-55.936l40.858-89.899 C454.1,349.899,453.152,345.777,450.208,343.32z" />
                  <path d="M111.938,303.205L63.802,343.32c-2.944,2.458-3.891,6.579-2.295,10.078l40.858,89.899l-31.966,55.936 c-2.347,4.096-0.922,9.31,3.174,11.648c1.331,0.759,2.79,1.126,4.224,1.126c2.97,0,5.845-1.545,7.415-4.301l34.133-59.733 c1.357-2.381,1.493-5.274,0.358-7.765l-39.97-87.945l32.205-26.837v7.381c0,77.107,60.518,140.177,136.533,144.632V303.674 l-136.533-76.459V303.205z" />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </CesiumIcon>
      <CesiumTool isVisible={isOpen} title={title}>
        <Box className="debuggerWidgetSections">
          <Box className="debuggerWidgetSection">
            <Box className="debuggerWidgetSectionHeader" onClick={() => toggleSection('data')}>
              <Box className="debuggerWidgetSectionHeaderToggle">{collapsedSections.data ? '+' : '-'}</Box>
              <Box className="debuggerWidgetSectionHeaderLabel">{dataSectionTitle}</Box>
            </Box>
            {!collapsedSections.data && (
              <Box className="debuggerWidgetSectionContent">
                <WFS featureTypes={featureTypes} locale={locale} />
              </Box>
            )}
          </Box>

          <Box className="debuggerWidgetSection">
            <Box className="debuggerWidgetSectionHeader" onClick={() => toggleSection('layers')}>
              <Box className="debuggerWidgetSectionHeaderToggle">{collapsedSections.layers ? '+' : '-'}</Box>
              <Box className="debuggerWidgetSectionHeaderLabel">{layersSectionTitle}</Box>
            </Box>
            {!collapsedSections.layers && (
              <Box className="debuggerWidgetSectionContent">
                <Checkbox
                  className="optimizationCheckbox"
                  label={optimizationLabel}
                  checked={viewState?.shouldOptimizedTileRequests ?? false}
                  onClick={() => {
                    setViewState((prevState) => ({
                      currentZoomLevel: prevState?.currentZoomLevel ?? -1,
                      shouldOptimizedTileRequests: !(prevState?.shouldOptimizedTileRequests ?? false),
                      showCesiumInspector: prevState?.showCesiumInspector ?? false,
                    }));
                  }}
                />
                {viewState?.shouldOptimizedTileRequests === true && (
                  <Box className="debuggerLayerList">
                    {[...layersMeta].reverse().map((layer) => {
                      const idText = layer.layerId;
                      const nameText = layer.layerName ?? idText;
                      const statusText =
                        layer.meta?.isRelevantToExtent === true ? ' → show' : layer.meta?.isRelevantToExtent === false ? ' → hide' : '';
                      const hasTransparency = layer.meta[HAS_TRANSPARENCY_META_PROP] as boolean | undefined;
                      const transparencyText =
                        hasTransparency === true ? withTransparencyTiles : hasTransparency === false ? withoutTransparencyTiles : '';
                      const tileCoordinatesFromMeta = layer.meta[EXAMINED_TILES_META_PROP] as
                        | Array<{ x?: number; y?: number; level?: number }>
                        | { x?: number; y?: number; level?: number }
                        | undefined;
                      const tileCoordinatesList = Array.isArray(tileCoordinatesFromMeta)
                        ? tileCoordinatesFromMeta
                        : tileCoordinatesFromMeta !== undefined
                          ? [tileCoordinatesFromMeta]
                          : [];
                      const formattedTileCoordinates = tileCoordinatesList
                        .filter((tile) => tile.x !== undefined && tile.y !== undefined && tile.level !== undefined)
                        .map((tile) => `( L: ${String(tile.level)}, X: ${String(tile.x)}, Y: ${String(tile.y)} )`);
                      const tooltipContent =
                        transparencyText === ''
                          ? undefined
                          : <Box>{transparencyText}: {formattedTileCoordinates.join(', ')}</Box>;
                      const isRelevant = layer.meta?.isRelevantToExtent !== false;
                      if (tooltipContent === undefined) {
                        return (
                          <Box key={idText} className={`debuggerLayerItem ${isRelevant ? 'relevant' : ''}`}>
                            {nameText + statusText}
                          </Box>
                        );
                      }
                      return (
                        <Tooltip key={idText} content={tooltipContent}>
                          <Box className={`debuggerLayerItem ${isRelevant ? 'relevant' : ''}`} data-has-tooltip="true">
                            {nameText + statusText}
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <Box className="debuggerWidgetSection">
            <Box className="debuggerWidgetSectionHeader" onClick={() => toggleSection('tools')}>
              <Box className="debuggerWidgetSectionHeaderToggle">{collapsedSections.tools ? '+' : '-'}</Box>
              <Box className="debuggerWidgetSectionHeaderLabel">{toolsSectionTitle}</Box>
            </Box>
            {!collapsedSections.tools && (
              <Box className="debuggerWidgetSectionContent">
                <Checkbox
                  className="cesiumInspectorCheckbox"
                  label={cesiumInspectorLabel}
                  checked={viewState?.showCesiumInspector ?? false}
                  onClick={() => {
                    setViewState((prevState) => ({
                      currentZoomLevel: prevState?.currentZoomLevel ?? -1,
                      shouldOptimizedTileRequests: prevState?.shouldOptimizedTileRequests ?? false,
                      showCesiumInspector: !(prevState?.showCesiumInspector ?? false),
                    }));
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </CesiumTool>
    </>
  );
};

export const DebuggerWidget = WidgetWrapper(DebuggerComponent);

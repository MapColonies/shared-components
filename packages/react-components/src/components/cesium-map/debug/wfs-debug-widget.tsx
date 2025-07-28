import React, { useEffect, useMemo, useState } from 'react';
import { get } from 'lodash';
import { ICesiumWFSLayer } from '../layers/wfs.layer';
import { useCesiumMap } from '../map';
import { CesiumIcon } from '../widget/cesium-icon';
import { CesiumTool } from '../widget/cesium-tool';
import { WFS } from './wfs';

import './wfs-debug-widget.css';

interface IFeatureTypeMetadata {
  id: string;
  items: number;
  total: number;
  cache: number;
  currentZoomLevel: number;
  featureStructure: Record<string, unknown>;
}

export type IActiveFeatureTypes = IFeatureTypeMetadata & {
  zoomLevel: number;
};

export interface IWFSDebugWidgetProps {
  locale?: { [key: string]: string };
}

export const WFSDebugWidget: React.FC<IWFSDebugWidgetProps> = ({ locale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [featureTypes, setFeatureTypes] = useState<IActiveFeatureTypes[]>([]);
  const title = useMemo(() => get(locale, 'DEBUG_PANEL_TITLE') ?? 'Debugger Tool', [locale]);

  const mapViewer = useCesiumMap();

  useEffect(() => {
    if (!mapViewer.layersManager) return;

    const handleDataLayerUpdated = (dataLayers: ICesiumWFSLayer[], LayerId?: string | undefined): void => {
      dataLayers.forEach((layer: ICesiumWFSLayer): void => {
        if (LayerId !== undefined && LayerId !== layer.meta.id) {
          return;
        }

        const { options, meta } = layer;
        const { zoomLevel } = options;
        const { id, items, total, cache, currentZoomLevel, featureStructure } = meta as unknown as IFeatureTypeMetadata;

        setFeatureTypes((prevFeatureTypes) => {
          const existingIndex = prevFeatureTypes.findIndex((type) => type.id === id);
          if (existingIndex >= 0) {
            if (
              JSON.stringify(prevFeatureTypes[existingIndex]) !==
              JSON.stringify({ id, items, total, cache, currentZoomLevel, featureStructure, zoomLevel })
            ) {
              const updatedFeatureTypes = [...prevFeatureTypes];
              updatedFeatureTypes[existingIndex] = { id, items, total, cache, currentZoomLevel, featureStructure, zoomLevel };
              return updatedFeatureTypes;
            }
          } else {
            return [...prevFeatureTypes, { id, items, total, cache, currentZoomLevel, featureStructure, zoomLevel }];
          }
          return prevFeatureTypes;
        });
      });

      const activeDataLayerIds = new Set(mapViewer.layersManager?.dataLayerList.map((layer) => layer.meta.id));

      setFeatureTypes((prevFeatureTypes) => prevFeatureTypes.filter((type) => activeDataLayerIds.has(type.id)));
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
          <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z" fill="orange" />
        </svg>
      </CesiumIcon>
      <CesiumTool isVisible={isOpen} title={title}>
        <WFS featureTypes={featureTypes} locale={locale} />
      </CesiumTool>
    </>
  );
};
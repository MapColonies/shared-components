import { get } from 'lodash';
import React, { useEffect, useState, useMemo } from 'react';
import { Tooltip } from '@map-colonies/react-core';
import { Box } from '../../box';
import { ICesiumWFSLayer } from '../layers/wfs.layer';
import { CesiumViewer, useCesiumMap } from '../map';

import './wfs.css';

interface IFeatureTypeMetadata {
  id: string;
  items: number;
  total: number;
  cache: number;
  currentZoomLevel: number;
  featureStructure: Record<string, unknown>;
}

type IActiveFeatureTypes = IFeatureTypeMetadata & {
  zoomLevel: number;
};

interface IWFSProps {
  viewer?: CesiumViewer
  locale?: { [key: string]: string };
}

export const WFS: React.FC<IWFSProps> = ({ locale, viewer }) => {
  const mapViewer = viewer ?? useCesiumMap();
  const [featureTypes, setFeatureTypes] = useState<IActiveFeatureTypes[]>([]);
  const title = useMemo(() => get(locale, 'WFS_TITLE') ?? 'Data Layers', [locale]);
  const cacheLabel = useMemo(() => get(locale, 'WFS_CACHE') ?? 'Cache', [locale]);
  const extentLabel = useMemo(() => get(locale, 'WFS_EXTENT') ?? 'Extent', [locale]);

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
    <Box className="wfsContainer">
      <Box className="title">{title}</Box>
      {featureTypes.map((type, index) => (
        <Box key={index} className="featureType">
          <Tooltip content={`${type.featureStructure.aliasLayerName as string} ${type.id} (${String(type.zoomLevel)})`}>
            <Box className={`name ${type.currentZoomLevel < type.zoomLevel ? 'warning blinking' : type.total === -1 ? 'error blinking' : ''}`}>
              {type.featureStructure.aliasLayerName as string} {type.id} ({String(type.zoomLevel)}):
            </Box>
          </Tooltip>
          <Box className="info">
            <Box>
              {cacheLabel}: {type.cache ?? 0}
            </Box>
            {type.total > 0 && (
              <Box className="spacer">
                {extentLabel}: {type.items} / {type.total}
              </Box>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

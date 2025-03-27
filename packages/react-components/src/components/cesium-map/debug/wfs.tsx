// WFS.tsx

import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Box } from '../../box';
import { ICesiumWFSLayer } from '../layers/wfs.layer';
import { useCesiumMap } from '../map';

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
  locale?: { [key: string]: string };
}

export const WFS: React.FC<IWFSProps> = ({ locale }) => {
  const mapViewer = useCesiumMap();
  const [featureTypes, setFeatureTypes] = useState<IActiveFeatureTypes[]>([]);

  const title = get(locale, 'WFS_TITLE') ?? 'Data Layers';
  const cacheLabel = get(locale, 'WFS_CACHE') ?? 'Cache';
  const extentLabel = get(locale, 'WFS_EXTENT') ?? 'Extent';

  useEffect(() => {
    if (!mapViewer.layersManager) return;

    const handleDataLayerUpdated = (dataLayers: ICesiumWFSLayer[], LayerId?: string | undefined): void => {
      dataLayers.forEach((layer: ICesiumWFSLayer): void => {
        if (LayerId !== undefined) {
          if (LayerId !== layer.meta.id) return;
        }

        const { options, meta } = layer;
        const { zoomLevel } = options;
        const { id, items, total, cache, currentZoomLevel, featureStructure } = meta as unknown as IFeatureTypeMetadata;

        setFeatureTypes(prevFeatureTypes => {
          const existingIndex = prevFeatureTypes.findIndex(type => type.id === id);
          if (existingIndex >= 0) {
            if (JSON.stringify(prevFeatureTypes[existingIndex]) !== JSON.stringify({ id, items, total, cache, currentZoomLevel, featureStructure, zoomLevel })) {
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
    };

    mapViewer.layersManager.addDataLayerUpdatedListener(handleDataLayerUpdated);

    return () => {
      mapViewer.layersManager?.removeDataLayerUpdatedListener(handleDataLayerUpdated);
    };
  }, [mapViewer.layersManager]);
  
  return (
    <Box className="wfsContainer">
      <Box className="title">{title}</Box>
      {
        featureTypes.map((type, index) => (
          <Box key={index} className="featureType">
            <Box className={`name ${type.currentZoomLevel < type.zoomLevel ? 'warning' : type.total === -1 ? 'error' : ''}`}>
              {type.featureStructure.aliasLayerName as string} {type.id} ({type.zoomLevel}):
            </Box>
            <Box className="info">
              <Box>{cacheLabel}: {type.cache}</Box>
              {type.total > 0 && <Box className="spacer">{extentLabel}: {type.items} / {type.total}</Box>}
            </Box>
          </Box>
        ))
      }
    </Box>
  );
};
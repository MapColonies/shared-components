import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Tooltip } from '@map-colonies/react-core';
import { Box } from '../../box';
import { ICesiumImageryLayer } from '../layers-manager';
import { CesiumViewer, useCesiumMap } from '../map';

import './active-layers-panel.css';

interface IActiveLayersPanelProps {
  viewer?: CesiumViewer;
  locale?: { [key: string]: string };
}

export const ActiveLayersPanel: React.FC<IActiveLayersPanelProps> = ({ viewer, locale }) => {
  const mapViewer = viewer ?? useCesiumMap();
  const [active, setActive] = useState<ICesiumImageryLayer[]>([]);

  useEffect(() => {
    if (!mapViewer.layersManager) return;

    const handleLayerUpdated = (layers: ICesiumImageryLayer[], layerId?: string): void => {
      layers.forEach((layer: ICesiumImageryLayer): void => {
        if (layerId !== undefined && layerId !== layer.meta?.id) {
          return;
        }
        setActive((prevActive) => {
          const existingIndex = prevActive.findIndex((item) => item.meta?.id === layer.meta?.id);
          if (existingIndex >= 0) {
            if (JSON.stringify(prevActive[existingIndex]) !== JSON.stringify(layer)) {
              const updatedActive = [...prevActive];
              updatedActive[existingIndex] = layer;
              return updatedActive;
            }
          } else {
            return [...prevActive, layer];
          }
          return prevActive;
        });
      });

      const activeLayersIds = new Set(mapViewer.layersManager?.layerList.map((layer) => layer.meta?.id));

      setActive((prevActive) => prevActive.filter((item) => activeLayersIds.has(item.meta?.id)));
    };

    mapViewer.layersManager.addLayerUpdatedListener(handleLayerUpdated);

    return () => {
      mapViewer.layersManager?.removeLayerUpdatedListener(handleLayerUpdated);
    };
  }, [mapViewer.layersManager?.layerList]);

  return (
    <Box className="activeLayersContainer">
      {
        active.map((layer, index) => (
          <Box key={index} className="layer">
            <Tooltip content={layer.meta?.id as string}>
              <Box className="name">
                {layer.meta?.id as string}
              </Box>
            </Tooltip>
          </Box>
        ))
      }
    </Box>
  );
};

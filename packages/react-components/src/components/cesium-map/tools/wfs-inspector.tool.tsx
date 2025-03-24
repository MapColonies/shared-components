import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Icon } from '@map-colonies/react-core';
import { Box } from '../../box';
import { ICesiumWFSLayer } from '../layers/wfs.layer';
import { useCesiumMap } from '../map';

import './wfs-inspector.tool.css';

interface IFeatureTypeMetadata {
  id: string;
  zoomLevel: number;
  items: number;
  total: number;
  cache: number;
}

export interface WFSInspectorToolProps {
  locale?: { [key: string]: string };
}

export const WFSInspectorTool: React.FC<WFSInspectorToolProps> = ({ locale }) => {
  const mapViewer = useCesiumMap();
  const [featureTypes, setFeatureTypes] = useState<IFeatureTypeMetadata[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const dialogTitle = get(locale, 'WFS_INSPECTOR_DIALOG_TITLE') ?? 'Data Layers';

  useEffect(() => {
    if (!mapViewer.layersManager) return;

    const handleDataLayerUpdated = (dataLayers: ICesiumWFSLayer[]): void => {
      dataLayers.forEach((layer: ICesiumWFSLayer): void => {
        const { options, meta } = layer;
        const { zoomLevel } = options;
        const { id, items, total, cache } = meta as { id: string; items: number; total: number; cache: number };

        setFeatureTypes(prevFeatureTypes => {
          const existingIndex = prevFeatureTypes.findIndex(type => type.id === id);
          if (existingIndex >= 0) {
            if (JSON.stringify(prevFeatureTypes[existingIndex]) !== JSON.stringify({ id, zoomLevel, items, total, cache })) {
              const updatedFeatureTypes = [...prevFeatureTypes];
              updatedFeatureTypes[existingIndex] = { id, zoomLevel, items, total, cache };
              return updatedFeatureTypes;
            }
          } else {
            return [...prevFeatureTypes, { id, zoomLevel, items, total, cache }];
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
    <>
      <Icon
        icon={
          <div className="wfsLayersIconContainer">
            <svg width="100%" height="100%" viewBox="0 0 24 24">
              <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/>
            </svg>
          </div>
        }
        onClick={(): void => {
          setIsOpen(!isOpen);
        }}
      />
      {
        isOpen && (
        <div className="wfsLayersInspector">
          <Dialog
            open={isOpen}
            onClosed={(): void => {
              setIsOpen(false);
            }}
          >
            <DialogTitle className="title">{dialogTitle}</DialogTitle>
            <DialogContent>
              <Box>
                {
                  featureTypes.map((type, index) => (
                    <Box key={index} className="featureType">
                      <Box className="name">{type.id} (zoom {type.zoomLevel}):</Box>
                      <Box>Total in cache: {type.cache}</Box>
                      <Box>Extent: {type.items} / {type.total}</Box>
                    </Box>
                  ))
                }
              </Box>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
};

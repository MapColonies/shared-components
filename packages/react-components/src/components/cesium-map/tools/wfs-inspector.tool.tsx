import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Icon } from '@map-colonies/react-core';
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
        const existingIndex = featureTypes.findIndex(type => type.id === id);
        if (existingIndex >= 0) {
          if (JSON.stringify(featureTypes[existingIndex]) !== JSON.stringify({ id, zoomLevel, items, total, cache })) {
            const updatedFeatureTypes = [...featureTypes];
            updatedFeatureTypes[existingIndex] = { id, zoomLevel, items, total, cache };
            setFeatureTypes(updatedFeatureTypes);
          }
        } else {
          setFeatureTypes([...featureTypes, { id, zoomLevel, items, total, cache }]);
        }
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
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
              <ul>
                {
                  featureTypes.map((type, index) => (
                    <li key={index}>
                      {type.id} (zoom {type.zoomLevel}):
                      Total in cache: 
                      Extent: {type.items} / {type.total}
                    </li>
                  ))
                }
              </ul>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
};

import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Icon } from '@map-colonies/react-core';
import { Box } from '../../box';
import { ICesiumWFSLayer } from '../layers/wfs.layer';
import { useCesiumMap } from '../map';

import './wfs-inspector.tool.css';

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

export interface WFSInspectorToolProps {
  locale?: { [key: string]: string };
}

export const WFSInspectorTool: React.FC<WFSInspectorToolProps> = ({ locale }) => {
  const mapViewer = useCesiumMap();
  const [featureTypes, setFeatureTypes] = useState<IActiveFeatureTypes[]>([]);
  const [isOpen, setIsOpen] = useState(true);

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
        isOpen &&
        <div className="wfsLayersInspector">
          <Dialog
            open={isOpen}
            onClosed={(): void => {
              setIsOpen(false);
            }}
          >
            <DialogTitle></DialogTitle>
            <DialogContent>
              <Box>
                <Box className="title">{title}</Box>
                {
                  featureTypes.map((type, index) => (
                    <Box key={index} className="featureType">
                      <Box className={`name ${type.currentZoomLevel < type.zoomLevel ? 'warning' : ''}`}>
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
            </DialogContent>
          </Dialog>
        </div>
      }
    </>
  );
};

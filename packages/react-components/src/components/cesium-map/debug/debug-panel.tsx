import React, { useMemo, useState, ReactNode, useEffect } from 'react';
import { get } from 'lodash';
import { Dialog, DialogTitle, DialogContent, Icon } from '@map-colonies/react-core';
import { ICesiumWFSLayer } from '../layers/wfs.layer';
import { useCesiumMap } from '../map';

import './debug-panel.css';

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

export interface IDebugPanelProps {
  children: ReactNode;
  locale?: { [key: string]: string };
}

export const DebugPanel: React.FC<IDebugPanelProps> = ({ children, locale }) => {
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
      <Icon
        icon={
          <div className="debugPanelIconContainer">
            <svg width="100%" height="100%" viewBox="0 0 24 24">
              <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z" />
            </svg>
          </div>
        }
        onClick={(): void => {
          setIsOpen(!isOpen);
        }}
      />
      {
        isOpen &&
        <div className="debugPanel">
          <Dialog
            open={isOpen}
            onClosed={(): void => {
              setIsOpen(false);
            }}
          >
            <DialogTitle className="title">{title}</DialogTitle>
            <DialogContent>
              {
                React.Children.map(children, (child) => {
                  return React.isValidElement<{ featureTypes?: IActiveFeatureTypes[] }>(child)
                    ? React.cloneElement(child, { featureTypes })
                    : child;
                })
              }
            </DialogContent>
          </Dialog>
        </div>
      }
    </>
  );
};

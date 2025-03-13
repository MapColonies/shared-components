import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Icon } from '@map-colonies/react-core';
import { useCesiumMap } from '../map';
import { get } from 'lodash';

import './wfs-inspector.tool.css';

export interface WFSInspectorToolProps {
  locale?: { [key: string]: string };
}

export const WFSInspectorTool: React.FC<WFSInspectorToolProps> = ({ locale }) => {
  const mapViewer = useCesiumMap();
  const [featureTypes, setFeatureTypes] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const dialogTitle = get(locale, 'WFS_INSPECTOR_DIALOG_TITLE') ?? 'WFS Layers Inspector';

  useEffect(() => {
    if (!mapViewer) return;

    const updateFeatureTypes = () => {
      const types = [...new Set(mapViewer.entities.values.map(entity => (entity as any).featureType))];
      setFeatureTypes(types.filter(Boolean));
    };

    updateFeatureTypes();

    const entityCollectionChanged = () => {
      updateFeatureTypes();
    };
    
    mapViewer.entities.collectionChanged.addEventListener(entityCollectionChanged);

    // return () => {
    //   mapViewer.entities.collectionChanged.removeEventListener(entityCollectionChanged);
    // };
  }, []);

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
                  <li key={index}>{type}</li>
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

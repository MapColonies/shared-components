import _, { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Typography } from '@map-colonies/react-core';
import { Box } from '../../box';
import { ICesiumWFSLayer } from '../layers/wfs.layer';
import { ICesiumImageryLayer } from '../layers-manager';
import { useCesiumMap } from '../map';

import './active-layers-panel.css';

const IMAGERY = 'Imagery';
const DATA = 'Data';

interface ISection {
  id: string;
  content: string[];
}

interface IActiveLayersPanelProps {
  locale?: { [key: string]: string };
}

export const ActiveLayersPanel: React.FC<IActiveLayersPanelProps> = ({ locale }) => {
  const mapViewer = useCesiumMap();
  const [sections, setSections] = useState<ISection[]>([ { id: IMAGERY, content: [] }, { id: DATA, content: [] } ]);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const getLabel = (key: string) => {
    return get(locale, `${key.toUpperCase()}_SECTION`) ?? key;
  };

  useEffect(() => {
    const updateSections = () => {
      const newSections = [
        {
          id: IMAGERY,
          content: mapViewer.layersManager?.layerList.map((layer) => layer.meta?.id as string) || [],
        },
        {
          id: DATA,
          content: mapViewer.layersManager?.dataLayerList.map((layer) => layer.meta?.productName as string) || [],
        },
      ];
      setSections(newSections);
      setCollapsedSections(newSections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {}));
    };
    updateSections();
  }, []);

  useEffect(() => {
    if (!mapViewer.layersManager) return;

    const handleLayerUpdated = (layers: ICesiumImageryLayer[]): void => {
      setSections((prev) =>
        prev.map((item) =>
          item.id === IMAGERY
            ? { ...item, content: (layers.map((layer) => layer.meta?.id) || []).map(String) }
            : item
        )
      );
    };

    mapViewer.layersManager.addLayerUpdatedListener(handleLayerUpdated);

    return () => {
      mapViewer.layersManager?.removeLayerUpdatedListener(handleLayerUpdated);
    };
  }, [mapViewer.layersManager?.layerList]);

  useEffect(() => {
    if (!mapViewer.layersManager) return;

    const handleDataLayerUpdated = (dataLayers: ICesiumWFSLayer[]): void => {
      setSections((prev) =>
        prev.map((item) =>
          item.id === DATA
            ? { ...item, content: (dataLayers.map((layer) => layer.meta?.id) || []).map(String) }
            : item
        )
      );
    };

    mapViewer.layersManager.addDataLayerUpdatedListener(handleDataLayerUpdated);

    return () => {
      mapViewer.layersManager?.removeDataLayerUpdatedListener(handleDataLayerUpdated);
    };
  }, [mapViewer.layersManager?.dataLayerList]);

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Box className="activeLayersContainer">
      {
        sections.filter(item => item.content.length > 0).map((section) => (
          <Box
            key={section.id}
            className={`cesium-cesiumInspector-section ${collapsedSections[section.id] ? 'cesium-cesiumInspector-section-collapsed' : ''}`}
            onClick={() => toggleSection(section.id)}
          >
            <Typography tag="h3" className="cesium-cesiumInspector-sectionHeader">
              {getLabel(section.id)}
            </Typography>
            <Box className="cesium-cesiumInspector-sectionContent">
              {
                section.content.map((active: string) => <Box key={active}>{active}</Box>)
              }
            </Box>
          </Box>
        ))
      }
    </Box>
  );
};

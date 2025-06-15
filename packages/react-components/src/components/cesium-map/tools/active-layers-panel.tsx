import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Tooltip, Typography } from '@map-colonies/react-core';
import { Box } from '../../box';
import { ICesiumImageryLayer } from '../layers-manager';
import { CesiumViewer, useCesiumMap } from '../map';

import './active-layers-panel.css';

interface ISection {
  id: string;
  content: string[];
}

interface IActiveLayersPanelProps {
  viewer?: CesiumViewer;
  locale?: { [key: string]: string };
}

export const ActiveLayersPanel: React.FC<IActiveLayersPanelProps> = ({ viewer, locale }) => {
  const mapViewer = viewer ?? useCesiumMap();
  const [active, setActive] = useState<ICesiumImageryLayer[]>([]);
  const [sections, setSections] = useState<ISection[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const getLabel = (key: string) => {
    return get(locale, `${key.toUpperCase()}_SECTION`) ?? key;
  };

  useEffect(() => {
    const updateSections = () => {
      const newSections = [
        {
          id: 'Raster',
          content: [
            'Bla bla bla',
            'Kuku',
            'Muku'
          ],
        },
        {
          id: '3D',
          content: [],
        },
        {
          id: 'DEM',
          content: [],
        },
        {
          id: 'Vector',
          content: [],
        },
      ];
      setSections(newSections);
      setCollapsedSections(newSections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {}));
    };

    updateSections();
  }, []);

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

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Box className="activeLayersContainer">
      {
        sections.map((section) => (
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
                section.content.map((item: string) => <Box key={item}>{item}</Box>)
              }
            </Box>
          </Box>
        ))
      }
      {
        active.filter((layer) => layer.meta?.type === 'raster').map((layer, index) => (
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

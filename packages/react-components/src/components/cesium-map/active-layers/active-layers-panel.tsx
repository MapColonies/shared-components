import { Rectangle } from 'cesium';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Typography } from '@map-colonies/react-core';
import bbox from '@turf/bbox';
import { Box } from '../../box';
import { useCesiumMap } from '../map';

import './active-layers-panel.css';

const IMAGERY = 'Imagery';
const DATA = 'Data';

interface IActive {
  id: string;
  name: string;
  rect: Rectangle;
}

interface ISection {
  id: string;
  values: IActive[];
}

interface IActiveLayersPanelProps {
  locale?: { [key: string]: string };
}

export const ActiveLayersPanel: React.FC<IActiveLayersPanelProps> = ({ locale }) => {
  const mapViewer = useCesiumMap();
  const [sections, setSections] = useState<ISection[]>([ { id: IMAGERY, values: [] }, { id: DATA, values: [] } ]);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const getLabel = (key: string) => {
    return get(locale, key.toUpperCase()) ?? key;
  };

  useEffect(() => {
    const updateSections = () => {
      const newSections = [
        {
          id: IMAGERY,
          values: mapViewer.layersManager?.layerList.map((layer) => {
            return {
              id: layer.meta?.id as string,
              name: layer.meta?.id as string,
              rect: layer.rectangle
            }; }) || [],
        },
        {
          id: DATA,
          values: mapViewer.layersManager?.dataLayerList.map((dataLayer) => {
            return {
              id: dataLayer.meta?.id as string,
              name: (get(dataLayer.meta, 'featureStructure.aliasLayerName') ?? dataLayer.meta.productName) as string,
              rect: Rectangle.fromDegrees(...bbox(dataLayer.meta?.footprint))
            }; }) || [],
        },
      ];
      setSections(newSections);
      setCollapsedSections(newSections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {}));
    };
    updateSections();
  }, []);

  useEffect(() => {
    if (!mapViewer.layersManager) return;
    const handleLayerEvent = (): void => {
      setSections((prev) =>
        prev.map((item) =>
          item.id === IMAGERY
            ? {
                ...item,
                values: (mapViewer.layersManager?.layerList.map((layer) => {
                  return {
                    id: layer.meta?.id as string,
                    name: (get(layer.meta, 'layerRecord.productName') ?? layer.meta?.id) as string,
                    rect: layer.rectangle
                  }; }) || [])
              }
            : item
        )
      );
    };
    mapViewer.imageryLayers.layerAdded.addEventListener(handleLayerEvent);
    mapViewer.imageryLayers.layerRemoved.addEventListener(handleLayerEvent);
    return () => {
      mapViewer.imageryLayers.layerAdded.removeEventListener(handleLayerEvent);
      mapViewer.imageryLayers.layerRemoved.removeEventListener(handleLayerEvent);
    };
  }, [mapViewer.layersManager?.layerList]);

  useEffect(() => {
    if (!mapViewer.layersManager) return;
    const handleDataLayerEvent = (): void => {
      setSections((prev) =>
        prev.map((item) =>
          item.id === DATA
            ? {
                ...item,
                values: (mapViewer.layersManager?.dataLayerList.map((dataLayer) => {
                  return {
                    id: dataLayer.meta?.id as string,
                    name: (get(dataLayer.meta, 'featureStructure.aliasLayerName') ?? dataLayer.meta.productName) as string,
                    rect: Rectangle.fromDegrees(...bbox(dataLayer.meta?.footprint))
                  }; }) || [])
              }
            : item
        )
      );
    };
    mapViewer.layersManager.addDataLayerUpdatedListener(handleDataLayerEvent);
    return () => {
      mapViewer.layersManager?.removeDataLayerUpdatedListener(handleDataLayerEvent);
    };
  }, [mapViewer.layersManager?.dataLayerList]);

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFlyTo = (rect: Rectangle) => {
    mapViewer.camera.flyTo({ destination: rect });
  };

  return (
    <Box className="activeLayersPanel">
      {
        sections.filter(item => item.values.length > 0).map((section) => (
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
                section.values.map((active: IActive) => (
                  <Box key={active.id} className="layer">
                    <Box>{active.name}</Box>
                    <Box className="icons">
                      <Box className="icon" onClick={(event) => { event.stopPropagation(); handleFlyTo(active.rect); }}>
                        <svg fill="var(--mdc-theme-cesium-color)" width="100%" height="100%" viewBox="0 0 256 256">
                          <path d="M236,120H223.66406A96.15352,96.15352,0,0,0,136,32.33618V20a8,8,0,0,0-16,0V32.33618A96.15352,96.15352,0,0,0,32.33594,120H20a8,8,0,0,0,0,16H32.33594A96.15352,96.15352,0,0,0,120,223.66382V236a8,8,0,0,0,16,0V223.66382A96.15352,96.15352,0,0,0,223.66406,136H236a8,8,0,0,0,0-16Zm-40,16h11.59912A80.14164,80.14164,0,0,1,136,207.59912V196a8,8,0,0,0-16,0v11.59912A80.14164,80.14164,0,0,1,48.40088,136H60a8,8,0,0,0,0-16H48.40088A80.14164,80.14164,0,0,1,120,48.40088V60a8,8,0,0,0,16,0V48.40088A80.14164,80.14164,0,0,1,207.59912,120H196a8,8,0,0,0,0,16Zm-28-8a40,40,0,1,1-40-40A40.04552,40.04552,0,0,1,168,128Z"/>
                        </svg>
                      </Box>
                      <Box className="icon" onClick={() => {}}>
                        <svg width="100%" height="100%" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="var(--mdc-theme-cesium-color)">
                          <path fillRule="evenodd" clipRule="evenodd" d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"/>
                        </svg>
                      </Box>
                    </Box>
                  </Box>
                ))
              }
            </Box>
          </Box>
        ))
      }
    </Box>
  );
};

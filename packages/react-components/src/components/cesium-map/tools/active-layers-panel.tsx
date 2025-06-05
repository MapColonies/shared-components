import { get } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { Tooltip, Typography } from '@map-colonies/react-core';
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
  const [collapsedRaster, setCollapsedRaster] = useState(true);
  const [collapsed3D, setCollapsed3D] = useState(true);
  const [collapsedDEM, setCollapsedDEM] = useState(true);
  const [collapsedVector, setCollapsedVector] = useState(true);
  const rasterLabel = useMemo(() => get(locale, 'RASTER_SECTION') ?? 'Raster', [locale]);
  const threeDLabel = useMemo(() => get(locale, '3D_SECTION') ?? '3D', [locale]);
  const demLabel = useMemo(() => get(locale, 'DEM_SECTION') ?? 'DEM', [locale]);
  const vectorLabel = useMemo(() => get(locale, 'VECTOR_SECTION') ?? 'Vector', [locale]);

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

  const toggleRaster = () => {
    setCollapsedRaster((prev) => !prev);
  };

  const toggle3D = () => {
    setCollapsed3D((prev) => !prev);
  };

  const toggleDEM = () => {
    setCollapsedDEM((prev) => !prev);
  };

  const toggleVector = () => {
    setCollapsedVector((prev) => !prev);
  };

  return (
    <Box className="activeLayersContainer">
      <Box className={`cesium-cesiumInspector-section ${collapsedRaster ? 'cesium-cesiumInspector-section-collapsed' : ''}`} onClick={toggleRaster}>
        <Typography tag="h3" className="cesium-cesiumInspector-sectionHeader">{rasterLabel}</Typography>
        <Box className="cesium-cesiumInspector-sectionContent">
          <Box>Bla bla bla</Box>
          <Box>Kuku</Box>
          <Box>Muku</Box>
        </Box>
      </Box>
      <Box className={`cesium-cesiumInspector-section ${collapsed3D ? 'cesium-cesiumInspector-section-collapsed' : ''}`} onClick={toggle3D}>
        <Typography tag="h3" className="cesium-cesiumInspector-sectionHeader">{threeDLabel}</Typography>
        <Box className="cesium-cesiumInspector-sectionContent">
          N/A
        </Box>
      </Box>
      <Box className={`cesium-cesiumInspector-section ${collapsedDEM ? 'cesium-cesiumInspector-section-collapsed' : ''}`} onClick={toggleDEM}>
        <Typography tag="h3" className="cesium-cesiumInspector-sectionHeader">{demLabel}</Typography>
        <Box className="cesium-cesiumInspector-sectionContent">
          N/A
        </Box>
      </Box>
      <Box className={`cesium-cesiumInspector-section ${collapsedVector ? 'cesium-cesiumInspector-section-collapsed' : ''}`} onClick={toggleVector}>
        <Typography tag="h3" className="cesium-cesiumInspector-sectionHeader">{vectorLabel}</Typography>
        <Box className="cesium-cesiumInspector-sectionContent">
          N/A
        </Box>
      </Box>
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

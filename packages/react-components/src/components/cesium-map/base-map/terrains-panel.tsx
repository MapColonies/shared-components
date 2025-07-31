import React from 'react';
import { TerrainProvider } from 'cesium';
import { Box } from '../../box';
import { CesiumTitle } from '../widget/cesium-title';

interface TerrainsPanelProps {
  title: string;
  terrainProvider?: TerrainProvider;
}

export const TerrainsPanel: React.FC<TerrainsPanelProps> = ({ title, terrainProvider }) => {
  const provider = {
    name: 'Terrain',
    tooltip: 'Default Terrain',
    iconUrl: 'Cesium/Widgets/Images/TerrainProviders/Ellipsoid.png',
  };

  return (
    <Box className="cesium-baseLayerPicker-section">
      <Box className="cesium-baseLayerPicker-category">
        <CesiumTitle title={title} />
        <Box className="cesium-baseLayerPicker-choices">
          <Box
            className="cesium-baseLayerPicker-item cesium-baseLayerPicker-selectedItem"
            title={provider.name}
          >
            <img className="cesium-baseLayerPicker-itemIcon" src={provider.iconUrl} alt={provider.name} />
            <Box className="cesium-baseLayerPicker-itemLabel">{provider.name}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

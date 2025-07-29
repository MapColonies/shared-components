import React from 'react';
import { TerrainProvider } from 'cesium';

interface TerrainsPanelProps {
  terrainProvider?: TerrainProvider;
}

export const TerrainsPanel: React.FC<TerrainsPanelProps> = ({ terrainProvider }) => {
  const provider = {
    name: 'Terrain',
    tooltip: 'Default Terrain',
    iconUrl: 'Cesium/Widgets/Images/TerrainProviders/Ellipsoid.png',
  };

  return (
    <div className="cesium-baseLayerPicker-section">
      <div className="cesium-baseLayerPicker-category">
        <div className="cesium-baseLayerPicker-categoryTitle"></div>
        <div className="cesium-baseLayerPicker-choices">
          <div
            className="cesium-baseLayerPicker-item cesium-baseLayerPicker-selectedItem"
            title={provider.name}
          >
            <img className="cesium-baseLayerPicker-itemIcon" src={provider.iconUrl} alt={provider.name} />
            <div className="cesium-baseLayerPicker-itemLabel">{provider.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

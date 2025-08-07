import React, { useEffect, useState } from 'react';
import { Box } from '../../box';
import { ITerrain, useCesiumMap } from '../map';
import { CesiumTitle } from '../widget/cesium-title';
import { CesiumItem } from './cesium-item';
import { EllipsoidTerrainProvider } from 'cesium';

interface TerrainsPanelProps {
  title: string;
  terrains: ITerrain[];
}

export const TerrainsPanel: React.FC<TerrainsPanelProps> = ({ title, terrains }) => {
  const [selected, setSelected] = useState<ITerrain | undefined>();
  const mapViewer = useCesiumMap();

  useEffect(() => {
    const defaultTerrain = terrains.find((terrain: ITerrain) => terrain.isCurrent);
    if (defaultTerrain) {
      setSelected(defaultTerrain);
    }
  }, [terrains]);

  const handleItemSelection = (id: string): void => {
    const selectedTerrain = terrains.find((terrain: ITerrain) => terrain.id === id);
    if (selectedTerrain) {
      mapViewer.terrainProvider = selectedTerrain.terrainProvider ?? new EllipsoidTerrainProvider({});
      setSelected(selectedTerrain);
      terrains.forEach((terrain: ITerrain) => {
        terrain.isCurrent = selectedTerrain === terrain;
      });
    }
  };

  return (
    <>
      <CesiumTitle title={title} />
      <Box className="cesium-mc-choices">
        {
          terrains.map((terrain: ITerrain) => (
            <CesiumItem
              key={terrain.id}
              item={terrain}
              isSelected={selected === terrain}
              onClick={() => handleItemSelection(terrain.id)}
            />
          ))
        }
      </Box>
    </>
  );
};

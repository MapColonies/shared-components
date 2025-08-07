import React, { useState, useEffect } from 'react';
import { Box } from '../../box';
import { CesiumViewer, IBaseMap, IBaseMaps, useCesiumMap } from '../map';
import { CesiumTitle } from '../widget/cesium-title';
import { CesiumItem } from './cesium-item';

interface BaseMapsPanelProps {
  title: string;
  baseMaps: IBaseMaps;
  setCurrent: (map: IBaseMap) => void;
}

export const BaseMapsPanel: React.FC<BaseMapsPanelProps> = ({ title, baseMaps, setCurrent }) => {
  const mapViewer: CesiumViewer = useCesiumMap();
  const [selectedBaseMap, setSelectedBaseMap] = useState<IBaseMap | undefined>();

  useEffect(() => {
    const defaultMap = baseMaps.maps.find((map: IBaseMap) => map.isCurrent);
    if (defaultMap) {
      setSelectedBaseMap(defaultMap);
      setCurrent(defaultMap);
    }
  }, [baseMaps]);

  const handleItemSelection = (id: string): void => {
    mapViewer.layersManager?.removeBaseMapLayers();
    const selectedBaseMap = baseMaps.maps.find((map: IBaseMap) => map.id === id);
    if (selectedBaseMap) {
      mapViewer.layersManager?.setBaseMapLayers(selectedBaseMap);
      setSelectedBaseMap(selectedBaseMap);
      setCurrent(selectedBaseMap);
      baseMaps.maps.forEach((map: IBaseMap) => {
        map.isCurrent = selectedBaseMap === map;
      });
    }
  };

  return (
    <>
      <CesiumTitle title={title} />
      <Box className="cesium-mc-choices">
        {
          baseMaps.maps.map((map: IBaseMap) => (
            <CesiumItem
              key={map.id}
              item={map}
              isSelected={selectedBaseMap === map}
              onClick={() => handleItemSelection(map.id)}
            />
          ))
        }
      </Box>
    </>
  );
};

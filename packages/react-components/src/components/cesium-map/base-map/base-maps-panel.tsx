import React, { useState, useEffect } from 'react';
import { Box } from '../../box';
import { CesiumViewer, IBaseMap, IBaseMaps, useCesiumMap } from '../map';
import { CesiumTitle } from '../widget/cesium-title';

interface BaseMapsPanelProps {
  title: string;
  setCurrent: (map: IBaseMap) => void;
  baseMaps?: IBaseMaps;
}

export const BaseMapsPanel: React.FC<BaseMapsPanelProps> = ({ title, setCurrent, baseMaps }) => {
  const mapViewer: CesiumViewer = useCesiumMap();
  const [selectedBaseMap, setSelectedBaseMap] = useState<IBaseMap | undefined>();

  useEffect(() => {
    const defaultMap = baseMaps?.maps.find((map: IBaseMap) => map.isCurrent);
    if (defaultMap) {
      setSelectedBaseMap(defaultMap);
      setCurrent(defaultMap);
    }
  }, [baseMaps]);

  const handleMapSection = (id: string): void => {
    if (baseMaps) {
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
    }
  };

  return (
    <Box className="cesium-baseLayerPicker-section">
      <Box className="cesium-baseLayerPicker-category">
        <CesiumTitle title={title} />
        <Box className="cesium-baseLayerPicker-choices">
          {
            baseMaps?.maps.map((map: IBaseMap) => (
              <Box
                className={`cesium-baseLayerPicker-item ${selectedBaseMap === map ? 'cesium-baseLayerPicker-selectedItem' : ''}`}
                title={map.title}
                key={map.id}
                onClick={() => handleMapSection(map.id)}
              >
                <img className="cesium-baseLayerPicker-itemIcon" src={map.thumbnail} alt={map.title} />
                <Box className="cesium-baseLayerPicker-itemLabel">{map.title}</Box>
              </Box>
            ))
          }
        </Box>
      </Box>
    </Box>
  );
};

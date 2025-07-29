import React, { useState, useEffect } from 'react';
import { CesiumViewer, IBaseMap, IBaseMaps, useCesiumMap } from '../map';

interface BaseMapsPanelProps {
  baseMaps?: IBaseMaps;
}

export const BaseMapsPanel: React.FC<BaseMapsPanelProps> = ({ baseMaps }) => {
  const mapViewer: CesiumViewer = useCesiumMap();
  const [currentMap, setCurrentMap] = useState<string>(' ');
  const [selectedBaseMap, setSelectedBaseMap] = useState<IBaseMap | undefined>();

  useEffect(() => {
    const defaultMap = baseMaps?.maps.find((map: IBaseMap) => map.isCurrent);
    if (defaultMap) {
      setSelectedBaseMap(defaultMap);
      setCurrentMap(defaultMap.title ?? ' ');
    }
  }, [baseMaps]);

  const handleMapSection = (id: string): void => {
    if (baseMaps) {
      mapViewer.layersManager?.removeBaseMapLayers();
      const selectedBaseMap = baseMaps.maps.find((map: IBaseMap) => map.id === id);
      if (selectedBaseMap) {
        mapViewer.layersManager?.setBaseMapLayers(selectedBaseMap);
        setSelectedBaseMap(selectedBaseMap);
        baseMaps.maps.forEach((map: IBaseMap) => {
          map.isCurrent = selectedBaseMap === map;
        });
      }
    }
  };

  return (
    <div className="cesium-baseLayerPicker-section">
      <div className="cesium-baseLayerPicker-category">
        <div className="cesium-baseLayerPicker-categoryTitle"></div>
        <div className="cesium-baseLayerPicker-choices">
          {baseMaps?.maps.map((map: IBaseMap) => (
            <div
              className={`cesium-baseLayerPicker-item ${selectedBaseMap === map ? 'cesium-baseLayerPicker-selectedItem' : ''}`}
              title={map.title}
              key={map.id}
              onMouseOver={() => setCurrentMap(map.title ?? ' ')}
              onMouseOut={() => setCurrentMap(selectedBaseMap?.title ?? ' ')}
              onClick={() => handleMapSection(map.id)}
            >
              <img className="cesium-baseLayerPicker-itemIcon" src={map.thumbnail} alt={map.title} />
              <div className="cesium-baseLayerPicker-itemLabel">{map.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

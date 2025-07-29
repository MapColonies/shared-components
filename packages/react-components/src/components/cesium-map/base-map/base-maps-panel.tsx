import React, { useState, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { CesiumViewer, IBaseMap, IBaseMaps, useCesiumMap } from '../map';

import './base-maps-panel.css';

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    mapContainer: {
      width: '60px',
      height: '60px',
      border: `${theme.palette.background.paper} 2px solid`,
    },
  })
);

interface BaseMapsPanelProps {
  baseMaps?: IBaseMaps;
}

export const BaseMapsPanel: React.FC<BaseMapsPanelProps> = ({ baseMaps }) => {
  const mapViewer: CesiumViewer = useCesiumMap();
  const [currentMap, setCurrentMap] = useState<string>(' ');
  const [selectedBaseMap, setSelectedBaseMap] = useState<IBaseMap | undefined>();
  const classes = useStyle();

  useEffect(() => {
    const defaultMap = baseMaps?.maps.find((map: IBaseMap) => map.isCurrent);
    if (defaultMap) {
      setSelectedBaseMap(defaultMap);
      setCurrentMap(defaultMap.title !== undefined ? defaultMap.title : ' ');
    }
  }, [baseMaps]);

  const handleMapSection = (id: string): void => {
    if (baseMaps) {
      // Remove previous base-map layers
      mapViewer.layersManager?.removeBaseMapLayers();

      // Change base-map: add base-map layers by zIndex order
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
    <>
      <label className="mapLabel">{currentMap}</label>
      <ul className="mapSelector">
        {
          baseMaps?.maps.map((map: IBaseMap) => (
            <li className={`mapContainer ${classes.mapContainer} ${map === selectedBaseMap ? 'mapContainerSelected' : ''}`} key={map.id}>
              <img
                alt={''}
                className="mapContainerImg"
                src={map.thumbnail}
                onMouseOver={(): void => {
                  setCurrentMap(map.title as string);
                }}
                onMouseOut={(): void => {
                  setCurrentMap(selectedBaseMap?.title !== undefined ? selectedBaseMap.title : ' ');
                }}
                onClick={(): void => {
                  handleMapSection(map.id);
                }}
              />
            </li>
          ))
        }
      </ul>
    </>
  );
};

{/* <div class="cesium-baseLayerPicker-sectionTitle">Base Map</div>
<div class="cesium-baseLayerPicker-section">
  <div class="cesium-baseLayerPicker-category">
    <div class="cesium-baseLayerPicker-categoryTitle"></div>
    <div class="cesium-baseLayerPicker-choices">
      <div class="cesium-baseLayerPicker-item cesium-baseLayerPicker-selectedItem" title="1st Map">
        <img class="cesium-baseLayerPicker-itemIcon" src="assets/img/1st.png" />
        <div class="cesium-baseLayerPicker-itemLabel">1st Map</div>
      </div>
      <div class="cesium-baseLayerPicker-item" title="2nd Map">
        <img class="cesium-baseLayerPicker-itemIcon" src="assets/img/2nd.png" />
        <div class="cesium-baseLayerPicker-itemLabel">2nd Map</div>
      </div>
      <div class="cesium-baseLayerPicker-item" title="3rd Map">
        <img class="cesium-baseLayerPicker-itemIcon" src="assets/img/3rd.png" />
        <div class="cesium-baseLayerPicker-itemLabel">3rd Map</div>
      </div>
    </div>
  </div>
</div>
<div class="cesium-baseLayerPicker-sectionTitle">Terrain</div>
<div class="cesium-baseLayerPicker-section">
  <div class="cesium-baseLayerPicker-category">
    <div class="cesium-baseLayerPicker-categoryTitle"></div>
    <div class="cesium-baseLayerPicker-choices">
      <div class="cesium-baseLayerPicker-item cesium-baseLayerPicker-selectedItem" title="Default Terrain">
        <img class="cesium-baseLayerPicker-itemIcon" src="Cesium/Widgets/Images/TerrainProviders/Ellipsoid.png">
        <div class="cesium-baseLayerPicker-itemLabel">Terrain</div>
      </div>
    </div>
  </div>
</div> */}
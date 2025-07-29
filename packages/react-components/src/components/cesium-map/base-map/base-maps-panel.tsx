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

export const BaseMapsPanel: React.FC<BaseMapsPanelProps> = (props) => {
  const mapViewer: CesiumViewer = useCesiumMap();
  const { baseMaps } = props;
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

{/* <div class="cesium-baseLayerPicker-sectionTitle" data-bind="visible: imageryProviderViewModels.length > 0">Base Map</div>
<div class="cesium-baseLayerPicker-section" data-bind="foreach: _imageryProviders">
  <div class="cesium-baseLayerPicker-category">
    <div class="cesium-baseLayerPicker-categoryTitle" data-bind="text: name"></div>
    <div class="cesium-baseLayerPicker-choices" data-bind="foreach: providers">
      <div class="cesium-baseLayerPicker-item cesium-baseLayerPicker-selectedItem" data-bind="css: { &quot;cesium-baseLayerPicker-selectedItem&quot; : $data === $parents[1].selectedImagery },attr: { title: tooltip },visible: creationCommand.canExecute,click: function($data) { $parents[1].selectedImagery = $data; }" title="1st Map"><img class="cesium-baseLayerPicker-itemIcon" data-bind="attr: { src: iconUrl }" draggable="false" src="assets/img/1st.png"><div class="cesium-baseLayerPicker-itemLabel" data-bind="text: name">1st Map</div></div><div class="cesium-baseLayerPicker-item" data-bind="css: { &quot;cesium-baseLayerPicker-selectedItem&quot; : $data === $parents[1].selectedImagery },attr: { title: tooltip },visible: creationCommand.canExecute,click: function($data) { $parents[1].selectedImagery = $data; }" title="2nd Map"><img class="cesium-baseLayerPicker-itemIcon" data-bind="attr: { src: iconUrl }" draggable="false" src="assets/img/2nd.png"><div class="cesium-baseLayerPicker-itemLabel" data-bind="text: name">2nd Map</div></div><div class="cesium-baseLayerPicker-item" data-bind="css: { &quot;cesium-baseLayerPicker-selectedItem&quot; : $data === $parents[1].selectedImagery },attr: { title: tooltip },visible: creationCommand.canExecute,click: function($data) { $parents[1].selectedImagery = $data; }" title="3rd Map">
        <img class="cesium-baseLayerPicker-itemIcon" data-bind="attr: { src: iconUrl }" draggable="false" src="assets/img/3rd.png">
        <div class="cesium-baseLayerPicker-itemLabel" data-bind="text: name">3rd Map</div>
      </div>
    </div>
  </div>
</div>
<div class="cesium-baseLayerPicker-sectionTitle" data-bind="visible: terrainProviderViewModels.length > 0">Terrain</div>
<div class="cesium-baseLayerPicker-section" data-bind="foreach: _terrainProviders">
  <div class="cesium-baseLayerPicker-category">
    <div class="cesium-baseLayerPicker-categoryTitle" data-bind="text: name"></div>
    <div class="cesium-baseLayerPicker-choices" data-bind="foreach: providers">
      <div class="cesium-baseLayerPicker-item cesium-baseLayerPicker-selectedItem" data-bind="css: { &quot;cesium-baseLayerPicker-selectedItem&quot; : $data === $parents[1].selectedTerrain },attr: { title: tooltip },visible: creationCommand.canExecute,click: function($data) { $parents[1].selectedTerrain = $data; }" title="Default Terrain">
        <img class="cesium-baseLayerPicker-itemIcon" data-bind="attr: { src: iconUrl }" draggable="false" src="Cesium/Widgets/Images/TerrainProviders/Ellipsoid.png">
        <div class="cesium-baseLayerPicker-itemLabel" data-bind="text: name">Terrain</div>
      </div>
    </div>
  </div>
</div> */}
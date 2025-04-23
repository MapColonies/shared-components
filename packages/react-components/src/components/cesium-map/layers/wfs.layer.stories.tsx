import {
  Color as CesiumColor,
  Entity,
  GeoJsonDataSource,
  PolygonGraphics,
  PolylineGraphics,
  SceneMode
} from 'cesium';
import { Story, Meta } from '@storybook/react/types-6-0';
import { CesiumMap, CesiumViewer } from '../map';
import { LayerType } from '../layers-manager';
import { CesiumWFSLayer } from './wfs.layer';
import { Cesium3DTileset } from './3d.tileset';

export default {
  title: 'Cesium Map/Layers/WFSLayer',
  component: CesiumWFSLayer,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const mapDivStyle = {
  height: '100%',
  width: '100%',
  position: 'absolute' as const,
};

const BASE_MAPS = {
  maps: [
    {
      id: '1st',
      title: '1st Map Title',
      isCurrent: true,
      thumbnail: 'https://nsw.digitaltwin.terria.io/build/efa2f6c408eb790753a9b5fb2f3dc678.png',
      baseRasteLayers: [
        {
          id: 'GOOGLE_TERRAIN',
          type: 'XYZ_LAYER' as LayerType,
          opacity: 1,
          zIndex: 0,
          options: {
            url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            layers: '',
            credit: 'GOOGLE',
          },
        },
      ],
      baseVectorLayers: [],
    },
  ],
};

const DEBUG_PANEL = {
  wfs: {}
};


// #region buildings

const BRIGHT_GREEN = '#01FF1F';
const LIGHT_BLUE = '#24AEE9';

const optionsBuildings = {
  url: 'http://geoserver-vector-dev.apps.j1lk3njp.eastus.aroapp.io/geoserver/core/ows',
  featureType: 'buildings',
  style: {
    color: BRIGHT_GREEN,
    hover: LIGHT_BLUE,
  },
  pageSize: 300,
  zoomLevel: 14,
  maxCacheSize: 6000
};

const metaBuildings = {
  id: '1111111',
  keywords: 'buildings, osm',
  links: 'buildings,,WFS,http://geoserver-vector-dev.apps.j1lk3njp.eastus.aroapp.io/geoserver/core/ows',
  type: 'RECORD_VECTOR',
  classification: '5',
  productName: 'מבנים',
  description: 'Buildings layer',
  srsId: '4326',
  srsName: '4326',
  producerName: 'Moria',
  footprint: '{"type":"Polygon","coordinates":[[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]}',
  productType: 'VECTOR_BEST',
  featureStructure: {
    layerName: 'buildings',
    aliasLayerName: 'מבנים',
    fields: [
      {
        fieldName: 'OSM_ID',
        aliasFieldName: 'מזהה OSM',
        type: 'String'
      },
      {
        fieldName: 'ID',
        aliasFieldName: 'מזהה',
        type: 'String'
      },
      {
        fieldName: 'BUILDING_TYPE',
        aliasFieldName: 'סוג',
        type: 'String'
      },
      {
        fieldName: 'SENSITIVITY',
        aliasFieldName: 'רגישות',
        type: 'String'
      },
      {
        fieldName: 'ENTITY_ID',
        aliasFieldName: 'מזהה יישות',
        type: 'String'
      },
      {
        fieldName: 'IS_SENSITIVE',
        aliasFieldName: 'רגיש',
        type: 'Boolean'
      },
      {
        fieldName: 'DATE',
        aliasFieldName: 'תאריך',
        type: 'Date'
      }
    ]
  }
};

const handleVisualizationBuildings = (mapViewer: CesiumViewer, dataSource: GeoJsonDataSource): void => {
  const is3D = mapViewer.scene.mode === SceneMode.SCENE3D;
  dataSource?.entities.values.forEach((entity: Entity) => {
    if (entity.polygon) {
      entity.polygon = new PolygonGraphics({
        hierarchy: entity.polygon.hierarchy,
        material: is3D ? CesiumColor.fromCssColorString(BRIGHT_GREEN).withAlpha(0.5) : CesiumColor.TRANSPARENT, 
        outline: true,
        outlineColor: CesiumColor.fromCssColorString(BRIGHT_GREEN),
        outlineWidth: 2,
        height: is3D ? undefined : 10000 // Mount Everest peak reaches an elevation of approximately 8848.86 meters above sea level
      });
    }
    if (entity.polyline) {
      entity.polyline = new PolylineGraphics({
        positions: entity.polyline.positions,
        material: CesiumColor.fromCssColorString(BRIGHT_GREEN).withAlpha(0.5), 
        clampToGround: true,
        width: 2,
      });
    }
  });
};

// #endregion


// #region buildings_dates

const GREEN = '#00FF00';
const BLUE = '#0000FF';

const optionsBuildingsDates = {
  url: 'http://geoserver-vector-dev.apps.j1lk3njp.eastus.aroapp.io/geoserver/core/ows',
  featureType: 'buildings_dates',
  style: {
    color: GREEN,
    hover: BLUE
  },
  pageSize: 300,
  zoomLevel: 14,
  maxCacheSize: 6000,
  sortBy: 'year_day_numeric',
  shouldFilter: false
};

const metaBuildingsDates = {
  id: '7777777',
  keywords: 'buildings_dates, osm',
  links: 'buildings_dates,,WFS,http://geoserver-vector-dev.apps.j1lk3njp.eastus.aroapp.io/geoserver/core/ows',
  type: 'RECORD_VECTOR',
  classification: '5',
  productName: 'תאריכי מבנים',
  description: 'Buildings dates layer',
  srsId: '4326',
  srsName: '4326',
  producerName: 'Moria',
  footprint: '{"type":"Polygon","coordinates":[[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]}',
  productType: 'VECTOR_BEST',
  featureStructure: {
    layerName: 'buildings_dates',
    aliasLayerName: 'תאריכי מבנים',
    fields: [
      {
        fieldName: 'OSM_ID',
        aliasFieldName: 'מזהה OSM',
        type: 'String'
      },
      {
        fieldName: 'ID',
        aliasFieldName: 'מזהה',
        type: 'String'
      },
      {
        fieldName: 'BUILDING_TYPE',
        aliasFieldName: 'סוג',
        type: 'String'
      },
      {
        fieldName: 'SENSITIVITY',
        aliasFieldName: 'רגישות',
        type: 'String'
      },
      {
        fieldName: 'ENTITY_ID',
        aliasFieldName: 'מזהה יישות',
        type: 'String'
      },
      {
        fieldName: 'IS_SENSITIVE',
        aliasFieldName: 'רגיש',
        type: 'Boolean'
      },
      {
        fieldName: 'DATE',
        aliasFieldName: 'תאריך',
        type: 'Date'
      }
    ]
  }
};

const handleVisualizationBuildingsDates = (mapViewer: CesiumViewer, dataSource: GeoJsonDataSource): void => {
  const is3D = mapViewer.scene.mode === SceneMode.SCENE3D;
  dataSource?.entities.values.forEach((entity: Entity) => {
    if (entity.polygon) {
      entity.polygon = new PolygonGraphics({
        hierarchy: entity.polygon.hierarchy,
        material: is3D ? CesiumColor.fromCssColorString(GREEN).withAlpha(0.5) : CesiumColor.TRANSPARENT, 
        outline: true,
        outlineColor: CesiumColor.fromCssColorString(GREEN),
        outlineWidth: 2,
        height: is3D ? undefined : 10000 // Mount Everest peak reaches an elevation of approximately 8848.86 meters above sea level
      });
    }
    if (entity.polyline) {
      entity.polyline = new PolylineGraphics({
        positions: entity.polyline.positions,
        material: CesiumColor.fromCssColorString(GREEN).withAlpha(0.5), 
        clampToGround: true,
        width: 2,
      });
    }
  });
};

// #endregion


export const MapWithWFSLayer: Story = (args: Record<string, unknown>) => {
  return (
    <div style={mapDivStyle}>
      <CesiumMap {...args} sceneMode={SceneMode.SCENE2D}>
        <Cesium3DTileset isZoomTo={true} url="/mock/afula/tileset.json" />
        <CesiumWFSLayer key={metaBuildings.id} options={optionsBuildings} meta={metaBuildings} visualizationHandler={handleVisualizationBuildings} />
        {/* <CesiumWFSLayer key={'2222222'} options={optionsBuildings} meta={{...metaBuildings, id: '2222222'}} visualizationHandler={handleVisualizationBuildings} />
        <CesiumWFSLayer key={'3333333'} options={optionsBuildings} meta={{...metaBuildings, id: '3333333'}} visualizationHandler={handleVisualizationBuildings} />
        <CesiumWFSLayer key={'4444444'} options={optionsBuildings} meta={{...metaBuildings, id: '4444444'}} visualizationHandler={handleVisualizationBuildings} />
        <CesiumWFSLayer key={'5555555'} options={optionsBuildings} meta={{...metaBuildings, id: '5555555'}} visualizationHandler={handleVisualizationBuildings} />
        <CesiumWFSLayer key={'6666666'} options={optionsBuildings} meta={{...metaBuildings, id: '6666666'}} visualizationHandler={handleVisualizationBuildings} /> */}
        <CesiumWFSLayer key={metaBuildingsDates.id} options={optionsBuildingsDates} meta={metaBuildingsDates} visualizationHandler={handleVisualizationBuildingsDates} />
      </CesiumMap>
    </div>);
};

MapWithWFSLayer.argTypes = {
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
  zoom: {
    defaultValue: 17,
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
  debugPanel: {
    defaultValue: DEBUG_PANEL,
  },
};

MapWithWFSLayer.storyName = 'WFS layer';

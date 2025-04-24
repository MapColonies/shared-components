import { Color as CesiumColor, Entity, GeoJsonDataSource, PolygonGraphics, PolylineGraphics, SceneMode } from 'cesium';
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
  wfs: {},
};

const optionsBuildings = {
  url: 'http://geoserver-vector-dev.apps.j1lk3njp.eastus.aroapp.io/geoserver/core/ows',
  featureType: 'buildings',
  style: {
    color: '#01FF1F',
    hover: '#24AEE9',
  },
  pageSize: 300,
  zoomLevel: 14,
  maxCacheSize: 6000,
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
        type: 'String',
      },
      {
        fieldName: 'ID',
        aliasFieldName: 'מזהה',
        type: 'String',
      },
      {
        fieldName: 'BUILDING_TYPE',
        aliasFieldName: 'סוג',
        type: 'String',
      },
      {
        fieldName: 'SENSITIVITY',
        aliasFieldName: 'רגישות',
        type: 'String',
      },
      {
        fieldName: 'ENTITY_ID',
        aliasFieldName: 'מזהה יישות',
        type: 'String',
      },
      {
        fieldName: 'IS_SENSITIVE',
        aliasFieldName: 'רגיש',
        type: 'Boolean',
      },
      {
        fieldName: 'DATE',
        aliasFieldName: 'תאריך',
        type: 'Date',
      },
    ],
  },
};

/*const optionsBuildingsDates = {
  url: 'http://geoserver-vector-dev.apps.j1lk3njp.eastus.aroapp.io/geoserver/core/ows',
  featureType: 'buildings_dates',
  style: {
    color: '#00ff00',
    hover: '#0000ff'
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
};*/

const handleVisualization = (mapViewer: CesiumViewer, dataSource: GeoJsonDataSource): void => {
  const is3D = mapViewer.scene.mode === SceneMode.SCENE3D;
  dataSource?.entities.values.forEach((entity: Entity) => {
    if (entity.polygon) {
      entity.polygon = new PolygonGraphics({
        hierarchy: entity.polygon.hierarchy,
        material: is3D
          ? CesiumColor.fromCssColorString('#01FF1F').withAlpha(0.5)
          : CesiumColor.fromCssColorString('#01FF1F').withAlpha(0.2) /*CesiumColor.TRANSPARENT*/,
        outline: true,
        outlineColor: CesiumColor.fromCssColorString('#01FF1F'),
        outlineWidth: 3,
        height: is3D ? undefined : 11000,
        perPositionHeight: false,
      });
    }
    if (entity.polyline) {
      entity.polyline = new PolylineGraphics({
        positions: entity.polyline.positions,
        material: CesiumColor.fromCssColorString('#01FF1F').withAlpha(0.5),
        clampToGround: true,
        width: 4,
      });
    }
  });
};

export const MapWithWFSLayer: Story = (args: Record<string, unknown>) => {
  return (
    <div style={mapDivStyle}>
      <CesiumMap {...args} sceneMode={SceneMode.SCENE2D}>
        <Cesium3DTileset isZoomTo={true} url="/assets/models/afula/tileset.json" />
        <CesiumWFSLayer key={metaBuildings.id} options={optionsBuildings} meta={metaBuildings} visualizationHandler={handleVisualization} />
        {/* <CesiumWFSLayer key={'2222222'} options={optionsBuildings} meta={{...metaBuildings, id: '2222222'}} visualizationHandler={handleVisualization} />
        <CesiumWFSLayer key={'3333333'} options={optionsBuildings} meta={{...metaBuildings, id: '3333333'}} visualizationHandler={handleVisualization} />
        <CesiumWFSLayer key={'4444444'} options={optionsBuildings} meta={{...metaBuildings, id: '4444444'}} visualizationHandler={handleVisualization} />
        <CesiumWFSLayer key={'5555555'} options={optionsBuildings} meta={{...metaBuildings, id: '5555555'}} visualizationHandler={handleVisualization} />
        <CesiumWFSLayer key={'6666666'} options={optionsBuildings} meta={{...metaBuildings, id: '6666666'}} visualizationHandler={handleVisualization} />
        <CesiumWFSLayer key={metaBuildingsDates.id} options={optionsBuildingsDates} meta={metaBuildingsDates} visualizationHandler={handleVisualization} /> */}
      </CesiumMap>
    </div>
  );
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

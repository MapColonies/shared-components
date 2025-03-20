import { Color } from 'cesium';
import { Story, Meta } from '@storybook/react/types-6-0';
import { CesiumMap } from '../map';
import { LayerType } from '../layers-manager';
import { WFSInspectorTool } from '../tools/wfs-inspector.tool';
import { CesiumWFSLayer } from './wfs.layer';

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

const optionsBuildings = {
  url: 'http://geoserver-vector-dev.apps.j1lk3njp.eastus.aroapp.io/geoserver/core/ows',
  featureType: 'buildings',
  style: {
    stroke: Color.RED,
    fill: Color.RED.withAlpha(0.5),
    strokeWidth: 3,
    markerSymbol: '?'
  },
  pageSize: 300,
  zoomLevel: 14,
  maxCacheSize: 6000,
  sortBy: 'id',
  shouldFilter: true
};

const metaBuildings = {
  id: 'buildings',
  keywords: ['buildings', 'osm'],
  links: '',
  type: 'RECORD_VECTOR',
  classification: 'Top secret',
  productName: '',
  description: 'Buildings layer',
  srsId: '',
  srsName: '',
  producerName: 'Moria',
  footprint: '{"type":"Polygon","coordinates":[[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]}',
  productType: 'VECTOR_BEST',
  featureStructure: {
    layerName: 'buildings',
    aliasLayerName: 'מבנים',
    fields: [
      {
        fieldName: 'osm_id',
        aliasFieldName: 'מזהה OSM',
        type: 'string'
      },
      {
        fieldName: 'id',
        aliasFieldName: 'מזהה',
        type: 'string'
      },
      {
        fieldName: 'building_type',
        aliasFieldName: 'סוג',
        type: 'string'
      },
      {
        fieldName: 'sensitivity',
        aliasFieldName: 'רגישות',
        type: 'string'
      },
      {
        fieldName: 'entity_id',
        aliasFieldName: 'מזהה יישות',
        type: 'string'
      },
      {
        fieldName: 'is_sensitive',
        aliasFieldName: 'רגיש',
        type: 'boolean'
      },
      {
        fieldName: 'date',
        aliasFieldName: 'תאריך',
        type: 'date'
      }
    ]
  }
};

const optionsBuildingsDates = {
  url: 'http://geoserver-vector-dev.apps.j1lk3njp.eastus.aroapp.io/geoserver/core/ows',
  featureType: 'buildings_dates',
  style: {
    stroke: Color.GREEN,
    fill: Color.GREEN.withAlpha(0.5),
    strokeWidth: 3,
    markerSymbol: '?'
  },
  pageSize: 300,
  zoomLevel: 14,
  maxCacheSize: 6000,
  sortBy: 'year_day_numeric',
  shouldFilter: false
};

const metaBuildingsDates = {
  id: 'buildings_dates',
  keywords: ['buildings_dates', 'osm'],
  links: '',
  type: 'RECORD_VECTOR',
  classification: 'Top secret',
  productName: '',
  description: 'Buildings dates layer',
  srsId: '',
  srsName: '',
  producerName: 'Moria',
  footprint: '{"type":"Polygon","coordinates":[[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]}',
  productType: 'VECTOR_BEST',
  featureStructure: {
    layerName: 'buildings_dates',
    aliasLayerName: 'תאריכי מבנים',
    fields: [
      {
        fieldName: 'osm_id',
        aliasFieldName: 'מזהה OSM',
        type: 'string'
      },
      {
        fieldName: 'id',
        aliasFieldName: 'מזהה',
        type: 'string'
      },
      {
        fieldName: 'building_type',
        aliasFieldName: 'סוג',
        type: 'string'
      },
      {
        fieldName: 'sensitivity',
        aliasFieldName: 'רגישות',
        type: 'string'
      },
      {
        fieldName: 'entity_id',
        aliasFieldName: 'מזהה יישות',
        type: 'string'
      },
      {
        fieldName: 'is_sensitive',
        aliasFieldName: 'רגיש',
        type: 'boolean'
      },
      {
        fieldName: 'date',
        aliasFieldName: 'תאריך',
        type: 'date'
      }
    ]
  }
};

export const MapWithWFSLayer: Story = (args: Record<string, unknown>) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args}>
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      {/*<CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} />
      <CesiumWFSLayer options={optionsBuildings} meta={metaBuildings} /> */}
      {/* <CesiumWFSLayer options={optionsBuildingsDates} meta={metaBuildingsDates} /> */}
    </CesiumMap>
  </div>
);

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
};

MapWithWFSLayer.storyName = 'WFS layer';

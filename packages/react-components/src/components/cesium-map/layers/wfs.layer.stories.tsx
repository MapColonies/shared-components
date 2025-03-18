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
  meta: {
    layer_name: 'buildings',
    alias_layer_name: 'מבנים',
    fields: [
      {
        field_name: 'osm_id',
        alias_field_name: 'מזהה OSM',
        type: 'string'
      },
      {
        field_name: 'id',
        alias_field_name: 'מזהה',
        type: 'string'
      },
      {
        field_name: 'building_type',
        alias_field_name: 'סוג',
        type: 'string'
      },
      {
        field_name: 'sensitivity',
        alias_field_name: 'רגישות',
        type: 'string'
      },
      {
        field_name: 'entity_id',
        alias_field_name: 'מזהה יישות',
        type: 'string'
      },
      {
        field_name: 'is_sensitive',
        alias_field_name: 'רגיש',
        type: 'boolean'
      },
      {
        field_name: 'date',
        alias_field_name: 'תאריך',
        type: 'date'
      }
    ]
  },
  sortBy: 'id',
  shouldFilter: true
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
  meta: {
    layer_name: 'buildings_dates',
    alias_layer_name: 'תאריכי מבנים',
    fields: [
      {
        field_name: 'osm_id',
        alias_field_name: 'מזהה OSM',
        type: 'string'
      },
      {
        field_name: 'id',
        alias_field_name: 'מזהה',
        type: 'string'
      },
      {
        field_name: 'building_type',
        alias_field_name: 'סוג',
        type: 'string'
      },
      {
        field_name: 'sensitivity',
        alias_field_name: 'רגישות',
        type: 'string'
      },
      {
        field_name: 'entity_id',
        alias_field_name: 'מזהה יישות',
        type: 'string'
      },
      {
        field_name: 'is_sensitive',
        alias_field_name: 'רגיש',
        type: 'boolean'
      },
      {
        field_name: 'date',
        alias_field_name: 'תאריך',
        type: 'date'
      }
    ]
  },
  sortBy: 'year_day_numeric',
  shouldFilter: false
};

export const MapWithWFSLayer: Story = (args: Record<string, unknown>) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args}>
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      {/*<CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} />
      <CesiumWFSLayer options={optionsBuildings} /> */}
      {/* <CesiumWFSLayer options={optionsBuildingsDates} /> */}
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

import { Story, Meta } from '@storybook/react/types-6-0';
import { CesiumMap, CesiumMapProps } from './map';
import { CesiumSceneMode, LayerType, Proj } from '.';
import { getValue } from '../utils/config';
import { GeocoderPanelProps } from './geocoder/geocoder-panel';
import { ThemeProvider } from '@map-colonies/react-core';

export default {
  title: 'Cesium Map',
  component: CesiumMap,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const mapDivStyle = {
  height: '100%',
  width: '100%',
  position: 'absolute' as const,
};

export const BASE_MAPS = {
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

const GEOCODER_CONFIGS = [
  {
    baseUrl: getValue('GLOBAL', 'GEOCODING'),
    endPoint: '/search/location/query',
    method: 'GET',
    params: {
      dynamic: {
        queryText: 'query',
        geoContext: {
          name: 'geo_context',
          relatedParams: [['geo_context_mode', 'filter']],
        },
      },
      static: [
        ['limit', 6],
        ['disable_fuzziness', false],
      ],
    },
    title: 'מיקום',
    geometryIconClassName: 'customIcon',
  },
  {
    baseUrl: getValue('GLOBAL', 'GEOCODING'),
    endPoint: '/search/control/tiles',
    method: 'GET',
    params: {
      dynamic: {
        queryText: 'tile',
        geoContext: {
          name: 'geo_context',
          relatedParams: [['geo_context_mode', 'filter']],
        },
      },
      static: [
        ['limit', 6],
        ['disable_fuzziness', false],
      ],
    },
    title: 'אריחים (tiles)',
    geometryIconClassName: 'customIcon',
  },
  {
    baseUrl: getValue('GLOBAL', 'GEOCODING'),
    endPoint: '/search/control/items',
    method: 'GET',
    params: {
      dynamic: {
        queryText: 'command_name',
        geoContext: {
          name: 'geo_context',
          relatedParams: [['geo_context_mode', 'filter']],
        },
      },
      static: [
        ['limit', 6],
        ['disable_fuzziness', false],
      ],
    },
    geometryIconClassName: 'customIcon',
  },
  {
    baseUrl: getValue('GLOBAL', 'GEOCODING'),
    endPoint: '/search/control/routes',
    method: 'GET',
    params: {
      dynamic: {
        queryText: 'command_name',
        geoContext: {
          name: 'geo_context',
          relatedParams: [['geo_context_mode', 'filter']],
        },
      },
      // "geo_context": { "bbox": [-180, -90, 180, 90] },
    },
    geometryIconClassName: 'customIcon',
  },
] satisfies GeocoderPanelProps['configs'];

export const BaseMap: Story = (args: CesiumMapProps) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args}></CesiumMap>
  </div>
);

export const ZoomedMap: Story = (args: CesiumMapProps) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args}></CesiumMap>
  </div>
);

ZoomedMap.argTypes = {
  center: {
    defaultValue: [34.9578094, 32.8178637],
  },
  zoom: {
    defaultValue: 3,
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};

const cesiumTheme = {
  '--mdc-theme-on-surface': 'white',
  '--mdc-theme-primary': 'green',
  '--mdc-theme-error': 'blue',
};

export const GeocoderPanel: Story = (args: CesiumMapProps) => (
  <ThemeProvider options={cesiumTheme}>
    <div style={mapDivStyle}>
      <CesiumMap {...args}></CesiumMap>
    </div>
  </ThemeProvider>
);

GeocoderPanel.argTypes = {
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
  sceneMode: {
    defaultValue: CesiumSceneMode.SCENE2D,
  },
  projection: {
    defaultValue: Proj.WGS84,
    control: {
      type: 'radio',
      options: [Proj.WEB_MERCATOR, Proj.WGS84],
    },
  },
  zoom: {
    defaultValue: 3,
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
  geocoderPanel: {
    defaultValue: GEOCODER_CONFIGS,
  },
};
GeocoderPanel.storyName = 'Geocoder Panel';

export const MapWithProjection: Story = (args: CesiumMapProps) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args}></CesiumMap>
  </div>
);

MapWithProjection.argTypes = {
  center: {
    defaultValue: [34.9578094, 32.8178637],
  },
  projection: {
    defaultValue: Proj.WGS84,
    control: {
      type: 'radio',
      options: [Proj.WEB_MERCATOR, Proj.WGS84],
    },
  },
  zoom: {
    defaultValue: 3,
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};

export const Map2DWithProjection: Story = (args: CesiumMapProps) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args}></CesiumMap>
  </div>
);

Map2DWithProjection.argTypes = {
  center: {
    defaultValue: [34.9578094, 32.8178637],
  },
  sceneMode: {
    defaultValue: CesiumSceneMode.SCENE2D,
  },
  projection: {
    defaultValue: Proj.WGS84,
    control: {
      type: 'radio',
      options: [Proj.WEB_MERCATOR, Proj.WGS84],
    },
  },
  zoom: {
    defaultValue: 8,
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};
Map2DWithProjection.storyName = '2D Map With Projection';

export const LocalizedMap: Story = (args: CesiumMapProps) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args}></CesiumMap>
  </div>
);

LocalizedMap.argTypes = {
  center: {
    defaultValue: [34.9578094, 32.8178637],
  },
  locale: {
    /* eslint-disable @typescript-eslint/naming-convention */
    defaultValue: {
      METERS_UNIT: "מ'",
      KILOMETERS_UNIT: "קמ'",
      MAP_SETTINGS_DIALOG_TITLE: 'הגדרות מפה',
      MAP_SETTINGS_SCENE_MODE_TITLE: 'תצורה',
      MAP_SETTINGS_BASE_MAP_TITLE: 'מפות בסיס',
      MAP_SETTINGS_OK_BUTTON_TEXT: 'אישור',
      ZOOM_LABEL: 'זום',
      DEBUG_PANEL_TITLE: 'דיבאגר',
      SHOW_FEATURE_ON_MAP: "הראה פיצ'ר",
      IN_MAP_EXTENT: 'חיפוש בתחום המפה',
      SEARCH_PLACEHOLDER: 'חיפוש...',
      NO_RESULTS: 'אין תוצאות',
      WFS_TITLE: 'שכבות מידע',
      WFS_CACHE: 'בזכרון',
      WFS_EXTENT: 'בתצוגה',
    },
    /* eslint-enable @typescript-eslint/naming-convention */
  },
  projection: {
    defaultValue: Proj.WGS84,
    control: {
      type: 'radio',
      options: [Proj.WEB_MERCATOR, Proj.WGS84],
    },
  },
  zoom: {
    defaultValue: 3,
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
  geocoderPanel: {
    defaultValue: GEOCODER_CONFIGS,
  },
};
LocalizedMap.storyName = 'Localized Map (ctrl+F5)';

import { Feature } from 'geojson';
import { Story, Meta } from '@storybook/react/types-6-0';
import { ThemeProvider } from '@map-colonies/react-core';
import { getValue } from '../utils/config';
import { Proj } from '../utils/projections';
import { GeocoderOptions } from './geocoder/geocoder-panel';
import { BASE_MAPS, DEFAULT_TERRAIN_PROVIDER_URL, TERRAIN_COMBINED, TERRAIN_SRTM100 } from './helpers/constants';
import { CesiumMap, CesiumMapProps } from './map';
import { CesiumCesiumTerrainProvider, CesiumSceneMode } from './proxied.types';

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

const triggerCallbackFunc = (data: Feature, options: GeocoderOptions, i: number) => {
  const baseUrl = getValue('GEOCODER', 'CALLBACK_URL');

  const properties = data.properties;
  const requestId = properties?.headers['request_id'];

  if(!requestId) {
    console.warn('GEOCODING[FEEDBACK]: request_id header not propagated (pay attention on "Access-Control-Expose-Headers" response header of geocoding API\'s call)');
  }

  if (!baseUrl || !properties) return;

  const body = {
    request_id: requestId,
    chosen_result_id: i,
    user_id: 'catalog-app@mapcolonies.net'
  }

  const url = `${baseUrl}?token=${getValue('GLOBAL', 'TOKEN')}`;

  fetch(url, {
    method: 'POST',
    body: JSON.stringify(body)
  });
};

const GEOCODER_OPTIONS = [
  {
    baseUrl: getValue('GEOCODER', 'URL'),
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
        ['token', getValue('GLOBAL', 'TOKEN')],
      ],
    },
    title: 'Location',
    callbackFunc: (data, options, i) => { triggerCallbackFunc(data, options, i) }
  },
  {
    baseUrl: getValue('GEOCODER', 'URL'),
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
        ['token', getValue('GLOBAL', 'TOKEN')],
      ],
    },
    title: 'Control Tiles',
    callbackFunc: (data, options, i) => { triggerCallbackFunc(data, options, i) }
  },
  {
    baseUrl: getValue('GEOCODER', 'URL'),
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
        ['token', getValue('GLOBAL', 'TOKEN')],
      ],
    },
    title: 'Control Data',
    callbackFunc: (data, options, i) => { triggerCallbackFunc(data, options, i) }
  },
  {
    baseUrl: getValue('GEOCODER', 'URL'),
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
      static: [
        ['token', getValue('GLOBAL', 'TOKEN')],
      ]
      // "geo_context": { "bbox": [-180, -90, 180, 90] },
    },
    title: 'Control Routes',
    callbackFunc: (data, options, i) => { triggerCallbackFunc(data, options, i) }
  },
] satisfies GeocoderOptions[];

const LOCALIZED_GEOCODER_OPTIONS = [
  {
    baseUrl: getValue('GEOCODER', 'URL'),
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
        ['token', getValue('GLOBAL', 'TOKEN')],
      ],
    },
    title: 'מיקום',
    callbackFunc: (data, options, i) => { triggerCallbackFunc(data, options, i) }
  },
  {
    baseUrl: getValue('GEOCODER', 'URL'),
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
        ['token', getValue('GLOBAL', 'TOKEN')],
      ],
    },
    title: 'אריחי שליטה (נצ"א)',
    callbackFunc: (data, options, i) => { triggerCallbackFunc(data, options, i) }
  },
  {
    baseUrl: getValue('GEOCODER', 'URL'),
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
        ['token', getValue('GLOBAL', 'TOKEN')],
      ],
    },
    title: 'נתוני שליטה',
    callbackFunc: (data, options, i) => { triggerCallbackFunc(data, options, i) }
  },
  {
    baseUrl: getValue('GEOCODER', 'URL'),
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
      static: [
        ['token', getValue('GLOBAL', 'TOKEN')],
      ]
      // "geo_context": { "bbox": [-180, -90, 180, 90] },
    },
    title: 'צירי שליטה',
    callbackFunc: (data, options, i) => { triggerCallbackFunc(data, options, i) }
  },
] satisfies GeocoderOptions[];

export const BaseMap: Story = (args: CesiumMapProps) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args}></CesiumMap>
  </div>
);

BaseMap.argTypes = {
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
  terrains: {
    defaultValue: [{
      id: '1',
      url: DEFAULT_TERRAIN_PROVIDER_URL,
      title: 'Default Terrain',
      thumbnail: 'Cesium/Widgets/Images/TerrainProviders/Ellipsoid.png',
      isCurrent: true,
      terrainProvider: new CesiumCesiumTerrainProvider({ url: DEFAULT_TERRAIN_PROVIDER_URL })
    },{
      id: '2',
      url: TERRAIN_SRTM100,
      title: 'srtm100',
      thumbnail: 'Cesium/Widgets/Images/TerrainProviders/Ellipsoid.png',
      isCurrent: false,
      terrainProvider: new CesiumCesiumTerrainProvider({ url: TERRAIN_SRTM100 })
    },{
      id: '3',
      url: TERRAIN_COMBINED,
      title: 'combined_srtm_30_100_il_ever',
      thumbnail: 'Cesium/Widgets/Images/TerrainProviders/Ellipsoid.png',
      isCurrent: false,
      terrainProvider: new CesiumCesiumTerrainProvider({ url: TERRAIN_COMBINED })
    }],
  },
};

export const ZoomedMap: Story = (args: CesiumMapProps) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args}></CesiumMap>
  </div>
);

ZoomedMap.argTypes = {
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
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
  // '--mdc-theme-primary': '#24aee9',
  '--mdc-theme-on-surface': 'white',
  '--mdc-theme-gc-error-medium': '#FF3636',
  '--mdc-theme-gc-warning-high': '#FFA032',
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
    defaultValue: GEOCODER_OPTIONS,
  },
};
GeocoderPanel.storyName = 'Geocoder';

export const MapWithProjection: Story = (args: CesiumMapProps) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args}></CesiumMap>
  </div>
);

MapWithProjection.argTypes = {
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
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
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
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
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
  center: {
    defaultValue: [34.9578094, 32.8178637],
  },
  locale: {
    /* eslint-disable @typescript-eslint/naming-convention */
    defaultValue: {
      METERS_UNIT: "מ'",
      KILOMETERS_UNIT: "קמ'",
      ZOOM_LABEL: 'זום',
      DEBUG_PANEL_TITLE: 'דיבאגר',
      SHOW_FEATURE_ON_MAP: "הראה על המפה",
      IN_MAP_EXTENT: 'חיפוש בתיחום נוכחי',
      SEARCH_PLACEHOLDER: 'חיפוש...',
      NO_RESULTS: 'אין תוצאות',
      WFS_TITLE: 'שכבות מידע',
      WFS_CACHE: 'בזכרון',
      WFS_EXTENT: 'בתצוגה',
      NO_DATA_LAYERS: 'לא נמצאו שכבות',
      ACTIVE_LAYERS_TITLE: 'שכבות פעילות',
      IMAGERY: 'ראסטר',
      DATA: 'מידע',
      FLY_TO: 'הצג מיקום',
      REMOVE: 'הסר',
      BASE_MAP_TITLE: 'מפות בסיס',
      TERRAIN_TITLE: 'פני השטח',
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
    defaultValue: LOCALIZED_GEOCODER_OPTIONS,
  },
  showDebuggerTool: {
    defaultValue: true,
  },
};
LocalizedMap.storyName = 'Localized Map (ctrl+F5)';

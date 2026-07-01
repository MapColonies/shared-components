import { Feature } from 'geojson';
import React, { useState, useEffect } from 'react';
import type { StoryFn, Meta } from '@storybook/react';
import { ThemeProvider } from '@map-colonies/react-core';
import { getValue } from '../utils/config';
import { Proj } from '../utils/projections';
import { GeocoderOptions } from './geocoder/geocoder-panel';
import { BASE_MAPS, DEFAULT_TERRAIN_PROVIDER_URL, TERRAIN_COMBINED, TERRAIN_SRTM100 } from './helpers/constants';
import { CesiumMap, CesiumMapProps, ITerrain } from './map';
import { CesiumCesiumTerrainProvider, CesiumSceneMode } from './proxied.types';

const useTerrains = (): ITerrain[] | undefined => {
  const [terrains, setTerrains] = useState<ITerrain[] | undefined>(undefined);
  useEffect(() => {
    void Promise.all([
      CesiumCesiumTerrainProvider.fromUrl(DEFAULT_TERRAIN_PROVIDER_URL),
      CesiumCesiumTerrainProvider.fromUrl(TERRAIN_SRTM100),
      CesiumCesiumTerrainProvider.fromUrl(TERRAIN_COMBINED),
    ]).then(([p1, p2, p3]) => {
      setTerrains([
        {
          id: '1',
          url: DEFAULT_TERRAIN_PROVIDER_URL,
          title: 'Default Terrain',
          thumbnail: 'Cesium/Widgets/Images/TerrainProviders/Ellipsoid.png',
          isCurrent: true,
          terrainProvider: p1,
        },
        {
          id: '2',
          url: TERRAIN_SRTM100,
          title: 'srtm100',
          thumbnail: 'Cesium/Widgets/Images/TerrainProviders/Ellipsoid.png',
          isCurrent: false,
          terrainProvider: p2,
        },
        {
          id: '3',
          url: TERRAIN_COMBINED,
          title: 'combined_srtm_30_100_il_ever',
          thumbnail: 'Cesium/Widgets/Images/TerrainProviders/Ellipsoid.png',
          isCurrent: false,
          terrainProvider: p3,
        },
      ]);
    });
  }, []);
  return terrains;
};

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

const layerManagerMetaMapping = {
  layer: {
    id: 'id',
    name: 'layerRecord.productName',
  },
};

const triggerCallbackFunc = (data: Feature, options: GeocoderOptions, i: number) => {
  const baseUrl = getValue('GEOCODER', 'CALLBACK_URL');

  const properties = data.properties;
  const requestId = properties?.headers['request_id'];

  if (!requestId) {
    console.warn(
      'GEOCODING[FEEDBACK]: Missing request_id in response header. Ensure the "Access-Control-Expose-Headers" header includes "request_id".'
    );
  }

  if (!baseUrl || !properties) return;

  const body = {
    request_id: requestId,
    chosen_result_id: i,
    user_id: 'catalog-app@mapcolonies.net',
  };

  const url = `${baseUrl}?token=${getValue('GLOBAL', 'TOKEN')}`;

  fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
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
    callbackFunc: (data, options, i) => {
      triggerCallbackFunc(data, options, i);
    },
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
    callbackFunc: (data, options, i) => {
      triggerCallbackFunc(data, options, i);
    },
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
    callbackFunc: (data, options, i) => {
      triggerCallbackFunc(data, options, i);
    },
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
      static: [['token', getValue('GLOBAL', 'TOKEN')]],
      // "geo_context": { "bbox": [-180, -90, 180, 90] },
    },
    title: 'Control Routes',
    callbackFunc: (data, options, i) => {
      triggerCallbackFunc(data, options, i);
    },
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
    callbackFunc: (data, options, i) => {
      triggerCallbackFunc(data, options, i);
    },
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
    callbackFunc: (data, options, i) => {
      triggerCallbackFunc(data, options, i);
    },
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
    callbackFunc: (data, options, i) => {
      triggerCallbackFunc(data, options, i);
    },
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
      static: [['token', getValue('GLOBAL', 'TOKEN')]],
      // "geo_context": { "bbox": [-180, -90, 180, 90] },
    },
    title: 'צירי שליטה',
    callbackFunc: (data, options, i) => {
      triggerCallbackFunc(data, options, i);
    },
  },
] satisfies GeocoderOptions[];

export const BaseMap: StoryFn = (args: CesiumMapProps) => {
  const terrains = useTerrains();
  return (
    <div style={mapDivStyle}>
      <CesiumMap {...args} terrains={terrains} layerManagerMetaMapping={layerManagerMetaMapping}></CesiumMap>
    </div>
  );
};

BaseMap.args = {
  baseMaps: BASE_MAPS,
};

export const ZoomedMap: StoryFn = (args: CesiumMapProps) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args} layerManagerMetaMapping={layerManagerMetaMapping}></CesiumMap>
  </div>
);

ZoomedMap.args = {
  baseMaps: BASE_MAPS,
  center: [34.9578094, 32.8178637],
  zoom: 3,
};
ZoomedMap.argTypes = {
  zoom: {
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

export const GeocoderPanel: StoryFn = (args: CesiumMapProps) => (
  <ThemeProvider options={cesiumTheme}>
    <div style={mapDivStyle}>
      <CesiumMap {...args} layerManagerMetaMapping={layerManagerMetaMapping}></CesiumMap>
    </div>
  </ThemeProvider>
);

GeocoderPanel.args = {
  baseMaps: BASE_MAPS,
  sceneMode: CesiumSceneMode.SCENE2D,
  projection: Proj.WGS84,
  zoom: 3,
  geocoderPanel: GEOCODER_OPTIONS,
};
GeocoderPanel.argTypes = {
  projection: {
    control: {
      type: 'radio',
      options: [Proj.WEB_MERCATOR, Proj.WGS84],
    },
  },
  zoom: {
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};
GeocoderPanel.storyName = 'Geocoder';

export const MapWithProjection: StoryFn = (args: CesiumMapProps) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args} layerManagerMetaMapping={layerManagerMetaMapping}></CesiumMap>
  </div>
);

MapWithProjection.args = {
  baseMaps: BASE_MAPS,
  center: [34.9578094, 32.8178637],
  projection: Proj.WGS84,
  zoom: 3,
};
MapWithProjection.argTypes = {
  projection: {
    control: {
      type: 'radio',
      options: [Proj.WEB_MERCATOR, Proj.WGS84],
    },
  },
  zoom: {
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};

export const Map2DWithProjection: StoryFn = (args: CesiumMapProps) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args} layerManagerMetaMapping={layerManagerMetaMapping}></CesiumMap>
  </div>
);

Map2DWithProjection.args = {
  baseMaps: BASE_MAPS,
  center: [34.9578094, 32.8178637],
  sceneMode: CesiumSceneMode.SCENE2D,
  projection: Proj.WGS84,
  zoom: 8,
};
Map2DWithProjection.argTypes = {
  projection: {
    control: {
      type: 'radio',
      options: [Proj.WEB_MERCATOR, Proj.WGS84],
    },
  },
  zoom: {
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};
Map2DWithProjection.storyName = '2D Map With Projection';

export const LocalizedMap: StoryFn = (args: CesiumMapProps) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args} layerManagerMetaMapping={layerManagerMetaMapping}></CesiumMap>
  </div>
);

LocalizedMap.args = {
  baseMaps: BASE_MAPS,
  center: [34.9578094, 32.8178637],
  /* eslint-disable @typescript-eslint/naming-convention */
  locale: {
    METERS_UNIT: "מ'",
    KILOMETERS_UNIT: "קמ'",
    ZOOM_LABEL: 'זום',
    DEBUG_SECTION_DATA: 'מידע',
    DEBUG_SECTION_LAYERS: 'שכבות',
    DEBUG_SECTION_TOOLS: 'כלים',
    TILE_REQUESTS_OPTIMIZATION_CHECKBOX: 'אופטימיזצית בקשות אריחים',
    CESIUM_INSPECTOR_CHECKBOX: 'כלי בדיקה של סזיום',
    WITH_TRANSPARENCY_TOOLTIP: 'שכבה זו מכילה אריחים עם שקיפות',
    WITHOUT_TRANSPARENCY_TOOLTIP: 'שכבה זו מכילה אריחים ללא שקיפות',
    SHOW_FEATURE_ON_MAP: 'הראה על המפה',
    IN_MAP_EXTENT: 'חיפוש בתיחום נוכחי',
    SEARCH_PLACEHOLDER: 'חיפוש...',
    NO_RESULTS: 'אין תוצאות',
    WFS_TITLE: 'שכבות מידע',
    WFS_CACHE: 'בזכרון',
    WFS_EXTENT: 'בתצוגה',
    NO_DATA_LAYERS: 'לא נמצאו שכבות מידע בתצוגה',
    ACTIVE_LAYERS_TITLE: 'שכבות פעילות',
    IMAGERY: 'ראסטר',
    SERVICE: 'שירות',
    DATA: 'מידע',
    '3D': 'תלת-מימד',
    FLY_TO: 'הצג מיקום',
    REMOVE: 'הסר',
    BASE_MAP_TITLE: 'מפות בסיס',
    TERRAIN_TITLE: 'פני השטח',
  },
  /* eslint-enable @typescript-eslint/naming-convention */
  projection: Proj.WGS84,
  zoom: 3,
  geocoderPanel: LOCALIZED_GEOCODER_OPTIONS,
  showDebuggerTool: true,
};
LocalizedMap.argTypes = {
  projection: {
    control: {
      type: 'radio',
      options: [Proj.WEB_MERCATOR, Proj.WGS84],
    },
  },
  zoom: {
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};
LocalizedMap.storyName = 'Localized Map (ctrl+F5)';

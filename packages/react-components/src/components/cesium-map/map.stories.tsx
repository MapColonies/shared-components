import { Story, Meta } from '@storybook/react/types-6-0';
import { Proj } from '../utils/projections';
import { BASE_MAPS } from './helpers/constants';
import { CesiumMap, CesiumMapProps } from './map';
import { CesiumSceneMode } from './proxied.types';

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

export const BaseMap: Story = (args: CesiumMapProps) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args}></CesiumMap>
  </div>
);

BaseMap.argTypes = {
  baseMaps: {
    defaultValue: BASE_MAPS,
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
      MAP_SETTINGS_DIALOG_TITLE: 'הגדרות מפה',
      MAP_SETTINGS_SCENE_MODE_TITLE: 'תצורה',
      MAP_SETTINGS_BASE_MAP_TITLE: 'מפות בסיס',
      MAP_SETTINGS_TERRAIN_TITLE: 'פני השטח',
      // MAP_SETTINGS_OK_BUTTON_TEXT: 'אישור',
      ZOOM_LABEL: 'זום',
      DEBUG_PANEL_TITLE: 'דיבאגר',
      WFS_TITLE: 'שכבות מידע',
      WFS_CACHE: 'בזכרון',
      WFS_EXTENT: 'בתצוגה',
      ACTIVE_LAYERS_TITLE: 'שכבות פעילות',
      RASTER_SECTION: 'ראסטר',
      '3D_SECTION': 'תלת-מימד',
      DEM_SECTION: 'גבהים',
      VECTOR_SECTION: 'וקטור',
      NO_DATA_LAYERS: 'לא נמצאו שכבות',
      BASE_MAP_TITLE: 'מפות בסיס',
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
  debugPanel: {
    defaultValue: {
      wfs: {},
    },
  },
};
LocalizedMap.storyName = 'Localized Map (ctrl+F5)';

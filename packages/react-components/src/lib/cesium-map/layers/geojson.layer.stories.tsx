import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { action } from '@storybook/addon-actions';
import { Color } from 'cesium';
import { CesiumMap } from '../map';
import { CesiumGeojsonLayer } from './geojson.layer';

export default {
  title: 'Cesium Map/Layers/GeojsonLayer',
  component: CesiumGeojsonLayer,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const mapDivStyle = {
  height: '100%',
  width: '100%',
  position: 'absolute' as const,
};

const data = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Coors Field',
        amenity: 'Baseball Stadium',
        popupContent: 'This is where the Rockies play!',
      },
      geometry: {
        type: 'Point',
        coordinates: [-104.99404, 39.75621],
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [102.0, 0.0],
          [103.0, 1.0],
          [104.0, 0.0],
          [105.0, 1.0],
        ],
      },
      properties: {
        prop0: 'value0',
        prop1: 0.0,
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [34.6165466, 33.0270876],
            [34.6165466, 32.5896348],
            [35.568924, 32.5873207],
            [35.5373383, 33.0311173],
            [34.6165466, 33.0270876],
          ],
        ],
      },
      properties: {
        prop0: 'value0',
        prop1: { this: 'that' },
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [32.2558594, 32.8611323],
          [32.4975586, 30.1831218],
          [35.8813477, 30.4486737],
          [35.8154297, 33.0086635],
          [32.2558594, 32.8611323],
        ],
      },
    },
  ],
};

const onLoadAction = action('onLoad');

export const MapWithGeojsonLayer: Story = () => (
  <div style={mapDivStyle}>
    <CesiumMap>
      <CesiumGeojsonLayer
        data={data}
        markerColor={Color.RED}
        onLoad={(g): void => {
          // You can process the data source here
          g.entities.values[0].name = 'Coors Field! After update';

          // @ts-ignore
          g.entities.values[2].polygon.material = Color.TRANSPARENT; //Color.RED.withAlpha(0.4);
          // @ts-ignore
          g.entities.values[2].polygon.outlineColor = Color.LIGHTBLUE;
          // @ts-ignore
          g.entities.values[2].polygon.outlineWidth = 6.0;

          // /https://sandcastle.cesium.com/index.html?src=CZML%20Polyline.html&label=CZML
          // @ts-ignore
          g.entities.values[3].polyline.material = Color.LIGHTBLUE;
          // @ts-ignore
          g.entities.values[3].polyline.width = 6.0;
          onLoadAction(g);
        }}
        onError={action('onError')}
      />
    </CesiumMap>
  </div>
);
MapWithGeojsonLayer.storyName = 'GeoJson layer';

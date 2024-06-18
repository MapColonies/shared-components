import React from 'react';
import { Geometries } from '@turf/helpers';
import { Fill, Stroke, Style } from 'ol/style';
import { Vector } from 'ol/layer';
import { Proj } from '../../../utils/projections';
import { Map } from '../../map';
import { TileLayer, VectorLayer } from '../../layers';
import { Legend, LegendItem } from '../../legend';
import { GeoJSONFeature } from '../../feature';
import { TileOsm } from '..';
import { VectorSource } from '../vector-source';

export default {
  title: 'Map/Map Tiles/Legend',
  component: Legend,
  subcomponents: GeoJSONFeature,
  parameters: {
    layout: 'fullscreen',
  },
};

const geometries: Geometries[] = [
  {
    type: 'Polygon',
    coordinates: [
      [
        [3864197.52, 3750764.97],
        [3884682.65, 3750764.98],
        [3884682.65, 3766052.38],
        [3864197.53, 3766052.38],
        [3864197.52, 3750764.97],
      ],
    ],
  },
  {
    type: 'Polygon',
    coordinates: [
      [
        [3904403.4, 3765899.51],
        [3896912.58, 3758255.81],
        [3905779.27, 3743579.9],
        [3918162.07, 3755962.7],
        [3904403.4, 3765899.51],
      ],
    ],
  },
  {
    type: 'LineString',
    coordinates: [
      [3931767.86, 3763147.78],
      [3931003.49, 3724776.39],
    ],
  },
  {
    type: 'Point',
    coordinates: [3890186.12, 3734254.58],
  },
];

const mapDivStyle = {
  height: '100%',
  width: '100%',
  position: 'absolute' as const,
};

const LegendsArray: LegendItem[] = [
  {
    title: 'DEFAULT',
    // @ts-ignore
    style: new Vector().getStyleFunction()()[0],
  },
  {
    title: 'PP_PERIMETER',
    style: new Style({
      stroke: new Stroke({
        width: 4,
        color: '#000000',
      }),
    }),
  },
  {
    title: 'SOURCE_EXTENT',
    style: new Style({
      stroke: new Stroke({
        width: 4,
        color: '#7F00FF',
      }),
    }),
  },
  {
    title: 'EXISTING_PP',
    style: new Style({
      stroke: new Stroke({
        width: 2,
        color: '#00ff00',
      }),
    }),
  },
  {
    title: 'SELECTED',
    style: new Style({
      stroke: new Stroke({
        width: 2,
        color: '#ff0000',
      }),
      fill: new Fill({
        color: '#aa2727',
      }),
    }),
  },
];

export const Basic = (): JSX.Element => (
  <div style={mapDivStyle}>
    <Map projection={Proj.WEB_MERCATOR}>
      <TileLayer>
        <TileOsm />
      </TileLayer>
      <VectorLayer>
        <VectorSource>
          {geometries.map((geometry, index) => {
            let featStyle = index === 0 ? LegendsArray[4].style : undefined;
            return <GeoJSONFeature key={index} geometry={geometry} featureStyle={featStyle} />;
          })}
        </VectorSource>
      </VectorLayer>
      <Legend legendItems={LegendsArray} title={'legend text'} />
    </Map>
  </div>
);

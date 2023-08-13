import { Feature, Geometry, Polygon, Position } from 'geojson';
import React, { ComponentProps } from 'react';

import { GeoJsonDataSource as ResiumGeoJsonDataSource } from 'resium';

export interface RCesiumGeojsonLayerProps extends ComponentProps<typeof ResiumGeoJsonDataSource> {}

const PI_DEGREES = 180;
const DELTA = 0.0001;
const NEGATIVE = -1;

const getSign = (num: number) => Math.abs(num) / num;

const fixFootprint = (footprint: Geometry): void => {
  switch (footprint.type) {
    case 'Polygon':
      (footprint as Polygon).coordinates.forEach((tupleArray: Position[]): void => {
        tupleArray.forEach((tuple: Position): void => {
          if (Math.abs(tuple[0]) === PI_DEGREES / 2 && Math.abs(tuple[1]) === PI_DEGREES) {
            tuple[0] += NEGATIVE * getSign(tuple[0]) * DELTA; //-180 ==> -180 + 0.0001 = -179.9999;    //180 ==> 180 - 0.0001 = 179.9999;
            tuple[1] += NEGATIVE * getSign(tuple[1]) * DELTA; //-90 ==> -90 + 0.0001 = -89.9999;       //90 ==> 90 - 0.0001 = 89.9999;
          }
        });
      });
      break;
    default:
      // Decided not to fix other types, assuming in MultiPolygon we will not have -90 values
      break;
  }
};

export const CesiumGeojsonLayer: React.FC<RCesiumGeojsonLayerProps> = (props) => {
  const { data, ...rest } = props;

  data.features.forEach((feature: Feature) => {
    fixFootprint(feature.geometry);
  });

  return <ResiumGeoJsonDataSource data {...rest} />;
};

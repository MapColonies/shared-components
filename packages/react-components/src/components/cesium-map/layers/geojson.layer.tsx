import { Feature, Geometry, LineString, Polygon, Position } from 'geojson';
import React, { ComponentProps } from 'react';

import { GeoJsonDataSource as ResiumGeoJsonDataSource } from 'resium';

export interface RCesiumGeojsonLayerProps extends ComponentProps<typeof ResiumGeoJsonDataSource> {}

const PI_DEGREES = 180;
const DELTA = 0.001;
const NEGATIVE = -1;

const getSign = (num: number) => Math.abs(num) / num;
const fixTuple = (tuple: Position) => {
  if (Math.abs(tuple[0]) === PI_DEGREES) {
    tuple[0] += NEGATIVE * getSign(tuple[0]) * DELTA; //-180 ==> -180 + 0.0001 = -179.9999;    //180 ==> 180 - 0.0001 = 179.9999;
  }

  if(Math.abs(tuple[1]) === PI_DEGREES / 2) {
    tuple[1] += NEGATIVE * getSign(tuple[1]) * DELTA; //-90 ==> -90 + 0.0001 = -89.9999;       //90 ==> 90 - 0.0001 = 89.9999;
  }
};

const fixFootprint = (footprint: Geometry): void => {
  switch (footprint.type) {
    case 'LineString':
      (footprint as LineString).coordinates.forEach((tupleArray: Position): void => {
        fixTuple(tupleArray);
      });
      break;
    case 'Polygon':
      (footprint as Polygon).coordinates.forEach((tupleArray: Position[]): void => {
        tupleArray.forEach((tuple: Position): void => {
          fixTuple(tuple);
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

  if(data) {
    // For feature collections
    if(typeof data.features !== 'undefined') {
      data.features.forEach((feature: Feature) => {
        fixFootprint(feature.geometry);
      });
    } else {
      // For single geometry
      fixFootprint(data)
    }
  }

  return <ResiumGeoJsonDataSource data={data} {...rest} />;
};

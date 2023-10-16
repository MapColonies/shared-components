import { Feature, Geometry, LineString, Polygon, Position } from 'geojson';
import { cloneDeep } from 'lodash';
import React, { ComponentProps } from 'react';

import { GeoJsonDataSource as ResiumGeoJsonDataSource } from 'resium';

export interface RCesiumGeojsonLayerProps extends ComponentProps<typeof ResiumGeoJsonDataSource> {}

const PI_DEGREES = 180;
const DELTA = 0.001;

const getSign = (num: number) => Math.abs(num) / num;
const fixTuple = (tuple: Position) => {
  // (-)180 -> (-)179, (-)90 -> (-)89
  // In order to avoid dividing by zero when cesium perform all sorts of calculations when drawing.
  
  if (PI_DEGREES - Math.abs(tuple[0]) < DELTA) {
    tuple[0] = getSign(tuple[0]) * (PI_DEGREES - 1);
  }
  
  if((PI_DEGREES / 2) - Math.abs(tuple[1]) < DELTA) {
    tuple[1] = getSign(tuple[1]) * ((PI_DEGREES / 2) - 1);
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
  const dataCpy = cloneDeep(data);
  if(dataCpy) {
    // For feature collections
    if(typeof dataCpy.features !== 'undefined') {
      dataCpy.features.forEach((feature: Feature) => {
        fixFootprint(feature.geometry);
      });
    } else {
      // For single geometry
      fixFootprint(dataCpy);
    }
  }

  return <ResiumGeoJsonDataSource data={dataCpy} {...rest} />;
};

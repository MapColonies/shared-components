import React, { useLayoutEffect } from 'react';
import { Geometry } from 'geojson';
import { GeoJSON } from 'ol/format';
import { FitOptions } from 'ol/View';
import { useVectorSource } from './source/vector-source';
import { useMap } from './map';

export interface FeatureProps {
  geometry: Geometry;
  fitOptions?: FitOptions;
  fit?: boolean;
}

export const GeoJSONFeature: React.FC<FeatureProps> = ({ geometry, fitOptions, fit }) => {
  const source = useVectorSource();
  const map = useMap();

  useLayoutEffect(() => {
    const geoJSON = new GeoJSON();
    const feature = geoJSON.readFeature(geometry);

    if (fit) {
      source.on('addfeature', function () {
        map.getView().fit(source.getExtent(), fitOptions);
      });
    }

    source.addFeature(feature);

    return (): void => {
      source.removeFeature(feature);
    };
  }, [geometry, source, fit]);

  return null;
};

import React, { useLayoutEffect } from 'react';
import { Feature as GeoJSONFeatureObject, Geometry } from 'geojson';
import { GeoJSON } from 'ol/format';
import { FitOptions } from 'ol/View';
import { useVectorSource } from './source/vector-source';
import { useMap } from './map';
import { Style } from 'ol/style';

export interface FeatureProps {
  geometry: Geometry | GeoJSONFeatureObject;
  fitOptions?: FitOptions;
  fit?: boolean;
  featureStyle?: Style;
}

export const GeoJSONFeature: React.FC<FeatureProps> = ({ geometry, fitOptions, fit, featureStyle }) => {
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

    if (featureStyle) {
      feature.setStyle(featureStyle);
    }

    source.addFeature(feature);

    return (): void => {
      source.removeFeature(feature);
    };
  }, [geometry, source, fit]);

  return null;
};

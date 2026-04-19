import React, { useEffect, useState, createContext, useContext, PropsWithChildren } from 'react';
import { Vector } from 'ol/layer';
import { Options } from 'ol/layer/Base';
import { useMap } from '../map';

interface VectorLayerProps {
  options?: Options;
}

const vectorLayerContext = createContext<Vector<any> | null>(null);
const VectorLayerProvider = vectorLayerContext.Provider;

export const useVectorLayer = (): Vector<any> => {
  const layer = useContext(vectorLayerContext);

  if (layer === null) {
    throw new Error('vector layer context is null, please check the provider');
  }

  return layer;
};

export const VectorLayer: React.FC<PropsWithChildren<VectorLayerProps>> = ({ options, children }) => {
  const map = useMap();
  const [vectorLayer] = useState(new Vector(options));

  useEffect(() => {
    map.addLayer(vectorLayer);
    return (): void => {
      map.removeLayer(vectorLayer);
    };
  }, [map, vectorLayer]);

  return <VectorLayerProvider value={vectorLayer}>{children}</VectorLayerProvider>;
};

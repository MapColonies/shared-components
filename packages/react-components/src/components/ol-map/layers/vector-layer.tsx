import React, { useEffect, useState, createContext, useContext, PropsWithChildren } from 'react';
import { Vector } from 'ol/layer';
import { useMap } from '../map';

const vectorLayerContext = createContext<Vector<any> | null>(null);
const VectorLayerProvider = vectorLayerContext.Provider;

export const useVectorLayer = (): Vector<any> => {
  const layer = useContext(vectorLayerContext);

  if (layer === null) {
    throw new Error('vector layer context is null, please check the provider');
  }

  return layer;
};

export const VectorLayer: React.FC<PropsWithChildren> = ({ children }) => {
  const map = useMap();
  const [vectorLayer] = useState(new Vector());

  useEffect(() => {
    map.addLayer(vectorLayer);
    return (): void => {
      map.removeLayer(vectorLayer);
    };
  }, [map, vectorLayer]);

  return (
    <VectorLayerProvider value={vectorLayer}>{children}</VectorLayerProvider>
  );
};

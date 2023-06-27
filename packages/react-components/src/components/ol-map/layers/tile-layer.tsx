import React, { useEffect, useState, createContext, useContext, PropsWithChildren } from 'react';
import { Tile } from 'ol/layer';
import { Options } from 'ol/layer/Base';
import { useMap } from '../map';

const tileLayerContext = createContext<Tile<any> | null>(null);
const TileLayerProvider = tileLayerContext.Provider;

interface TileLayerProps {
  options?: Options;
}

export const useTileLayer = (): Tile<any> => {
  const layer = useContext(tileLayerContext);

  if (layer === null) {
    throw new Error('tile layer context is null, please check the provider');
  }

  return layer;
};

export const TileLayer: React.FC<PropsWithChildren<TileLayerProps>> = ({ options, children }) => {
  const map = useMap();
  const [tileLayer] = useState(new Tile(options));

  useEffect(() => {
    map.addLayer(tileLayer);

    return (): void => {
      map.removeLayer(tileLayer);
    };
  }, [map, tileLayer]);

  return <TileLayerProvider value={tileLayer}>{children}</TileLayerProvider>;
};

import React, { useEffect, useState, createContext, useContext, PropsWithChildren } from 'react';
import { Vector } from 'ol/layer';
import OlExtLegend from 'ol-ext/legend/Legend';
import OlExtLegendCtrl from 'ol-ext/control/Legend';
import { useMap } from '../map';

const legendContext = createContext<Vector<any> | null>(null);
const LegendProvider = legendContext.Provider;

export const useLegend = (): Vector<any> => {
  const legend = useContext(legendContext);

  if (legend === null) {
    throw new Error('legend context is null, please check the provider');
  }

  return legend;
};

export const Legend: React.FC<PropsWithChildren> = ({ children }) => {
  const map = useMap();
  // const [vectorLayer] = useState(new OlExtLegend());

  useEffect(() => {
    const legend = new OlExtLegend({
      title: 'Legend',
      margin: 5,
      maxWidth: 300,
    });
    const legendCtrl = new OlExtLegendCtrl({
      legend: legend,
      collapsed: false,
    });

    map.addControl(legendCtrl);
    return (): void => {
      map.removeControl(legendCtrl);
    };
  }, [map /*, vectorLayer*/]);

  // return <LegendProvider value={vectorLayer}>{children}</LegendProvider>;
  return <></>;
};

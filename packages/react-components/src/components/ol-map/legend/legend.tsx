import React, { useEffect } from 'react';
import { Style } from 'ol/style';
import OlExtLegend from 'ol-ext/legend/Legend';
import OlExtLegendCtrl from 'ol-ext/control/Legend';
import { useMap } from '../map';

import 'ol-ext/dist/ol-ext.css';

export interface LegendItem {
  title: string;
  style: Style;
}

export interface LegendParams {
  legendItems: LegendItem[];
  title?: string;
  isCollapsed?: boolean;
}

export const Legend: React.FC<LegendParams> = ({ legendItems, title, isCollapsed }) => {
  const map = useMap();

  useEffect(() => {
    const legend = new OlExtLegend({
      title: title ?? '',
      margin: 5,
      maxWidth: 300,
    });

    const legendCtrl = new OlExtLegendCtrl({
      legend: legend,
      collapsed: isCollapsed === undefined ? true : isCollapsed,
    });

    map.addControl(legendCtrl);

    const vectorLegend = new OlExtLegend({ margin: 4 });
    legendItems.forEach((legendItem) => {
      vectorLegend.addItem({
        title: legendItem.title,
        style: legendItem.style,
        typeGeom: 'Polygon',
      });
    });
    // **** Generic way to present legend by feature geometry style
    // vectorLegend.addItem({
    //   title: 'DUMMY',
    //   feature: (map.getLayers().getArray()[1] as any).getSource().getFeatures()[0],
    // });

    // @ts-ignore
    legend.addItem(vectorLegend);

    return (): void => {
      map.removeControl(legendCtrl);
    };
  }, [map, legendItems, title, isCollapsed]);

  return <></>;
};

import React, { useCallback } from 'react';
import { Box } from '../../box';
import { IMapLegend, LegendItem } from './legend-item';

import './legend.css';

interface LegendListProps {
  legends: IMapLegend[];
  actionsTexts: {
    docText: string;
    imgText: string;
  };
  noLegendsText: string;
}

export const LegendList: React.FC<LegendListProps> = ({ legends, actionsTexts: { docText, imgText }, noLegendsText }) => {
  const handleNoLegends = useCallback(() => {
    return (
      <Box className="noLegendsContainer">
        <h2 className="noLegendsMsg">{noLegendsText}</h2>
      </Box>
    );
  }, [noLegendsText]);

  const renderList = useCallback(() => {
    if (!legends.length) {
      return handleNoLegends();
    }

    return legends.map((legend, i) => {
      return <LegendItem key={`${legend.layer as string}_${i}`} legend={legend} docText={docText} imgText={imgText} />;
    });
  }, [legends]);

  return <Box className="mapLegendsList">{renderList()}</Box>;
};

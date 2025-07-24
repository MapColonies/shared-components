import React from 'react';
import { Box } from '../../box';

interface ICesiumToolTitleProps {
  title: string;
}

export const CesiumToolTitle: React.FC<ICesiumToolTitleProps> = ({ title }) => {
  return <Box className="cesium-mcMixin-title">{title}</Box>;
};

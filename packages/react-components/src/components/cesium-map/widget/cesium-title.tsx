import React from 'react';
import { Box } from '../../box';

interface ICesiumTitleProps {
  title: string;
}

export const CesiumTitle: React.FC<ICesiumTitleProps> = ({ title }) => {
  return <Box className="cesium-mcMixin-title">{title}</Box>;
};

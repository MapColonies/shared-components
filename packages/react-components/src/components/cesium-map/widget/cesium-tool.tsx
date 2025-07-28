import React from 'react';
import { Box } from '../../box';
import { CesiumTitle } from './cesium-title';

interface ICesiumToolProps {
  isVisible: boolean;
  title: string;
  children: React.ReactNode;
}

export const CesiumTool: React.FC<ICesiumToolProps> = ({ isVisible, title, children }) => {
  return (
    <Box className={`cesium-mcMixin-tool ${isVisible ? 'cesium-mcMixin-tool-visible' : ''}`}>
      <CesiumTitle title={title} />
      <Box>{children}</Box>
    </Box>
  );
};

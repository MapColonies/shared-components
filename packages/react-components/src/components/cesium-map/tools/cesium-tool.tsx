import React from 'react';
import { Box } from '../../box';
import { CesiumToolTitle } from './cesium-tool-title';

interface ICesiumToolProps {
  isVisible: boolean;
  title: string;
  children: React.ReactNode;
}

export const CesiumTool: React.FC<ICesiumToolProps> = ({ isVisible, title, children }) => {
  return (
    <Box className={`cesium-mcMixin-tool ${isVisible ? 'cesium-mcMixin-tool-visible' : ''}`}>
      <CesiumToolTitle title={title} />
      <Box>{children}</Box>
    </Box>
  );
};

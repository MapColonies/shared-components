import React from 'react';
import { Box } from '../../box';
import { CesiumTitle } from './cesium-title';

interface ICesiumToolProps {
  isVisible: boolean;
  children: React.ReactNode;
  title?: string;
}

export const CesiumTool: React.FC<ICesiumToolProps> = ({ isVisible, children, title }) => {
  return (
    <Box className={`cesium-mc-tool ${isVisible ? 'cesium-mc-tool-visible' : ''}`}>
      {title && <CesiumTitle title={title} />}
      <Box>{children}</Box>
    </Box>
  );
};

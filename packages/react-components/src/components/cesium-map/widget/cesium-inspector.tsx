import React from 'react';
import { Box } from '../../box';
import { CesiumButton } from './cesium-button';

interface ICesiumInspectorProps {
  title: string;
  isVisible: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const CesiumInspector: React.FC<ICesiumInspectorProps> = ({ title, isVisible, onClick, children }) => {
  return (
    <Box className={`cesium-cesiumInspector ${isVisible ? 'cesium-cesiumInspector-visible' : ''}`}>
      <CesiumButton title={title} onClick={onClick} />
      {
        isVisible &&
        <Box className={`cesium-cesiumInspector-dropDown`}>
          {children}
        </Box>
      }
    </Box>
  );
};

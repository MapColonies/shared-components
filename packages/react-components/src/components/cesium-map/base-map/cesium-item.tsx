import React from 'react';
import { Box } from '../../box';
import { IBaseMap, ITerrain } from '../map';
import { BaseMapThumbnail } from './base-map-thumbnail';

interface CesiumItemProps {
  item: IBaseMap | ITerrain;
  isSelected: boolean;
  onClick: () => void;
  fallbackColor: string;
}

export const CesiumItem: React.FC<CesiumItemProps> = ({ item, isSelected, onClick, fallbackColor }) => {
  return (
    <Box
      className={`cesium-baseLayerPicker-item ${isSelected ? 'cesium-baseLayerPicker-selectedItem' : ''}`}
      title={item.title}
      onClick={onClick}
    >
      <BaseMapThumbnail
        className="cesium-baseLayerPicker-itemIcon"
        src={item.thumbnail}
        alt={item.title ?? ''}
        fallbackColor={fallbackColor}
      />
      <Box className="cesium-baseLayerPicker-itemLabel">{item.title}</Box>
    </Box>
  );
};

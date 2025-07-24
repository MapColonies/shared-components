import React from 'react';
import { CesiumToolIcon } from '../tools/cesium-tool-icon';

export interface ILegendWidgetProps {
  legendToggle: () => void;
}

export const LegendWidget: React.FC<ILegendWidgetProps> = ({ legendToggle }) => {
  return (
    <>
      <CesiumToolIcon onClick={legendToggle}>
        <svg height="100%" width="100%" viewBox="-45 -45 650 650">
        <path d="M322.4,173.9l-129,16.2l-4.6,21.4l25.3,4.7c16.5,3.9,19.8,9.9,16.2,26.4l-41.5,195.3c-10.9,50.5,5.9,74.3,45.5,74.3
          c30.7,0,66.3-14.2,82.5-33.6l4.9-23.4c-11.3,9.9-27.7,13.9-38.6,13.9c-15.5,0-21.1-10.9-17.1-30L322.4,173.9z"></path>
        <circle cx="270.1" cy="56.3" r="56.3"></circle>
        </svg>
      </CesiumToolIcon>
    </>
  );
};

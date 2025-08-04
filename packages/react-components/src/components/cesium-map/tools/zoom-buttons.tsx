import React from 'react';
import { Icon } from '@map-colonies/react-core';
import { useCesiumMap } from '../map';

import './zoom-buttons.css';

export const ZoomButtons: React.FC = () => {
  const viewer = useCesiumMap();

  const buttons: { onClick: () => void; iconPath: string }[] = [
    { onClick: () => viewer.camera.zoomIn(), iconPath: 'M48 20h-18v-18h-10v18h-18v10h18v18h10v-18h18z' },
    { onClick: () => viewer.camera.zoomOut(), iconPath: 'M2 20h46v10h-46z' },
  ];

  return (
    <div className="zoomButtons">
      {
        buttons.map((button: { onClick: () => void; iconPath: string }, index) => (
        <Icon
          key={index}
          icon={
            <div className="zoomButton">
              <svg
                fill="var(--mdc-theme-cesium-color)"
                width="12px"
                height="12px"
                viewBox="0 -20 50 50"
                version="1.2"
                baseProfile="tiny"
                xmlns="http://www.w3.org/2000/svg"
                overflow="inherit"
              >
                <path d={button.iconPath} />
              </svg>
            </div>
          }
          onClick={button.onClick}
        />
        ))
      }
    </div>
  );
};
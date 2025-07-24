import React from 'react';

interface ICesiumToolIconProps {
  onClick: () => void;
  children: React.ReactNode;
}

export const CesiumToolIcon: React.FC<ICesiumToolIconProps> = ({ onClick, children }) => {
  return (
    <div className="cesium-toolbar-button cesium-button" onClick={onClick}>
      {children}
    </div>
  );
};

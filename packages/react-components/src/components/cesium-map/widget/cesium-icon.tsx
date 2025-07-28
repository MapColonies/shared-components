import React from 'react';

interface ICesiumIconProps {
  onClick: () => void;
  children: React.ReactNode;
}

export const CesiumIcon: React.FC<ICesiumIconProps> = ({ onClick, children }) => {
  return (
    <div className="cesium-toolbar-button cesium-button" onClick={onClick}>
      {children}
    </div>
  );
};

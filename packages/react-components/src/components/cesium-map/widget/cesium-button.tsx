import React from 'react';

interface ICesiumButtonProps {
  title: string;
  onClick: () => void;
}

export const CesiumButton: React.FC<ICesiumButtonProps> = ({ title, onClick }) => {
  return (
    <div className="cesium-cesiumInspector-button" onClick={onClick}>
      {title}
    </div>
  );
};

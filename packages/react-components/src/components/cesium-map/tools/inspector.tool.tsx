import React, { useEffect } from 'react';
import { viewerCesiumInspectorMixin } from 'cesium';
import { CesiumViewer, useCesiumMap } from '../map';

export const InspectorTool: React.FC = () => {
  const mapViewer: CesiumViewer = useCesiumMap();

  useEffect(() => {
    mapViewer.extend(viewerCesiumInspectorMixin);
  }, [mapViewer]);

  return null;
};

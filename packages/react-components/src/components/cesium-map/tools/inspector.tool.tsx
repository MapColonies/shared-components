import React, { useEffect } from 'react';
import { viewerCesiumInspectorMixin } from 'cesium';
import { CesiumViewer, useCesiumMap } from '../map';

interface ICesiumInspectorInstance {
  container?: HTMLElement;
}

export const InspectorTool: React.FC = () => {
  const mapViewer: CesiumViewer = useCesiumMap();

  useEffect(() => {
    const viewer = mapViewer as CesiumViewer & { cesiumInspector?: ICesiumInspectorInstance };
    const widgetContainer = document.querySelector('.cesium-viewer-cesiumInspectorWrapper');

    if (viewer.cesiumInspector === undefined) {
      mapViewer.extend(viewerCesiumInspectorMixin);
    }

    if (viewer.cesiumInspector?.container) {
      if (widgetContainer && viewer.cesiumInspector.container.parentElement !== widgetContainer) {
        widgetContainer.appendChild(viewer.cesiumInspector.container);
      }
      viewer.cesiumInspector.container.style.display = '';
      viewer.cesiumInspector.container.style.top = '0';
      viewer.cesiumInspector.container.style.position = 'relative';
    }

    return () => {
      if (viewer.cesiumInspector?.container) {
        viewer.cesiumInspector.container.style.display = 'none';
      }
    };
  }, [mapViewer]);

  return null;
};

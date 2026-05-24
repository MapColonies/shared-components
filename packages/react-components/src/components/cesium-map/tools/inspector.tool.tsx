import React, { useEffect } from 'react';
import { viewerCesiumInspectorMixin } from 'cesium';
import { Box } from '../../box';
import { CesiumViewer, useCesiumMap } from '../map';

interface ICesiumInspectorInstance {
  container?: HTMLElement;
}

type CesiumViewerWithInspector = CesiumViewer & {
  cesiumInspector?: ICesiumInspectorInstance;
};

const INSPECTOR_WRAPPER_SELECTOR = '.cesium-viewer-cesiumInspectorWrapper';

const applyInspectorContainerStyles = (container: HTMLElement): void => {
  container.style.display = '';
  container.style.top = '0';
  container.style.position = 'relative';
};

export const InspectorTool: React.FC = () => {
  const mapViewer: CesiumViewer = useCesiumMap();

  useEffect(() => {
    const viewer = mapViewer as CesiumViewerWithInspector;
    const wrapper = document.querySelector(INSPECTOR_WRAPPER_SELECTOR);

    if (viewer.cesiumInspector === undefined) {
      mapViewer.extend(viewerCesiumInspectorMixin);
    }

    const inspectorContainer = viewer.cesiumInspector?.container;

    if (inspectorContainer) {
      if (wrapper && inspectorContainer.parentElement !== wrapper) {
        wrapper.appendChild(inspectorContainer);
      }

      applyInspectorContainerStyles(inspectorContainer);
    }

    return () => {
      if (inspectorContainer) {
        inspectorContainer.style.display = 'none';
      }
    };
  }, [mapViewer]);

  return <Box className="cesium-viewer-cesiumInspectorWrapper" />;
};

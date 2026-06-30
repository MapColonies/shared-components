import React, { useEffect } from 'react';
import { viewerCesiumInspectorMixin, TileCoordinatesImageryProvider } from 'cesium';
import { Box } from '../../box';
import { CesiumViewer, useCesiumMap } from '../map';
import { getImageryProvider, getImageryProviderName } from '../layers-manager';

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

const keepTileCoordinatesLayerOnTop = (viewer: CesiumViewer): void => {
  const layerList = viewer.layersManager?.layerList;
  const tileCoordinatesLayer = layerList?.find((layer) => {
    const provider = getImageryProvider(layer);
    return provider instanceof TileCoordinatesImageryProvider || getImageryProviderName(provider) === 'TileCoordinatesImageryProvider';
  });
  if (tileCoordinatesLayer === undefined) {
    return;
  }
  const topLayer = layerList?.[layerList.length - 1];
  if (topLayer !== tileCoordinatesLayer) {
    viewer.imageryLayers.raiseToTop(tileCoordinatesLayer);
  }
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

    const refreshTileCoordinatesOrder = (): void => {
      keepTileCoordinatesLayerOnTop(mapViewer);
    };

    const removeLayerAdded = mapViewer.imageryLayers.layerAdded.addEventListener(refreshTileCoordinatesOrder);
    const removeLayerMoved = mapViewer.imageryLayers.layerMoved.addEventListener(refreshTileCoordinatesOrder);
    const removeLayerRemoved = mapViewer.imageryLayers.layerRemoved.addEventListener(refreshTileCoordinatesOrder);

    setTimeout(refreshTileCoordinatesOrder, 0);

    return () => {
      removeLayerAdded();
      removeLayerMoved();
      removeLayerRemoved();
      if (inspectorContainer) {
        inspectorContainer.style.display = 'none';
      }
    };
  }, [mapViewer]);

  return <Box className="cesium-viewer-cesiumInspectorWrapper" />;
};

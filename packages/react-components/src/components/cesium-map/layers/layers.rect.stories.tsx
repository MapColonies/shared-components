import { Rectangle } from 'cesium';
import React, { useLayoutEffect } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import bbox from '@turf/bbox';
import { BASE_MAPS } from '../helpers/constants';
import { IRasterLayer, LayerType } from '../layers-manager';
import { CesiumMap, CesiumMapProps, useCesiumMap } from '../map';
import { CesiumXYZLayer } from './xyz.layer';

export default {
  title: 'Cesium Map/Layers/LayersRect',
  component: CesiumMap,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const mapDivStyle = {
  height: '90%',
  width: '100%',
  position: 'absolute' as const,
};

const mapViewProps: CesiumMapProps = {
  center: [34.811, 31.908],
  zoom: 14,
  imageryProvider: false,
  baseMaps: BASE_MAPS,
};

const optionsRectXYZ = {
  url: 'https://tiles.openaerialmap.org/5a831b4a2553e6000ce5ac80/0/d02ddc76-9c2e-4994-97d4-a623eb371456/{z}/{x}/{y}.png',
  footprint: {
    type: 'Polygon',
    coordinates: [
      [
        [34.8043847068541, 31.9023297972932],
        [34.8142791322292, 31.9023297972932],
        [34.8142791322292, 31.9108796531516],
        [34.8043847068541, 31.9108796531516],
        [34.8043847068541, 31.9023297972932],
      ],
    ],
  },
};

// Use Turf.js/bbox to calculate the bounding box from the supplied footprint.

const childLayerRect = Rectangle.fromDegrees(...bbox(optionsRectXYZ.footprint));

export const MapWithXYZLayersAndRect: Story = () => (
  <div style={mapDivStyle}>
    <CesiumMap {...mapViewProps}>
      <CesiumXYZLayer rectangle={childLayerRect} options={optionsRectXYZ} />
    </CesiumMap>
  </div>
);

MapWithXYZLayersAndRect.storyName = 'XYZ child layer with rect';

export const MapWithSettings: Story = () => {
  const layer = {
    id: '2_raster_ext',
    type: 'XYZ_LAYER' as LayerType,
    opacity: 1,
    zIndex: 0,
    show: true,
    options: {
      url: 'https://tiles.openaerialmap.org/5a9f90c42553e6000ce5ad6c/0/eee1a570-128e-4947-9ffa-1e69c1efab7c/{z}/{x}/{y}.png',
    },
  };

  return (
    <div style={mapDivStyle}>
      <CesiumMap {...mapViewProps}>
        <LayerViewer layer={layer as IRasterLayer} />
      </CesiumMap>
    </div>
  );
};
MapWithSettings.storyName = 'Layer manager rect';

interface ILayerViewerProps {
  layer: IRasterLayer;
}

const LayerViewer: React.FC<ILayerViewerProps> = (props) => {
  const mapViewer = useCesiumMap();
  const { layer } = props;

  // For testing the exposure of current zoom level on map viewer
  setInterval(() => {
    console.log('######################### Zoom level: ', mapViewer.currentZoomLevel);
  }, 2000);

  // Mockin footprint data on layer meta
  const layerFootprint = {
    type: 'Polygon',
    coordinates: [
      [
        [34.8099445223518, 31.9061345394902],
        [34.8200994167574, 31.9061345394902],
        [34.8200994167574, 31.9106311613979],
        [34.8099445223518, 31.9106311613979],
        [34.8099445223518, 31.9061345394902],
      ],
    ],
  };

  useLayoutEffect(() => {
    const layerManagerRect = Rectangle.fromDegrees(...bbox(layerFootprint));

    layer.options.rectangle = layerManagerRect;

    mapViewer.layersManager?.addRasterLayer(layer, 0, '');
  }, [mapViewer, layerFootprint, layer]);

  return <></>;
};

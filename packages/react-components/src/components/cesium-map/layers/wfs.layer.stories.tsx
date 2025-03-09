import { Story, Meta } from '@storybook/react/types-6-0';
import { CesiumMap } from '../map';
import { LayerType } from '../layers-manager';
import { CesiumWFSLayer } from './wfs.layer';

export default {
  title: 'Cesium Map/Layers/WFSLayer',
  component: CesiumWFSLayer,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const mapDivStyle = {
  height: '100%',
  width: '100%',
  position: 'absolute' as const,
};

const BASE_MAPS = {
  maps: [
    {
      id: '1st',
      title: '1st Map Title',
      isCurrent: true,
      thumbnail: 'https://nsw.digitaltwin.terria.io/build/efa2f6c408eb790753a9b5fb2f3dc678.png',
      baseRasteLayers: [
        {
          id: 'GOOGLE_TERRAIN',
          type: 'XYZ_LAYER' as LayerType,
          opacity: 1,
          zIndex: 0,
          options: {
            url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            layers: '',
            credit: 'GOOGLE',
          },
        },
      ],
      baseVectorLayers: [],
    },
  ],
};

export const MapWithWFSLayer: Story = (args: Record<string, unknown>) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args}>
      <CesiumWFSLayer />
    </CesiumMap>
  </div>
);

MapWithWFSLayer.argTypes = {
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
  zoom: {
    defaultValue: 17,
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};

MapWithWFSLayer.storyName = 'WFS layer';

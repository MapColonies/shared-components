import { Story, Meta } from '@storybook/react/types-6-0';
import { ImageryLayer } from 'cesium';
import { BASE_MAPS } from '../helpers/constants';
import { getImageryProviderUrl } from '../layers-manager';
import { CesiumMap } from '../map';
import { CesiumXYZLayer } from './xyz.layer';

export default {
  title: 'Cesium Map/Layers/XYZLayer',
  component: CesiumXYZLayer,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const mapDivStyle = {
  height: '100%',
  width: '100%',
  position: 'absolute' as const,
};

const layerManagerMetaMapping = {
  layer: {
    id: 'id',
    name: 'layerRecord.productName',
  },
};

const optionsXYZ = {
  url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
};

const optionsXYZ2 = {
  url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=0e6fc415256d4fbb9b5166a718591d71',
};

const xyzLayerMeta = {
  id: 'xyz-layer',
  layerRecord: {
    productName: 'XYZ Layer',
  },
  options: { ...optionsXYZ },
  searchLayerPredicate: (layer: ImageryLayer): boolean => getImageryProviderUrl(layer) === optionsXYZ.url,
};

const xyzLayerMeta2 = {
  id: 'xyz-layer-2',
  layerRecord: {
    productName: 'XYZ Layer 2',
  },
  options: { ...optionsXYZ2 },
  searchLayerPredicate: (layer: ImageryLayer): boolean => getImageryProviderUrl(layer) === optionsXYZ2.url,
};

export const MapWithXYZLayers: Story = () => (
  <div style={mapDivStyle}>
    <CesiumMap
      imageryProvider={false}
      baseMaps={BASE_MAPS}
      layerManagerMetaMapping={layerManagerMetaMapping}
    >
      <CesiumXYZLayer options={optionsXYZ} meta={xyzLayerMeta} />
      <CesiumXYZLayer options={optionsXYZ2} alpha={0.5} meta={xyzLayerMeta2} />
    </CesiumMap>
  </div>
);
MapWithXYZLayers.storyName = 'XYZ 2 layers';

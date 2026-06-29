import { Story, Meta } from '@storybook/react/types-6-0';
import { ImageryLayer } from 'cesium';
import { BASE_MAPS } from '../helpers/constants';
import { getImageryProvider } from '../layers-manager';
import { CesiumMap } from '../map';
import { CesiumWMSLayer } from './wms.layer';

export default {
  title: 'Cesium Map/Layers/WMSLayer',
  component: CesiumWMSLayer,
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

const optionsWMS = {
  url: 'https://ahocevar.com/geoserver/wms',
  layers: 'ne:NE1_HR_LC_SR_W_DR',
};

const optionsWMS2 = {
  url: 'https://ahocevar.com/geoserver/wms',
  layers: 'opengeo:countries',
};

const wmsLayerMeta = {
  id: 'wms-layer',
  layerRecord: {
    productName: 'WMS Layer',
  },
  options: { ...optionsWMS },
  searchLayerPredicate: (layer: ImageryLayer): boolean => {
    const provider = getImageryProvider(layer) as { layers?: string };
    return provider.layers === optionsWMS.layers;
  },
};

const wmsLayerMeta2 = {
  id: 'wms-layer-2',
  layerRecord: {
    productName: 'WMS Layer 2',
  },
  options: { ...optionsWMS2 },
  searchLayerPredicate: (layer: ImageryLayer): boolean => {
    const provider = getImageryProvider(layer) as { layers?: string };
    return provider.layers === optionsWMS2.layers;
  },
};

export const MapWithWMSLayers: Story = () => (
  <div style={mapDivStyle}>
    <CesiumMap
      imageryProvider={false}
      baseMaps={BASE_MAPS}
      layerManagerMetaMapping={layerManagerMetaMapping}
    >
      <CesiumWMSLayer options={optionsWMS} meta={wmsLayerMeta} />
      <CesiumWMSLayer options={optionsWMS2} alpha={0.3} meta={wmsLayerMeta2} />
    </CesiumMap>
  </div>
);
MapWithWMSLayers.storyName = 'WMS 2 layers';
